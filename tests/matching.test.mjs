// =============================================================================
// BRUH TESFA - Algorithmic Candidate Matching Tests
// =============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateCandidateMatch, rankCandidatesForRequest } from '../src/lib/matching.ts';

test('Matching Engine: Unapproved or suspended tutor is marked ineligible with 0 score', () => {
  const request = {
    id: 'req-test-1',
    reference_number: 'BT-REQ-2026-TEST',
    parent_name: 'Test Parent',
    phone: '+251 91 100 0000',
    preferred_contact_method: 'Phone',
    city: 'Addis Ababa',
    sub_city: 'Bole',
    subjects: ['Physics'],
    grade_level: 'Grades 11-12 (University Entrance / EUEE Prep)',
    curriculum: 'Ethiopian National Curriculum',
    teaching_mode: 'in_person',
    preferred_language: 'English & Amharic',
    privacy_consent: true,
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const suspendedTutor = {
    id: 'tut-suspended',
    reference_number: 'BT-TUT-2026-SUSP',
    full_legal_name: 'Suspended Applicant',
    public_display_name: 'Suspended A.',
    phone: '+251 91 222 3333',
    email: 'suspended@example.com',
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
    teaching_approach: 'Comprehensive physics problems',
    bio: 'Test bio',
    teaching_languages: ['English', 'Amharic (አማርኛ)'],
    available_days: ['Monday'],
    available_time_windows: ['Afternoon'],
    teaching_modes: ['in_person'],
    travel_areas: ['Bole'],
    hourly_rate_etb: 400,
    privacy_consent: true,
    code_of_conduct_agreed: true,
    status: 'suspended',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = evaluateCandidateMatch(request, suspendedTutor);
  assert.equal(result.is_eligible, false);
  assert.equal(result.total_score, 0);
  assert.ok(result.breakdown.reasons[0].includes('not currently approved'));
});

test('Matching Engine: High compatibility score for matching subject, grade, sub-city and budget', () => {
  const request = {
    id: 'req-test-2',
    reference_number: 'BT-REQ-2026-0001',
    parent_name: 'Selamawit',
    phone: '+251 91 144 8822',
    preferred_contact_method: 'Phone',
    city: 'Addis Ababa',
    sub_city: 'Bole',
    subjects: ['Physics', 'Mathematics'],
    grade_level: 'Grades 11-12 (University Entrance / EUEE Prep)',
    curriculum: 'Ethiopian National Curriculum',
    teaching_mode: 'in_person',
    budget_range_min: 400,
    budget_range_max: 500,
    preferred_language: 'English & Amharic',
    privacy_consent: true,
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const approvedTutor = {
    id: 'tut-001',
    reference_number: 'BT-TUT-2026-0001',
    full_legal_name: 'Dagmawi Yosef',
    public_display_name: 'Teacher Dagmawi',
    phone: '+251 91 189 4521',
    email: 'dagmawi@example.com',
    preferred_contact_channel: 'Telegram',
    city: 'Addis Ababa',
    sub_city: 'Bole',
    subjects: ['Physics', 'Mathematics'],
    grade_levels: ['Grades 11-12 (University Entrance / EUEE Prep)'],
    curricula: ['Ethiopian National Curriculum'],
    education_level: 'B.Sc. Mechanical Engineering',
    institution: 'AAU',
    field_of_study: 'Engineering',
    years_of_experience: 5,
    teaching_approach: 'SQ3R and conceptual physics',
    bio: 'Senior STEM educator',
    teaching_languages: ['English', 'Amharic (አማርኛ)'],
    available_days: ['Monday', 'Wednesday'],
    available_time_windows: ['Afternoon'],
    teaching_modes: ['in_person'],
    travel_areas: ['Bole', 'Yeka'],
    hourly_rate_etb: 450,
    privacy_consent: true,
    code_of_conduct_agreed: true,
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = evaluateCandidateMatch(request, approvedTutor);
  assert.equal(result.is_eligible, true);
  assert.ok(result.total_score >= 90, `Score expected >= 90, got ${result.total_score}`);
  assert.equal(result.breakdown.subject_score, 30);
  assert.equal(result.breakdown.grade_score, 20);
  assert.equal(result.breakdown.modality_score, 15);
  assert.equal(result.breakdown.location_score, 15);
  assert.equal(result.breakdown.language_score, 10);
  assert.equal(result.breakdown.budget_score, 10);
});

test('Matching Engine: Online requests grant full location score regardless of sub-city', () => {
  const onlineRequest = {
    id: 'req-online',
    reference_number: 'BT-REQ-2026-ONL',
    parent_name: 'Remote Family',
    phone: '+251 91 999 8888',
    preferred_contact_method: 'Telegram',
    city: 'Addis Ababa',
    sub_city: 'Akaki Kality', // Far distance
    subjects: ['Chemistry'],
    grade_level: 'Grades 9-10 (Secondary School)',
    curriculum: 'Ethiopian National Curriculum',
    teaching_mode: 'online', // Online modality
    preferred_language: 'English',
    privacy_consent: true,
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const onlineTutor = {
    id: 'tut-chem',
    reference_number: 'BT-TUT-CHEM',
    full_legal_name: 'Bethlehem Tadesse',
    public_display_name: 'Bethlehem T.',
    phone: '+251 92 000 0000',
    email: 'bethlehem@example.com',
    preferred_contact_channel: 'Phone',
    city: 'Addis Ababa',
    sub_city: 'Yeka',
    subjects: ['Chemistry'],
    grade_levels: ['Grades 9-10 (Secondary School)'],
    curricula: ['Ethiopian National Curriculum'],
    education_level: 'B.Sc.',
    institution: 'ASTU',
    field_of_study: 'Chemistry',
    years_of_experience: 3,
    teaching_approach: 'Structured chemistry sets',
    bio: 'Bio',
    teaching_languages: ['English', 'Amharic (አማርኛ)'],
    available_days: ['Tuesday'],
    available_time_windows: ['Afternoon'],
    teaching_modes: ['online'],
    travel_areas: ['Yeka'], // Only travels to Yeka, but request is online
    hourly_rate_etb: 400,
    privacy_consent: true,
    code_of_conduct_agreed: true,
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = evaluateCandidateMatch(onlineRequest, onlineTutor);
  assert.equal(result.breakdown.location_score, 15);
  assert.ok(result.breakdown.reasons.some((r) => r.includes('Online session — location independent')));
});
