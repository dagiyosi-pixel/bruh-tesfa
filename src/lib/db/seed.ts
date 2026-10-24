import {
  TutorApplication,
  TutorPublicProfile,
  ParentRequest,
  FeeConfiguration,
  TutoringVacancy,
  VacancyApplication,
  TelegramSubscriber,
} from '../types';

export const INITIAL_FEE_CONFIG: FeeConfiguration = {
  id: 'fc-default-01',
  default_commission_percentage: 60.0,
  applicable_basis: 'first_month_lessons',
  failure_replacement_policy:
    'Full replacement provided without additional placement commission if family or tutor cancels within the first 2 lessons.',
  repeat_client_policy:
    '0% commission on months 2 onwards. All continuing payments belong 100% to the tutor.',
  effective_from: '2026-01-01T00:00:00Z',
  is_active: true,
};

/**
 * PRODUCTION / LIVE STATE:
 * Strictly 0 fictional, mock, or placeholder tutors.
 * Every public educator must undergo in-person credential & Kebele ID verification.
 */
export const INITIAL_TUTORS: TutorApplication[] = [];
export const INITIAL_PUBLIC_PROFILES: TutorPublicProfile[] = [];
export const INITIAL_PARENT_REQUESTS: ParentRequest[] = [];

/**
 * Real active tutoring vacancies from Ethiopian families.
 */
export const INITIAL_VACANCIES: TutoringVacancy[] = [
  {
    id: 'vac-005',
    vacancy_code: 'BT-VAC-2026-0005',
    title: 'Grade 4 Primary Home Tutor (All Subjects) - Female Only',
    city: 'Addis Ababa',
    sub_city: 'Kirkos',
    general_area: 'Mexico Condominium',
    grade_level: 'Grades 1-4 (Foundational Primary)',
    curriculum: 'Ethiopian National Curriculum',
    subjects: ['Mathematics', 'English Language & Literature', 'Amharic (አማርኛ)'],
    teaching_format: 'in_person',
    schedule_days: ['Monday', 'Wednesday', 'Friday'],
    time_window: 'Afternoon (1 hr/day)',
    lesson_frequency: '3 days per week (1 hr each)',
    hours_per_session: 1.0,
    expected_duration_months: 6,
    hourly_rate_etb: 250,
    total_estimated_budget_etb: 3000,
    required_qualifications:
      'Female tutor with proven experience in primary grade education. Punctual, patient, and committed to student improvement.',
    languages: ['Amharic (አማርኛ)', 'English'],
    parent_preferences:
      'Female tutors only requested by family. Covers all Grade 4 foundational subjects.',
    application_deadline: '2026-04-30',
    application_instructions:
      'Apply online or via Telegram coordinator desk @biruh_tesfa_tutoring / 0931736692 / 0979558343.',
    status: 'open',
    view_count: 52,
    application_count: 0,
    published_at: '2026-03-14T08:00:00Z',
    created_at: '2026-03-14T08:00:00Z',
    updated_at: '2026-03-14T08:00:00Z',
  },
];

export const INITIAL_VACANCY_APPLICATIONS: VacancyApplication[] = [];
export const INITIAL_TELEGRAM_SUBSCRIBERS: TelegramSubscriber[] = [];

/**
 * Isolated in-memory fixtures strictly reserved for the Node.js test runner (`npm test`).
 * These are NEVER loaded in production, web pages, or written to database files.
 */
