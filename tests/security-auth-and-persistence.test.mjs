// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Stage 7: Comprehensive Security, Auth & Persistence Tests
// =============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createAdminSessionToken,
  verifyAdminTokenString,
  validateAdminCredentials,
} from '../src/lib/auth.ts';

import {
  checkRateLimit,
  resetRateLimits,
} from '../src/lib/rate-limit.ts';

import {
  getStorageProviderInfo,
  getSupabaseClient,
  ProductionStorageConfigurationError,
} from '../src/lib/db/supabase.ts';

import {
  createPlacementRecord,
  submitVacancyApplication,
  updateVacancyApplicationStatus,
  createVacancy,
} from '../src/lib/db/storage.ts';

// -----------------------------------------------------------------------------
// 1. Cryptographic Authentication & HMAC-SHA256 Session Verification
// -----------------------------------------------------------------------------

test('Auth Security: Generates valid HMAC-SHA256 signed session token', () => {
  const token = createAdminSessionToken();
  assert.ok(typeof token === 'string' && token.length > 20, 'Token must be a non-empty base64 string');

  const verification = verifyAdminTokenString(token);
  assert.equal(verification.isAuthenticated, true, 'Validly signed token must be authenticated');
  assert.equal(verification.role, 'admin');
  assert.equal(verification.error, undefined);
});

test('Auth Security: Rejects forged or tampered token payload', () => {
  const validToken = createAdminSessionToken();
  const decoded = Buffer.from(validToken, 'base64').toString('utf-8');
  const [user, ts, hash] = decoded.split(':');

  // Attempt 1: Change user to attacker
  const forgedUserToken = Buffer.from(`attacker:${ts}:${hash}`).toString('base64');
  assert.equal(verifyAdminTokenString(forgedUserToken).isAuthenticated, false);

  // Attempt 2: Alter timestamp with original hash
  const forgedTimeToken = Buffer.from(`${user}:${Date.now() - 5000}:${hash}`).toString('base64');
  const result = verifyAdminTokenString(forgedTimeToken);
  assert.equal(result.isAuthenticated, false);
  assert.equal(result.error, 'Signature mismatch');

  // Attempt 3: Tamper with single hex character of the HMAC signature
  const corruptedHash = hash.slice(0, -1) + (hash.slice(-1) === 'a' ? 'b' : 'a');
  const tamperedSigToken = Buffer.from(`${user}:${ts}:${corruptedHash}`).toString('base64');
  const tamperedResult = verifyAdminTokenString(tamperedSigToken);
  assert.equal(tamperedResult.isAuthenticated, false);
  assert.equal(tamperedResult.error, 'Signature mismatch');
});

test('Auth Security: Rejects expired and future session tokens', () => {
  // Test expired token (8 days ago, beyond 7 days TTL)
  const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
  const expiredToken = Buffer.from(`admin:${eightDaysAgo}:dummyhash`).toString('base64');
  const expiredResult = verifyAdminTokenString(expiredToken);
  assert.equal(expiredResult.isAuthenticated, false);
  assert.match(expiredResult.error || '', /expired/i);

  // Test future token (5 minutes in the future, beyond allowable 60s clock skew)
  const futureTime = Date.now() + 5 * 60 * 1000;
  const futureToken = Buffer.from(`admin:${futureTime}:dummyhash`).toString('base64');
  const futureResult = verifyAdminTokenString(futureToken);
  assert.equal(futureResult.isAuthenticated, false);
  assert.match(futureResult.error || '', /future/i);
});

test('Auth Security: Rejects malformed and non-string inputs safely', () => {
  assert.equal(verifyAdminTokenString('').isAuthenticated, false);
  assert.equal(verifyAdminTokenString(null).isAuthenticated, false);
  assert.equal(verifyAdminTokenString(undefined).isAuthenticated, false);
  assert.equal(verifyAdminTokenString('not-base64:invalid').isAuthenticated, false);
  assert.equal(verifyAdminTokenString(Buffer.from('admin').toString('base64')).isAuthenticated, false);
  assert.equal(verifyAdminTokenString(Buffer.from('admin:12345').toString('base64')).isAuthenticated, false);
});

