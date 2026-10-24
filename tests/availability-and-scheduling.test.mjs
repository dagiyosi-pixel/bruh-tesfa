// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Structured Availability & Schedule Matching Tests
// Tests validation, multiple intervals, overlapping intervals, timezone handling,
// date-specific blackouts, schedule matching, and unauthorized portal editing.
// =============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  timeStringToMinutes,
  minutesToTimeString,
  validateTimeInterval,
  mergeOverlappingIntervals,
  intervalsOverlap,
  getScheduleCompleteness,
  evaluateScheduleCompatibility,
  ETHIOPIA_TIMEZONE,
} from '../src/lib/availability.ts';

import {
  evaluateCandidateMatch,
  rankCandidatesForRequest,
} from '../src/lib/matching.ts';

import {
  updateTutorAvailability,
  confirmTutorAvailability,
  getTutorAvailability,
  lookupTutorPortalStatus,
  submitParentRequest,
} from '../src/lib/db/storage.ts';

// -----------------------------------------------------------------------------
// 1. Time & Interval Utilities Validation
// -----------------------------------------------------------------------------

test('Availability: Timezone is strictly Africa/Addis_Ababa', () => {
  assert.equal(ETHIOPIA_TIMEZONE, 'Africa/Addis_Ababa');
});

test('Availability: Parses 24-hour time strings to minutes and back accurately', () => {
  assert.equal(timeStringToMinutes('00:00'), 0);
  assert.equal(timeStringToMinutes('08:30'), 510);
  assert.equal(timeStringToMinutes('14:45'), 885);
  assert.equal(timeStringToMinutes('23:59'), 1439);

  // Invalid strings return -1
  assert.equal(timeStringToMinutes(''), -1);
  assert.equal(timeStringToMinutes('25:00'), -1);
  assert.equal(timeStringToMinutes('14:65'), -1);
  assert.equal(timeStringToMinutes('invalid'), -1);

  // Reverse conversion
  assert.equal(minutesToTimeString(0), '00:00');
  assert.equal(minutesToTimeString(510), '08:30');
  assert.equal(minutesToTimeString(885), '14:45');
  assert.equal(minutesToTimeString(1439), '23:59');
});

test('Availability: Validates time intervals and enforces minimum duration', () => {
  // Valid 2-hour interval
  const valid = validateTimeInterval({ start: '14:00', end: '16:00' }, 30);
  assert.equal(valid.isValid, true);

  // Invalid: start equals end (zero duration)
  const zeroDuration = validateTimeInterval({ start: '15:00', end: '15:00' }, 30);
  assert.equal(zeroDuration.isValid, false);
  assert.match(zeroDuration.error || '', /must be after start time/i);

  // Invalid: start is after end
  const inverted = validateTimeInterval({ start: '18:00', end: '16:00' }, 30);
  assert.equal(inverted.isValid, false);

  // Invalid: duration less than minimum (e.g. 20 mins < 30 mins)
  const tooShort = validateTimeInterval({ start: '14:00', end: '14:20' }, 30);
  assert.equal(tooShort.isValid, false);
  assert.match(tooShort.error || '', /at least 30 minutes/i);
});

// -----------------------------------------------------------------------------
// 2. Multiple Intervals & Overlap Resolution
// -----------------------------------------------------------------------------

test('Availability: Supports multiple distinct intervals per day', () => {
  const intervals = [
    { start: '09:00', end: '11:00', mode: 'in_person' },
    { start: '14:00', end: '16:00', mode: 'in_person' },
    { start: '18:00', end: '20:00', mode: 'online' },
  ];

  const merged = mergeOverlappingIntervals(intervals);
  assert.equal(merged.length, 3);
  assert.equal(merged[0].start, '09:00');
  assert.equal(merged[1].start, '14:00');
  assert.equal(merged[2].start, '18:00');
});

