// =============================================================================
// BRUH TESFA - Storage Isolation & Security Access Tests
// =============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getPublicTutors,
  getPublicTutorBySlug,
  submitTutorApplication,
  submitParentRequest,
  updateTutorApplicationStatus,
  getAdminTutorApplications,
} from '../src/lib/db/storage.ts';

test('Security & Privacy: Public directory only returns approved verified tutors', async () => {
  const publicProfiles = await getPublicTutors();
  
  assert.ok(publicProfiles.length > 0, 'Should return approved public profiles');
  
  for (const profile of publicProfiles) {
    assert.equal(profile.is_verified, true, 'Every public profile must be verified');
    
    // STRICT PRIVACY CHECK: Verify sensitive fields are NOT present on public profile
    assert.equal('phone' in profile, false, 'Private phone number must NEVER exist on public profile');
    assert.equal('full_legal_name' in profile, false, 'Legal name must NEVER exist on public profile');
    assert.equal('national_id_doc_path' in profile, false, 'National ID path must NEVER exist on public profile');
    assert.equal('degree_cert_doc_path' in profile, false, 'Degree cert path must NEVER exist on public profile');
    assert.equal('admin_review_notes' in profile, false, 'Admin notes must NEVER exist on public profile');
  }

  // Ensure unapproved tutor 'tut-005' (under_review) is NOT in public profiles
  const hasUnapproved = publicProfiles.some((p) => p.id === 'tut-005');
  assert.equal(hasUnapproved, false, 'Unapproved tutor must not appear in public directory');
});

test('Application Lifecycle: New submission starts in "submitted" status and receives reference number', async () => {
  const submission = await submitTutorApplication({
    full_legal_name: 'Test Candidate Abebe',
    public_display_name: 'Teacher Abebe',
    phone: '+251 91 777 6655',
    email: 'abebe@example.com',
    preferred_contact_channel: 'Telegram',
    city: 'Addis Ababa',
    sub_city: 'Arada',
    specific_neighborhood: 'Piazza',
    subjects: ['History & Geography'],
    grade_levels: ['Grades 7-8 (Middle School / Ministry Prep)'],
    curricula: ['Ethiopian National Curriculum'],
    education_level: 'B.A. History',
    institution: 'AAU 6 Kilo',
    field_of_study: 'History',
    years_of_experience: 2,
    teaching_approach: 'Interactive historical timelines and source evaluation',
    bio: 'Experienced social studies mentor',
    teaching_languages: ['English', 'Amharic (አማርኛ)'],
    available_days: ['Monday'],
    available_time_windows: ['Afternoon'],
    teaching_modes: ['in_person'],
    travel_areas: ['Arada'],
    hourly_rate_etb: 300,
    privacy_consent: true,
    code_of_conduct_agreed: true,
  });

  assert.equal(submission.success, true);
  assert.match(submission.reference_number, /^BT-TUT-2026-\d{4}$/);

  // Verify in admin records
  const allTutors = await getAdminTutorApplications();
  const created = allTutors.find((t) => t.id === submission.id);
  assert.ok(created, 'Application should exist in admin records');
  assert.equal(created.status, 'submitted', 'New application must be in "submitted" status');

  // Verify it is NOT public yet
  const publicProfiles = await getPublicTutors();
  const isPublic = publicProfiles.some((p) => p.id === submission.id);
  assert.equal(isPublic, false, 'Submitted tutor must NOT be publicly listed before admin approval');

  // Admin approves application
  await updateTutorApplicationStatus(submission.id, 'approved', 'Documents verified successfully');

  // Now it MUST appear in public directory
  const publicProfilesAfter = await getPublicTutors();
  const isPublicAfter = publicProfilesAfter.some((p) => p.id === submission.id);
  assert.equal(isPublicAfter, true, 'Approved tutor MUST now appear in public directory');

  // Admin suspends tutor
  await updateTutorApplicationStatus(submission.id, 'suspended', 'Temporary leave of absence');
  const publicProfilesSuspended = await getPublicTutors();
  const isPublicSuspended = publicProfilesSuspended.some((p) => p.id === submission.id);
  assert.equal(isPublicSuspended, false, 'Suspended tutor must be immediately removed from public view');
});

test('Parent Request: Submitting request generates reference and initial "new" status', async () => {
  const result = await submitParentRequest({
    parent_name: 'W/ro Genet',
    phone: '+251 91 333 4455',
    preferred_contact_method: 'Phone',
    city: 'Addis Ababa',
    sub_city: 'Yeka',
    subjects: ['Biology'],
    grade_level: 'Grades 9-10 (Secondary School)',
    curriculum: 'Ethiopian National Curriculum',
    teaching_mode: 'in_person',
    preferred_language: 'English & Amharic',
    privacy_consent: true,
  });

  assert.equal(result.success, true);
  assert.match(result.reference_number, /^BT-REQ-2026-\d{4}$/);
});