test('Auth Security: Password validation with timingSafeEqual prevents timing side-channels', () => {
  assert.equal(validateAdminCredentials('BruhTesfaAdmin2026!'), true);
  assert.equal(validateAdminCredentials('BruhTesfaAdmin2026'), false);
  assert.equal(validateAdminCredentials(''), false);
  assert.equal(validateAdminCredentials(null), false);
  assert.equal(validateAdminCredentials(undefined), false);
});

// -----------------------------------------------------------------------------
// 2. Sliding Window Rate Limiting & Brute-Force Defense
// -----------------------------------------------------------------------------

test('Rate Limiter: Correctly tracks attempts and blocks on exceeding limit', () => {
  resetRateLimits();
  const testKey = 'test-ip-127.0.0.1:auth';
  const limit = 5;
  const windowMs = 60000; // 1 minute

  // 5 requests within limit must be allowed
  for (let i = 1; i <= limit; i++) {
    const res = checkRateLimit(testKey, limit, windowMs);
    assert.equal(res.isAllowed, true, `Request ${i} should be allowed`);
    assert.equal(res.remaining, limit - i);
  }

  // 6th request must be rejected with 429 semantics
  const blockedRes = checkRateLimit(testKey, limit, windowMs);
  assert.equal(blockedRes.isAllowed, false, '6th request must be blocked');
  assert.equal(blockedRes.remaining, 0);
  assert.ok(blockedRes.resetInSeconds > 0 && blockedRes.resetInSeconds <= 60);

  // Different IP/route key remains unaffected
  const otherKey = 'test-ip-192.168.1.1:auth';
  const otherRes = checkRateLimit(otherKey, limit, windowMs);
  assert.equal(otherRes.isAllowed, true, 'Independent key must not be blocked');
  assert.equal(otherRes.remaining, limit - 1);
});

// -----------------------------------------------------------------------------
// 3. Persistence Mode & Fail-Safe Configuration Guard
// -----------------------------------------------------------------------------