test('Availability: Predictably merges overlapping and contiguous intervals', () => {
  // Overlapping intervals: 14:00-16:00 and 15:30-17:30 should merge into 14:00-17:30
  const overlapping = [
    { start: '14:00', end: '16:00' },
    { start: '15:30', end: '17:30' },
  ];
  const result = mergeOverlappingIntervals(overlapping);
  assert.equal(result.length, 1);
  assert.equal(result[0].start, '14:00');
  assert.equal(result[0].end, '17:30');

  // Contiguous intervals: 16:00-17:00 and 17:00-18:00 should merge into 16:00-18:00
  const contiguous = [
    { start: '16:00', end: '17:00' },
    { start: '17:00', end: '18:00' },
  ];
  const contResult = mergeOverlappingIntervals(contiguous);
  assert.equal(contResult.length, 1);
  assert.equal(contResult[0].start, '16:00');
  assert.equal(contResult[0].end, '18:00');
});

test('Availability: Detects whether two time windows overlap by minimum threshold', () => {
  // 14:00-17:00 and 15:00-16:30 overlap by 90 minutes (>= 30 mins)
  assert.equal(
    intervalsOverlap({ start: '14:00', end: '17:00' }, { start: '15:00', end: '16:30' }, 30),
    true
  );

  // 14:00-15:00 and 16:00-18:00 have no overlap
  assert.equal(
    intervalsOverlap({ start: '14:00', end: '15:00' }, { start: '16:00', end: '18:00' }, 30),
    false
  );
});

// -----------------------------------------------------------------------------
// 3. Schedule Completeness & Tutor With No Schedule
// -----------------------------------------------------------------------------

test('Availability: Correctly reports schedule completeness levels', () => {
  // No schedule
  const none = getScheduleCompleteness(null);
  assert.equal(none.level, 'none');
  assert.equal(none.totalWeeklyHours, 0);

  // Basic schedule (1 day, 2 hours)
  const basic = getScheduleCompleteness({
    timezone: ETHIOPIA_TIMEZONE,
    schedule: {
      Saturday: [{ start: '10:00', end: '12:00' }],
    },
  });
  assert.equal(basic.level, 'basic');
  assert.equal(basic.totalWeeklyHours, 2);

  // Full schedule (4 days, 12 hours)
  const full = getScheduleCompleteness({
    timezone: ETHIOPIA_TIMEZONE,
    schedule: {
      Monday: [{ start: '16:00', end: '19:00' }],
      Wednesday: [{ start: '16:00', end: '19:00' }],
      Friday: [{ start: '16:00', end: '19:00' }],
      Saturday: [{ start: '09:00', end: '12:00' }],
    },
  });
  assert.equal(full.level, 'full');
  assert.equal(full.totalWeeklyHours, 12);
  assert.equal(full.availableDaysCount, 4);
});

// -----------------------------------------------------------------------------
// 4. Schedule-Aware Candidate Matching Engine
// -----------------------------------------------------------------------------

test('Matching: Full overlap with requested days and afternoon time window yields compatible status', () => {
  const parentSchedule = {
    preferred_days: ['Monday', 'Wednesday'],
    preferred_time_windows: ['Afternoon (14:00 - 17:00)'],
    schedule_flexibility: 'strict_times',
  };

  const tutorWeekly = {
    timezone: ETHIOPIA_TIMEZONE,
    schedule: {
      Monday: [{ start: '15:00', end: '18:00' }],
      Wednesday: [{ start: '15:00', end: '18:00' }],
      Saturday: [{ start: '09:00', end: '12:00' }],
    },
  };

  const evalResult = evaluateScheduleCompatibility(parentSchedule, tutorWeekly);
  assert.equal(evalResult.status, 'compatible');
  assert.equal(evalResult.score, 15);
  assert.deepEqual(evalResult.matchedDays, ['Monday', 'Wednesday']);
  assert.equal(evalResult.conflictingDays.length, 0);
  assert.match(evalResult.explanation, /Fully schedule-compatible/i);
});

