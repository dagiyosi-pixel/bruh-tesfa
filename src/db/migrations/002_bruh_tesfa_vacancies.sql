-- =============================================================================
-- BRUH TESFA (ብሩህ ተስፋ) - Tutoring Vacancies & Job Board Schema
-- Migration: 002_bruh_tesfa_vacancies.sql
-- Framework: Supabase / PostgreSQL (15+)
-- Compliance: Ethiopian Personal Data Protection Proclamation No. 1321/2024
-- =============================================================================

-- 1. TUTORING VACANCIES TABLE
CREATE TABLE IF NOT EXISTS tutoring_vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. BT-VAC-2026-0001
    title VARCHAR(255) NOT NULL,
    parent_request_id UUID REFERENCES parent_requests(id) ON DELETE SET NULL,
    
    -- Location & Area (Strictly general - NEVER private address)
    city VARCHAR(100) NOT NULL DEFAULT 'Addis Ababa',
    sub_city VARCHAR(100) NOT NULL,
    general_area VARCHAR(255),
    
    -- Academic Details
    grade_level VARCHAR(100) NOT NULL,
    curriculum VARCHAR(100) NOT NULL DEFAULT 'Ethiopian National Curriculum',
    subjects TEXT[] NOT NULL DEFAULT '{}',
    
    -- Format & Schedule
    teaching_format VARCHAR(30) NOT NULL DEFAULT 'in_person'
        CHECK (teaching_format IN ('in_person', 'online', 'hybrid')),
    schedule_days TEXT[] NOT NULL DEFAULT '{}',
    time_window VARCHAR(100),
    lesson_frequency VARCHAR(100) NOT NULL,
    hours_per_session NUMERIC(4, 2) NOT NULL DEFAULT 1.50,
    expected_duration_months INT DEFAULT 3,
    
    -- Pay & Budget
    hourly_rate_etb NUMERIC(10, 2) NOT NULL,
    total_estimated_budget_etb NUMERIC(10, 2),
    
    -- Requirements & Criteria
    required_qualifications TEXT NOT NULL,
    languages TEXT[] NOT NULL DEFAULT '{"English", "Amharic"}',
    parent_preferences TEXT,
    
    -- Application Metadata
    application_deadline DATE,
    application_instructions TEXT,
    
    -- Lifecycle Status
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'open', 'closing_soon', 'filled', 'closed', 'archived')),
    
    -- Growth & Telegram Distribution Tracking
    view_count INT NOT NULL DEFAULT 0,
    application_count INT NOT NULL DEFAULT 0,
    telegram_message_id VARCHAR(100),
    telegram_published_at TIMESTAMPTZ,
    
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. VACANCY APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS vacancy_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID NOT NULL REFERENCES tutoring_vacancies(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutor_applications(id) ON DELETE SET NULL,
    
    -- Applicant Snapshot & Contact
    applicant_name VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    applicant_email VARCHAR(255),
    applicant_education VARCHAR(255) NOT NULL,
    applicant_institution VARCHAR(255) NOT NULL,
    years_of_experience INT NOT NULL DEFAULT 0,
    
    -- Application Specifics
    proposed_rate_etb NUMERIC(10, 2),
    available_schedule TEXT,
    cover_note TEXT NOT NULL,
    
    -- Status Lifecycle
    status VARCHAR(30) NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'interview_discussion', 'selected', 'not_selected', 'withdrawn')),
    admin_review_notes TEXT,
    
    -- Attribution & Campaign Tracking
    referral_source VARCHAR(100),
    utm_source VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent duplicate active applications from the same phone to the same vacancy
    CONSTRAINT unique_active_applicant_per_vacancy UNIQUE (vacancy_id, applicant_phone)
);

-- Indexes for rapid lookup and filtering
CREATE INDEX IF NOT EXISTS idx_vacancies_status ON tutoring_vacancies(status);
CREATE INDEX IF NOT EXISTS idx_vacancies_subcity ON tutoring_vacancies(sub_city);
CREATE INDEX IF NOT EXISTS idx_vacancies_subjects ON tutoring_vacancies USING GIN(subjects);
CREATE INDEX IF NOT EXISTS idx_vacancies_code ON tutoring_vacancies(vacancy_code);
CREATE INDEX IF NOT EXISTS idx_vac_apps_vacancy ON vacancy_applications(vacancy_id);
CREATE INDEX IF NOT EXISTS idx_vac_apps_tutor ON vacancy_applications(tutor_id);
CREATE INDEX IF NOT EXISTS idx_vac_apps_status ON vacancy_applications(status);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE tutoring_vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancy_applications ENABLE ROW LEVEL SECURITY;

-- Public can view active vacancies (open, closing_soon, filled)
CREATE POLICY "Public can view active tutoring vacancies"
    ON tutoring_vacancies FOR SELECT
    USING (status IN ('open', 'closing_soon', 'filled'));

-- Public can insert an application to an open vacancy
CREATE POLICY "Public can apply to active vacancies"
    ON vacancy_applications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tutoring_vacancies v
            WHERE v.id = vacancy_id AND v.status IN ('open', 'closing_soon')
        )
    );

-- Applicants/public CANNOT view other applicants' records
CREATE POLICY "Service role full access on vacancies"
    ON tutoring_vacancies FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on vacancy_applications"
    ON vacancy_applications FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');
