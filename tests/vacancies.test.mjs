// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Tutoring Vacancy & Telegram Module Test Suite
// =============================================================================

process.env.IS_TEST = 'true';
process.env.PERSISTENCE_MODE = 'local';

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createVacancy,
  getPublicVacancies,
  getPublicVacancyByCode,
  updateVacancyStatus,
  convertParentRequestToVacancy,
  submitVacancyApplication,
  updateVacancyApplicationStatus,
  getVacancyApplications,
  submitParentRequest,
} from '../src/lib/db/storage.ts';

import {
  generateTelegramVacancyAnnouncement,
} from '../src/lib/telegram.ts';

test('Vacancy Module: Admin can create and filter vacancies by sub-city, subject, and status', async () => {
  const newVac = await createVacancy({
    title: 'Grade 10 IGCSE Chemistry & Physics Tutor - Old Airport',
    city: 'Addis Ababa',
    sub_city: 'Kirkos',
    general_area: 'Old Airport, near ICS',
    grade_level: 'Grade 9-10 (IGCSE / Secondary)',
    curriculum: 'Cambridge IGCSE / International',
    subjects: ['Chemistry', 'Physics'],
    teaching_format: 'in_person',
    schedule_days: ['Tuesday', 'Thursday', 'Saturday'],
    time_window: '5:00 PM - 6:30 PM',
    lesson_frequency: '3 days per week (1.5 hrs each)',
    hours_per_session: 1.5,
    expected_duration_months: 6,
    hourly_rate_etb: 600,
    total_estimated_budget_etb: 10800,
    required_qualifications: 'B.Sc. in Chemistry/Physics with Cambridge IGCSE track record',
    languages: ['English'],
    parent_preferences: 'Focus on laboratory past papers and exam technique.',
    application_instructions: 'Apply online with IGCSE tutoring experience.',
    status: 'open',
  });

  assert.ok(newVac.id, 'Vacancy should have generated ID');
  assert.match(newVac.vacancy_code, /^BT-VAC-2026-\d{4}$/, 'Code should follow format BT-VAC-2026-XXXX');
  assert.equal(newVac.status, 'open');
  assert.equal(newVac.view_count, 0);

  // Query public vacancies with filters
  const kirkosVacancies = await getPublicVacancies({ subCity: 'Kirkos' });
  const found = kirkosVacancies.find((v) => v.id === newVac.id);
  assert.ok(found, 'New vacancy should be retrievable by sub-city');

  const chemistryVacancies = await getPublicVacancies({ subject: 'Chemistry' });
  assert.ok(chemistryVacancies.some((v) => v.id === newVac.id), 'Vacancy should be searchable by subject');

  // Verify view count increments
  const beforeView = found.view_count;
  const fetched = await getPublicVacancyByCode(newVac.vacancy_code, true);
  assert.ok(fetched, 'Vacancy should be fetched by unique code');
  assert.equal(fetched.view_count, beforeView + 1, 'View count should increment on public fetch');
});

test('Vacancy Privacy & Sanitization: Parent request conversion strips private family data', async () => {
  // Create a parent request with sensitive contact and private notes
  const parentReq = await submitParentRequest({
    parent_name: 'Woizero Aster Tesfaye (PRIVATE)',
    phone: '+251 91 999 8888',
    preferred_contact_method: 'Phone Call',
    city: 'Addis Ababa',
    sub_city: 'Yeka',
    general_area: 'Megenagna behind Diaspora square, House #402',
    subjects: ['Mathematics', 'English'],
    grade_level: 'Grade 8 (Ministry Exam Prep)',
    curriculum: 'Ethiopian National Curriculum',
    student_count: 1,
    teaching_mode: 'in_person',
    preferred_language: 'Amharic (አማርኛ)',
    schedule_preference: 'Monday, Wednesday, Friday after 4 PM',
    lesson_frequency: '3 days per week',
    budget_range_max: 450,
    learning_goals: 'Private note: Student struggles with algebra word problems and needs gentle patience.',
    privacy_consent: true,
  });

  assert.ok(parentReq.id);

  // Convert parent request into vacancy draft
  const vacancyDraft = await convertParentRequestToVacancy(parentReq.id);
  assert.ok(vacancyDraft, 'Conversion should return a vacancy draft');

  // Strict Privacy Verification:
  // 1. Vacancy must NOT contain parent full legal name
  assert.ok(!JSON.stringify(vacancyDraft).includes('Woizero Aster Tesfaye'), 'Private parent name must not be present');
  // 2. Vacancy must NOT contain private telephone number
  assert.ok(!JSON.stringify(vacancyDraft).includes('+251 91 999 8888'), 'Family phone must not be present');
  // 3. Vacancy must NOT expose exact house address
  assert.ok(!JSON.stringify(vacancyDraft).includes('House #402'), 'Exact house address must not be exposed');
  // 4. Must start in 'draft' status so admin moderates before public posting
  assert.equal(vacancyDraft.status, 'draft', 'New converted vacancy must be in draft status');
  // 5. Must retain necessary academic and geographical criteria
  assert.equal(vacancyDraft.sub_city, 'Yeka');
  assert.deepEqual(vacancyDraft.subjects, ['Mathematics', 'English']);
  assert.equal(vacancyDraft.grade_level, 'Grade 8 (Ministry Exam Prep)');
});