test('Matching: Partial overlap with flexible preferred time window yields partially_compatible', () => {
  const parentSchedule = {
    preferred_days: ['Monday', 'Thursday'],
    preferred_time_windows: ['Afternoon'],
    schedule_flexibility: 'flexible_windows',
  };

  const tutorWeekly = {
    timezone: ETHIOPIA_TIMEZONE,
    schedule: {
      Monday: [{ start: '14:00', end: '17:00' }], // Overlaps Monday
      Wednesday: [{ start: '14:00', end: '17:00' }],
      // Thursday missing
    },
  };

  const evalResult = evaluateScheduleCompatibility(parentSchedule, tutorWeekly);
  assert.equal(evalResult.status, 'partially_compatible');
  assert.equal(evalResult.score, 10);
  assert.deepEqual(evalResult.matchedDays, ['Monday']);
  assert.deepEqual(evalResult.conflictingDays, ['Thursday']);
});

test('Matching: Strict schedule requirement with zero overlap yields conflict and score penalty', () => {
  const parentReq = {
    id: 'req-conflict-test',
    reference_number: 'BT-REQ-CONF',
    parent_name: 'Strict Family',
    phone: '+251 91 000 1122',
    preferred_contact_method: 'Phone',
    city: 'Addis Ababa',
    sub_city: 'Bole',
    subjects: ['Physics'],
    grade_level: 'Grades 11-12 (University Entrance / EUEE Prep)',
    curriculum: 'Ethiopian National Curriculum',
    teaching_mode: 'in_person',
    preferred_days: ['Tuesday', 'Thursday'],
    preferred_time_windows: ['Morning'],
    schedule_flexibility: 'strict_times',
    preferred_language: 'English',
    privacy_consent: true,
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const tutorWeekendOnly = {
    id: 'tut-weekend',
    reference_number: 'BT-TUT-WKD',
    full_legal_name: 'Weekend Only Tutor',
    public_display_name: 'Weekend Tutor',
    phone: '+251 91 888 7766',
    email: 'weekend@example.com',
    preferred_contact_channel: 'Telegram',
    city: 'Addis Ababa',
    sub_city: 'Bole',
    subjects: ['Physics'],
    grade_levels: ['Grades 11-12 (University Entrance / EUEE Prep)'],
    curricula: ['Ethiopian National Curriculum'],
    education_level: 'B.Sc.',
    institution: 'AAU',
    field_of_study: 'Physics',
    years_of_experience: 3,
    teaching_approach: 'Physics drills',
    bio: 'Weekend tutor',
    teaching_languages: ['English'],
    available_days: ['Saturday', 'Sunday'],
    weekly_availability: {
      timezone: ETHIOPIA_TIMEZONE,
      schedule: {
        Saturday: [{ start: '09:00', end: '13:00' }],
        Sunday: [{ start: '09:00', end: '13:00' }],
      },
    },
    teaching_modes: ['in_person'],
    travel_areas: ['Bole'],
    hourly_rate_etb: 400,
    privacy_consent: true,
    code_of_conduct_agreed: true,
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const match = evaluateCandidateMatch(parentReq, tutorWeekendOnly);
  assert.equal(match.schedule_status, 'conflict');
  assert.equal(match.breakdown.schedule_score, 0);
  assert.ok(match.breakdown.reasons.some((r) => r.includes('Schedule conflict')));
  // Sharp penalty applied to total_score for strict schedule conflict
  assert.ok(match.total_score <= 75, `Expected score penalty <= 75, got ${match.total_score}`);
});

test('Matching: Unconfigured tutor with no schedule is honestly flagged as unknown, not confirmed', () => {
  const parentSchedule = {
    preferred_days: ['Monday', 'Wednesday'],
    preferred_time_windows: ['Afternoon'],
    schedule_flexibility: 'flexible_windows',
  };

  const evalResult = evaluateScheduleCompatibility(parentSchedule, null, []);
  assert.equal(evalResult.status, 'unknown');
  assert.equal(evalResult.isSpecificConfirmationNeeded, true);
  assert.match(evalResult.explanation, /Schedule unknown/i);
});

// -----------------------------------------------------------------------------
// 5. Tutor Portal Authentication & Schedule Self-Service
// -----------------------------------------------------------------------------

test('Tutor Portal: Valid credentials authenticate applicant and return sanitized record', async () => {
  // tut-001 has reference BT-TUT-2026-0001 and phone +251 91 189 4521
  const auth = await lookupTutorPortalStatus('BT-TUT-2026-0001', '+251 91 189 4521');
  assert.equal(auth.success, true);
  assert.ok(auth.tutor);
  assert.equal(auth.tutor.public_display_name, 'Teacher Dagmawi');

  // CRITICAL PRIVACY CHECK: Private administrative notes must NEVER be returned to tutor portal
  assert.equal('admin_review_notes' in auth.tutor, false, 'Admin notes must never leak to tutor portal');
  assert.equal('national_id_doc_path' in auth.tutor, false, 'ID path must never leak to portal');
});

test('Tutor Portal: Rejects unauthorized access with incorrect reference or phone', async () => {
  // Wrong phone
  const badPhone = await lookupTutorPortalStatus('BT-TUT-2026-0001', '+251 99 999 9999');
  assert.equal(badPhone.success, false);
  assert.match(badPhone.error || '', /No matching application/i);

  // Missing fields
  const empty = await lookupTutorPortalStatus('', '');
  assert.equal(empty.success, false);
});

test('Tutor Schedule Update: Validates, merges, and updates schedule and blackout dates', async () => {
  const newWeekly = {
    timezone: ETHIOPIA_TIMEZONE,
    schedule: {
      Monday: [
        { start: '14:00', end: '16:00', mode: 'in_person' },
        { start: '15:30', end: '17:30', mode: 'in_person' }, // Overlaps with 14:00-16:00
      ],
      Tuesday: [{ start: '17:00', end: '19:00', mode: 'online' }],
    },
    min_lesson_duration_minutes: 60,
  };

  const blackouts = ['2026-05-15', '2026-05-16'];

  const res = await updateTutorAvailability('tut-001', newWeekly, blackouts);
  assert.equal(res.success, true);

  // Verify intervals on Monday were merged into 14:00-17:30
  const mondayIntervals = res.tutor.weekly_availability?.schedule?.Monday;
  assert.ok(mondayIntervals);
  assert.equal(mondayIntervals.length, 1);
  assert.equal(mondayIntervals[0].start, '14:00');
  assert.equal(mondayIntervals[0].end, '17:30');

  // Verify blackout dates
  assert.deepEqual(res.tutor.blackout_dates, blackouts);
});

test('Coordinator Verification: Confirms tutor availability and logs audit trail', async () => {
  const confirmed = await confirmTutorAvailability('tut-001', 'Verified with Dagmawi over phone call');
  assert.ok(confirmed.availability_confirmed_at);
  assert.equal(confirmed.availability_notes, 'Verified with Dagmawi over phone call');
});

test('Parent Request: Submitting structured schedule preferences saves correctly', async () => {
  const reqResult = await submitParentRequest({
    parent_name: 'W/ro Makeda',
    phone: '+251 91 555 1234',
    preferred_contact_method: 'Telegram',
    city: 'Addis Ababa',
    sub_city: 'Kirkos',
    subjects: ['Mathematics'],
    grade_level: 'Grades 7-8 (Middle School / Ministry Prep)',
    curriculum: 'Ethiopian National Curriculum',
    teaching_mode: 'in_person',
    preferred_days: ['Saturday', 'Sunday'],
    preferred_time_windows: ['Morning (09:00 - 12:00)'],
    schedule_flexibility: 'weekends_only',
    earliest_start_date: '2026-04-01',
    hours_per_session: 2.0,
    lessons_per_week: 2,
    privacy_consent: true,
  });

  assert.equal(reqResult.success, true);
  assert.match(reqResult.reference_number, /^BT-REQ-2026-\d{4}$/);
});