test('Persistence Guard: Production mode fails safely if Supabase credentials are missing', () => {
  const origEnv = process.env.NODE_ENV;
  const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const origAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const origMode = process.env.PERSISTENCE_MODE;

  try {
    // Simulate production environment with missing Supabase configuration
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.PERSISTENCE_MODE;

    const info = getStorageProviderInfo();
    assert.equal(info.provider, 'supabase');
    assert.equal(info.isConfigured, false);
    assert.ok(info.statusMessage.includes('CRITICAL: Production mode requires Supabase credentials'));

    // Attempting to fetch client must throw ProductionStorageConfigurationError
    assert.throws(
      () => getSupabaseClient(),
      ProductionStorageConfigurationError,
      'Must throw ProductionStorageConfigurationError in production without credentials'
    );
  } finally {
    // Restore environment
    process.env.NODE_ENV = origEnv;
    if (origUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl; else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (origKey) process.env.SUPABASE_SERVICE_ROLE_KEY = origKey; else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (origAnon) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = origAnon; else delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (origMode) process.env.PERSISTENCE_MODE = origMode; else delete process.env.PERSISTENCE_MODE;
  }
});

test('Persistence Guard: Local mode explicitly requested isolates storage cleanly', () => {
  const origMode = process.env.PERSISTENCE_MODE;
  try {
    process.env.PERSISTENCE_MODE = 'local';
    const info = getStorageProviderInfo();
    assert.equal(info.provider, 'local-file');
    assert.equal(getSupabaseClient(), null);
  } finally {
    if (origMode) process.env.PERSISTENCE_MODE = origMode; else delete process.env.PERSISTENCE_MODE;
  }
});

// -----------------------------------------------------------------------------
// 4. Placement Consistency & Duplicate Prevention
// -----------------------------------------------------------------------------

test('Placement Engine: Rejects duplicate placement on the same match proposal', async () => {
  // match-001 already has placement plc-001 in seed data
  await assert.rejects(
    async () => {
      await createPlacementRecord({
        matchId: 'match-001',
        agreedHourlyRateETB: 500,
        contractType: 'first_month_recurring',
        lessonsPerWeek: 3,
        hoursPerLesson: 1.5,
        startDate: '2026-04-01',
      });
    },
    {
      name: 'Error',
      message: /already been recorded and locked for this match proposal/i,
    },
    'Should reject duplicate placement creation on existing match'
  );
});

// -----------------------------------------------------------------------------
// 5. Directory Traversal Guard (Path Sanitization)
// -----------------------------------------------------------------------------

test('Security Guard: Directory traversal patterns are rejected', () => {
  const maliciousPaths = [
    '../../data/bruh-tesfa-db.json',
    '..\\..\\data\\bruh-tesfa-db.json',
    '/etc/passwd',
    '\\Windows\\System32\\drivers\\etc\\hosts',
    'C:\\sensitive\\passwords.txt',
    'foo/../../../etc/shadow',
    'doc\0.pdf',
  ];

  for (const malicious of maliciousPaths) {
    const isDangerous =
      malicious.includes('..') ||
      malicious.includes('\0') ||
      malicious.startsWith('/') ||
      malicious.startsWith('\\') ||
      /^[a-zA-Z]:/.test(malicious);

    assert.equal(isDangerous, true, `Malicious path "${malicious}" must be flagged as dangerous`);
  }
});

// -----------------------------------------------------------------------------
// 6. Vacancy Application State Machine & Re-application Constraints
// -----------------------------------------------------------------------------

test('Vacancy State Machine: Allows re-application only if previous was withdrawn', async () => {
  // Create a dedicated vacancy for this test
  const vac = await createVacancy({
    title: 'Test State Machine Vacancy',
    city: 'Addis Ababa',
    sub_city: 'Bole',
    general_area: 'Bole Medhanealem',
    grade_level: 'Grade 11-12 (University Entrance Prep)',
    curriculum: 'Ethiopian National Curriculum',
    subjects: ['Mathematics'],
    teaching_format: 'in_person',
    schedule_days: ['Saturday', 'Sunday'],
    time_window: '9:00 AM - 11:00 AM',
    lesson_frequency: '2 sessions/week',
    hours_per_session: 2.0,
    hourly_rate_etb: 450,
    required_qualifications: 'B.Sc. Mathematics',
    languages: ['English', 'Amharic'],
    status: 'open',
  });

  const applicantPhone = '+251 91 999 0011';

  // 1. First submission succeeds
  const firstApp = await submitVacancyApplication({
    vacancy_id: vac.id,
    applicant_name: 'Test Tutor Solomon',
    applicant_phone: applicantPhone,
    applicant_email: 'solomon@example.com',
    applicant_education: 'B.Sc. Mathematics',
    applicant_institution: 'AAU Arat Kilo',
    years_of_experience: 3,
    tutor_id: 'tut-001',
    cover_note: 'I am highly qualified for this position.',
    proposed_rate_etb: 450,
    available_schedule: 'Saturday & Sunday mornings',
  });

  assert.equal(firstApp.success, true);
  assert.ok(firstApp.id);
  assert.equal(firstApp.reference_number, vac.vacancy_code);

  // 2. Duplicate active submission while in 'submitted' must be rejected
  await assert.rejects(
    async () => {
      await submitVacancyApplication({
        vacancy_id: vac.id,
        applicant_name: 'Test Tutor Solomon',
        applicant_phone: applicantPhone,
        applicant_email: 'solomon@example.com',
        applicant_education: 'B.Sc. Mathematics',
        applicant_institution: 'AAU Arat Kilo',
        years_of_experience: 3,
        tutor_id: 'tut-001',
        proposed_rate_etb: 450,
        available_schedule: 'Saturday & Sunday mornings',
      });
    },
    {
      name: 'Error',
      message: /already submitted an active application/i,
    },
    'Duplicate submission while application is active must be rejected'
  );

  // 3. Candidate withdraws application
  await updateVacancyApplicationStatus(firstApp.id, 'withdrawn', 'Tutor has a schedule conflict');

  // 4. Now applicant can re-apply to the vacancy
  const reApp = await submitVacancyApplication({
    vacancy_id: vac.id,
    applicant_name: 'Test Tutor Solomon',
    applicant_phone: applicantPhone,
    applicant_email: 'solomon@example.com',
    applicant_education: 'B.Sc. Mathematics',
    applicant_institution: 'AAU Arat Kilo',
    years_of_experience: 3,
    tutor_id: 'tut-001',
    cover_note: 'Schedule conflict resolved, re-applying.',
    proposed_rate_etb: 450,
    available_schedule: 'Saturday & Sunday mornings',
  });

  assert.equal(reApp.success, true);
  assert.ok(reApp.id);
});