export const TEST_FIXTURE_TUTORS: TutorApplication[] = [
  {
    id: 'tut-001',
    reference_number: 'BT-TUT-2026-0001',
    full_legal_name: 'Teacher Dagmawi Y.',
    public_display_name: 'Teacher Dagmawi',
    phone: '+251 91 189 4521',
    email: 'test.tutor@example.com',
    preferred_contact_channel: 'Telegram',
    city: 'Addis Ababa',
    sub_city: 'Bole',
    specific_neighborhood: 'Bole Brass',
    subjects: ['Physics', 'Mathematics'],
    grade_levels: ['Grades 9-10 (Secondary School)', 'Grades 11-12 (University Entrance / EUEE Prep)'],
    curricula: ['Ethiopian National Curriculum'],
    education_level: 'B.Sc. Mechanical Engineering',
    institution: 'Addis Ababa University',
    field_of_study: 'Engineering',
    years_of_experience: 5,
    teaching_approach: 'Conceptual intuition and active recall.',
    bio: 'Experienced educator preparing high schoolers for examinations.',
    teaching_modes: ['in_person', 'online'],
    travel_areas: ['Bole', 'Yeka', 'Kirkos', 'Mexico'],
    hourly_rate_etb: 450,
    available_days: ['Monday', 'Wednesday', 'Friday'],
    available_time_windows: ['Afternoon (2:00 PM – 5:00 PM / 8:00 – 11:00 Local)'],
    max_weekly_hours: 15,
    teaching_languages: ['English', 'Amharic (አማርኛ)'],
    privacy_consent: true,
    code_of_conduct_agreed: true,
    status: 'approved',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'tut-002',
    reference_number: 'BT-TUT-2026-0002',
    full_legal_name: 'Test Tutor ASTU',
    public_display_name: 'Teacher Test ASTU',
    phone: '+251 92 233 4455',
    email: 'test.astu@example.com',
    preferred_contact_channel: 'Phone',
    city: 'Addis Ababa',
    sub_city: 'Lemi Kura',
    specific_neighborhood: 'CMC Michael',
    subjects: ['Chemistry', 'Biology'],
    grade_levels: ['Grades 7-8 (Middle School)', 'Grades 9-10 (Secondary School)'],
    curricula: ['Ethiopian National Curriculum'],
    education_level: 'B.Sc. Applied Chemistry',
    institution: 'ASTU',
    field_of_study: 'Chemistry',
    years_of_experience: 4,
    teaching_approach: 'Visual diagrams and practice problems.',
    bio: 'Dedicated science educator.',
    teaching_modes: ['in_person'],
    travel_areas: ['Yeka', 'Bole', 'Lemi Kura', 'CMC Michael'],
    hourly_rate_etb: 400,
    available_days: ['Tuesday', 'Thursday', 'Saturday'],
    available_time_windows: ['Morning (9:00 AM – 12:00 PM / 3:00 – 6:00 Local)'],
    max_weekly_hours: 12,
    teaching_languages: ['Amharic (አማርኛ)', 'English'],
    privacy_consent: true,
    code_of_conduct_agreed: true,
    status: 'approved',
    created_at: '2026-03-01T11:00:00Z',
    updated_at: '2026-03-01T11:00:00Z',
  },
  {
    id: 'tut-005',
    reference_number: 'BT-TUT-2026-0005',
    full_legal_name: 'Pending Applicant',
    public_display_name: 'Pending Applicant',
    phone: '+251 95 566 7788',
    email: 'pending@example.com',
    preferred_contact_channel: 'Telegram',
    city: 'Addis Ababa',
    sub_city: 'Kirkos',
    subjects: ['Mathematics'],
    grade_levels: ['Grades 7-8 (Middle School)'],
    curricula: ['Ethiopian National Curriculum'],
    education_level: 'B.Sc.',
    institution: 'AAU',
    field_of_study: 'Mathematics',
    years_of_experience: 1,
    teaching_approach: 'Step by step guidance.',
    bio: 'Enthusiastic beginner tutor.',
    teaching_modes: ['in_person'],
    travel_areas: ['Kirkos'],
    hourly_rate_etb: 300,
    available_days: ['Monday', 'Tuesday'],
    available_time_windows: ['Afternoon (2:00 PM – 5:00 PM / 8:00 – 11:00 Local)'],
    max_weekly_hours: 10,
    teaching_languages: ['Amharic (አማርኛ)'],
    privacy_consent: true,
    code_of_conduct_agreed: true,
    status: 'under_review',
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-03-01T12:00:00Z',
  },
];

export const TEST_FIXTURE_PUBLIC_PROFILES: TutorPublicProfile[] = TEST_FIXTURE_TUTORS
  .filter((t) => t.status === 'approved')
  .map((t) => ({
    id: t.id,
    slug: t.public_display_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    display_name: t.public_display_name,
    bio: t.bio,
    teaching_approach: t.teaching_approach,
    education_summary: `${t.education_level} • ${t.institution}`,
    subjects: t.subjects,
    grade_levels: t.grade_levels,
    curricula: t.curricula,
    teaching_modes: t.teaching_modes,
    service_areas: t.travel_areas,
    hourly_rate_etb: t.hourly_rate_etb,
    languages: t.teaching_languages,
    avatar_url: t.avatar_url,
    is_verified: true,
    badge: 'Verified Tutor',
    total_lessons_placed: 0,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }));

export const TEST_FIXTURE_PARENT_REQUESTS: ParentRequest[] = [
  {
    id: 'req-001',
    reference_number: 'BT-REQ-2026-0001',
    parent_name: 'Test Parent One',
    phone: '+251 91 144 8822',
    email: 'testparent@example.com',
    preferred_contact_method: 'Phone',
    city: 'Addis Ababa',
    sub_city: 'Bole',
    general_area: 'Bole Medhanialem',
    subjects: ['Physics', 'Mathematics'],
    grade_level: 'Grades 11-12 (University Entrance / EUEE Prep)',
    curriculum: 'Ethiopian National Curriculum',
    teaching_mode: 'in_person',
    preferred_days: ['Monday', 'Wednesday', 'Friday'],
    preferred_time_windows: ['Afternoon (2:00 PM – 5:00 PM / 8:00 – 11:00 Local)'],
    schedule_flexibility: 'flexible_windows',
    budget_range_min: 400,
    budget_range_max: 550,
    preferred_language: 'English & Amharic',
    learning_goals: 'Needs exam strategy and formula clarity.',
    privacy_consent: true,
    status: 'new',
    created_at: '2026-03-01T14:00:00Z',
    updated_at: '2026-03-01T14:00:00Z',
  },
];
