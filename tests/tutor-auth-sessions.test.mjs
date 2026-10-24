import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  verifyPassword,
  createTutorSessionToken,
  verifyTutorTokenString,
} from '../src/lib/auth.ts';
import { checkRateLimit } from '../src/lib/rate-limit.ts';
import {
  authenticateTutor,
  setTutorPassword,
  getTutorById,
  getTutorVacancyApplications,
  lookupParentRequestStatus,
  getAdminTutorApplications,
  getAdminParentRequests,
} from '../src/lib/db/storage.ts';

test('Tutor Password Hashing & Verification: Secure scrypt with salt', () => {
  const password = 'StrongTutorPassword#2026';
  const hash = hashPassword(password);

  assert.ok(hash.includes(':'), 'Hash must contain salt delimiter');
  assert.equal(hash.split(':').length, 2, 'Hash must consist of salt and derived key');

  // Verify correct password
  assert.equal(verifyPassword(password, hash), true, 'Correct password must verify');

  // Reject wrong password
  assert.equal(verifyPassword('WrongPassword123', hash), false, 'Wrong password must be rejected');

  // Reject malformed hash
  assert.equal(verifyPassword(password, 'invalidhash'), false, 'Malformed hash must be rejected');
});

test('Tutor Session Token: HMAC-SHA256 signature and integrity check', () => {
  const tutorId = 'tut-001';
  const phone = '0911223344';

  const token = createTutorSessionToken(tutorId, phone);
  assert.ok(token, 'Must return signed token');

  const verified = verifyTutorTokenString(token);
  assert.equal(verified.isAuthenticated, true, 'Valid token must be verified');
  assert.equal(verified.tutorId, 'tut-001');
  assert.equal(verified.phone, '0911223344');

  // Tampered payload
  const decoded = Buffer.from(token, 'base64').toString('utf-8');
  const parts = decoded.split(':');
  parts[1] = 'tut-attacker'; // Change tutor ID
  const tamperedToken = Buffer.from(parts.join(':')).toString('base64');
  const tamperedResult = verifyTutorTokenString(tamperedToken);
  assert.equal(tamperedResult.isAuthenticated, false, 'Tampered token must be rejected');

  // Expired token (simulate timestamp from 31 days ago)
  const expiredTs = (Date.now() - 32 * 24 * 60 * 60 * 1000).toString();
  const fakeToken = Buffer.from(`tutor:${tutorId}:${phone}:${expiredTs}:fakehash`).toString('base64');
  const expiredResult = verifyTutorTokenString(fakeToken);
  assert.equal(expiredResult.isAuthenticated, false, 'Expired token must be rejected');
});

test('Tutor Authentication Flow: Supports password and fallback lookup', async () => {
  const tutors = await getAdminTutorApplications();
  const testTutor = tutors[0];
  assert.ok(testTutor, 'Need at least one seed tutor');

  // 1. Initial login with reference number and phone number
  const initialAuth = await authenticateTutor(testTutor.reference_number, testTutor.phone);
  assert.equal(initialAuth.success, true, 'Initial phone/ref login must succeed');
  assert.equal(initialAuth.tutor?.id, testTutor.id);

  // 2. Reject wrong credentials
  const badAuth = await authenticateTutor(testTutor.reference_number, '0900000000');
  assert.equal(badAuth.success, false, 'Invalid credentials must fail');

  // 3. Set tutor password
  const newPass = 'MySafeTutorSecret2026!';
  const newHash = hashPassword(newPass);
  const passResult = await setTutorPassword(testTutor.id, newHash);
  assert.equal(passResult.success, true, 'Setting password must succeed');

  // 4. Authenticate with newly set password
  const passAuth = await authenticateTutor(testTutor.reference_number, newPass);
  assert.equal(passAuth.success, true, 'Password authentication must succeed');
  assert.equal(passAuth.tutor?.id, testTutor.id);

  // 5. Authenticate using email and password
  const emailAuth = await authenticateTutor(testTutor.email, newPass);
  assert.equal(emailAuth.success, true, 'Email + password authentication must succeed');
});

test('Tutor Data Isolation: Tutors only receive their own vacancy applications', async () => {
  const tutors = await getAdminTutorApplications();
  const tutor1 = tutors[0];
  const tutor2 = tutors[1];

  const apps1 = await getTutorVacancyApplications(tutor1.id, tutor1.phone);
  const apps2 = await getTutorVacancyApplications(tutor2.id, tutor2.phone);

  // Every application in apps1 must belong to tutor1
  for (const app of apps1) {
    const isOwner = app.tutor_id === tutor1.id || app.applicant_phone.replace(/[\s\-\(\)]/g, '') === tutor1.phone.replace(/[\s\-\(\)]/g, '');
    assert.equal(isOwner, true, 'Tutor 1 can only access own applications');
  }

  // Every application in apps2 must belong to tutor2
  for (const app of apps2) {
    const isOwner = app.tutor_id === tutor2.id || app.applicant_phone.replace(/[\s\-\(\)]/g, '') === tutor2.phone.replace(/[\s\-\(\)]/g, '');
    assert.equal(isOwner, true, 'Tutor 2 can only access own applications');
  }
});

test('Parent Request Status Lookup: Sanitizes sensitive details and reports accurate state', async () => {
  const requests = await getAdminParentRequests();
  const sampleReq = requests[0];
  assert.ok(sampleReq, 'Need at least one seed parent request');

  const result = await lookupParentRequestStatus(sampleReq.reference_number);
  assert.equal(result.success, true, 'Status lookup must succeed with valid reference');
  assert.ok(result.request);
  assert.equal(result.request.reference_number, sampleReq.reference_number);
  assert.equal(result.request.status, sampleReq.status);

  // Security check: phone number must NOT be exposed in result
  assert.equal('phone' in result.request, false, 'Parent phone must not be exposed');
  // Security check: admin notes must NOT be exposed in result
  assert.equal('admin_notes' in result.request, false, 'Admin notes must not be exposed');

  // Phone verification check
  const verifiedResult = await lookupParentRequestStatus(sampleReq.reference_number, sampleReq.phone);
  assert.equal(verifiedResult.request?.phone_verified, true, 'Matching phone should flag phone_verified=true');

  // Non-existent reference
  const missingResult = await lookupParentRequestStatus('BT-REQ-9999-9999');
  assert.equal(missingResult.success, false, 'Non-existent reference must fail gracefully');
});