test('Vacancy Application Flow: Submits application and prevents duplicate active applications', async () => {
  // Create an open vacancy
  const vacancy = await createVacancy({
    title: 'Grade 12 EUEE Biology Tutor - Bole',
    city: 'Addis Ababa',
    sub_city: 'Bole',
    general_area: 'Bole Atlas',
    grade_level: 'Grade 11-12 (University Entrance / EUEE Prep)',
    curriculum: 'Ethiopian National Curriculum',
    subjects: ['Biology'],
    teaching_format: 'in_person',
    schedule_days: ['Saturday', 'Sunday'],
    time_window: 'Morning 9:00 AM',
    lesson_frequency: '2 days per week (2 hrs each)',
    hours_per_session: 2,
    expected_duration_months: 4,
    hourly_rate_etb: 500,
    required_qualifications: 'Medical or Biology degree with high EUEE score',
    languages: ['Amharic (አማርኛ)', 'English'],
    status: 'open',
  });

  const applicantPhone = '+251 94 411 2233';

  // 1. Submit first valid application
  const appResult = await submitVacancyApplication({
    vacancy_id: vacancy.id,
    applicant_name: 'Dr. Yared Bekele',
    applicant_phone: applicantPhone,
    applicant_email: 'yared.b@example.com',
    applicant_education: 'Doctor of Medicine (M.D.)',
    applicant_institution: 'Addis Ababa University, Tikur Anbessa',
    years_of_experience: 4,
    proposed_rate_etb: 500,
    available_schedule: 'Weekends 9am-12pm',
    cover_note: 'I scored 642 on EUEE and have guided 15+ students into AAU Medical Faculty.',
    referral_source: 'Telegram Channel',
    utm_source: 'telegram',
    utm_campaign: 'weekend_vacancies',
  });

  assert.ok(appResult.success, 'First application should succeed');
  assert.ok(appResult.id, 'Should receive application ID');

  // 2. Attempt duplicate application from the same applicant phone to the same vacancy
  await assert.rejects(
    async () => {
      await submitVacancyApplication({
        vacancy_id: vacancy.id,
        applicant_name: 'Dr. Yared Bekele (Duplicate)',
        applicant_phone: applicantPhone,
        applicant_education: 'Doctor of Medicine (M.D.)',
        applicant_institution: 'Addis Ababa University',
        years_of_experience: 4,
        proposed_rate_etb: 500,
        cover_note: 'Submitting again',
      });
    },
    /already submitted an active application/,
    'Should reject duplicate active application from same phone'
  );

  // 3. Mark the first application as withdrawn
  await updateVacancyApplicationStatus(appResult.id, 'withdrawn', 'Tutor withdrew due to schedule change');

  // 4. Now a new application from the same phone should be permitted
  const reAppResult = await submitVacancyApplication({
    vacancy_id: vacancy.id,
    applicant_name: 'Dr. Yared Bekele',
    applicant_phone: applicantPhone,
    applicant_education: 'Doctor of Medicine (M.D.)',
    applicant_institution: 'Addis Ababa University',
    years_of_experience: 4,
    proposed_rate_etb: 500,
    cover_note: 'Re-applying with updated Sunday afternoon availability.',
  });

  assert.ok(reAppResult.success, 'Re-application after withdrawal should succeed');
});

test('Vacancy Matching & Lifecycle: Admin status transition automatically fills vacancy when candidate selected', async () => {
  const vacancy = await createVacancy({
    title: 'Grade 6 Primary Math & English - Sarbet',
    city: 'Addis Ababa',
    sub_city: 'Nifas Silk-Lafto',
    grade_level: 'Grade 5-6 (Upper Primary)',
    curriculum: 'Ethiopian National Curriculum',
    subjects: ['Mathematics', 'English'],
    teaching_format: 'in_person',
    schedule_days: ['Monday', 'Wednesday'],
    time_window: '4:30 PM',
    lesson_frequency: '2 days per week',
    hours_per_session: 1.5,
    expected_duration_months: 3,
    hourly_rate_etb: 400,
    required_qualifications: 'Degree in Education or English',
    languages: ['English', 'Amharic (አማርኛ)'],
    status: 'open',
  });

  const app = await submitVacancyApplication({
    vacancy_id: vacancy.id,
    applicant_name: 'Bethlehem Tadesse',
    applicant_phone: '+251 92 333 4455',
    applicant_education: 'B.Ed. in Primary Education',
    applicant_institution: 'Kotebe Metropolitan University',
    years_of_experience: 3,
    proposed_rate_etb: 400,
    cover_note: 'Patient primary educator with proven results in foundational literacy.',
  });

  // Verify initial status
  let apps = await getVacancyApplications(vacancy.id);
  assert.equal(apps[0].status, 'submitted');

  // Transition to shortlisted
  await updateVacancyApplicationStatus(app.id, 'shortlisted', 'Qualifications verified and location ideal.');
  apps = await getVacancyApplications(vacancy.id);
  assert.equal(apps[0].status, 'shortlisted');

  // Transition to selected (candidate matched and placement agreed)
  await updateVacancyApplicationStatus(app.id, 'selected', 'Family approved candidate after introductory call.');
  apps = await getVacancyApplications(vacancy.id);
  assert.equal(apps[0].status, 'selected');

  // Verify vacancy status automatically transitioned to 'filled'
  const updatedVac = await getPublicVacancyByCode(vacancy.vacancy_code, false);
  assert.equal(updatedVac?.status, 'filled', 'Vacancy should be marked as filled upon candidate selection');
  assert.ok(updatedVac?.closed_at, 'Vacancy closed_at should be recorded');
});

test('Telegram Generator: Produces compliant announcement without sensitive family data', () => {
  const mockVacancy = {
    id: 'vac-tg-test',
    vacancy_code: 'BT-VAC-2026-0099',
    title: 'Grade 11 SAT Mathematics Prep - Bole Medhanialem',
    city: 'Addis Ababa',
    sub_city: 'Bole',
    general_area: 'Near Medhanialem Cathedral',
    grade_level: 'Grades 11-12 (University Entrance / EUEE Prep)',
    curriculum: 'Cambridge / International',
    subjects: ['SAT Math', 'Algebra II'],
    teaching_format: 'in_person',
    schedule_days: ['Monday', 'Wednesday', 'Friday'],
    time_window: '5:00 PM - 6:30 PM',
    lesson_frequency: '3 days per week (1.5 hrs each)',
    hours_per_session: 1.5,
    expected_duration_months: 3,
    hourly_rate_etb: 550,
    total_estimated_budget_etb: 9900,
    required_qualifications: 'B.Sc. in Mathematics or Engineering with SAT score >= 750',
    languages: ['English'],
    parent_preferences: 'Seeking tutor with recent SAT testing experience.',
    application_deadline: 'November 15, 2026',
    status: 'open',
    view_count: 42,
    application_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const text = generateTelegramVacancyAnnouncement(mockVacancy, 'https://bruhtesfa.et');

  // Brand and headers
  assert.ok(text.includes('BRUH TESFA'), 'Must contain exact brand name BRUH TESFA');
  assert.ok(text.includes('ብሩህ ተስፋ'), 'Must contain Amharic brand name');
  assert.ok(text.includes('BT-VAC-2026-0099'), 'Must contain vacancy code');

  // Key fields
  assert.ok(text.includes('Bole'), 'Must contain sub-city');
  assert.ok(text.includes('SAT Math, Algebra II'), 'Must contain subjects');
  assert.ok(text.includes('550 ETB / hour'), 'Must contain rate');
  assert.ok(text.includes('Proc. No. 1321/2024'), 'Must cite Ethiopian child safeguarding proclamation');
  assert.ok(text.includes('https://bruhtesfa.et/vacancies/BT-VAC-2026-0099?utm_source=telegram'), 'Must include trackable apply link');

  // Privacy verification: zero phone numbers or parent names in the text
  assert.ok(!text.includes('Aster'), 'Must not have parent name');
  assert.ok(!text.includes('+251 91'), 'Must not have phone number');
});
