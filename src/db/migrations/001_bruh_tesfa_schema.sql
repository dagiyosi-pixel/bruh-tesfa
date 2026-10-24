-- =============================================================================
-- BRUH TESFA (ብሩህ ተስፋ) - Core Relational Schema
-- Migration: 001_bruh_tesfa_schema.sql
-- Framework: Supabase / PostgreSQL (15+)
-- Compliance: Ethiopian Personal Data Protection Proclamation No. 1321/2024
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TUTOR APPLICATIONS (Private administrative & verification record)
CREATE TABLE IF NOT EXISTS tutor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(32) UNIQUE NOT NULL,
    
    -- Private identifying details (NEVER exposed publicly)
    full_legal_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    preferred_contact_channel VARCHAR(30) DEFAULT 'Telegram', -- Telegram, Phone, WhatsApp
    city VARCHAR(100) NOT NULL DEFAULT 'Addis Ababa',
    sub_city VARCHAR(100) NOT NULL,
    specific_neighborhood VARCHAR(255),
    
    -- Teaching profile
    public_display_name VARCHAR(100) NOT NULL,
    subjects TEXT[] NOT NULL DEFAULT '{}',
    grade_levels TEXT[] NOT NULL DEFAULT '{}',
    curricula TEXT[] NOT NULL DEFAULT '{"Ethiopian National Curriculum"}',
    
    -- Qualifications & Experience
    education_level VARCHAR(100) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255) NOT NULL,
    years_of_experience INT NOT NULL DEFAULT 0,
    teaching_approach TEXT NOT NULL,
    bio TEXT NOT NULL,
    teaching_languages TEXT[] NOT NULL DEFAULT '{"English", "Amharic"}',
    
    -- Availability & Modality
    available_days TEXT[] NOT NULL DEFAULT '{}',
    available_time_windows TEXT[] NOT NULL DEFAULT '{}',
    teaching_modes TEXT[] NOT NULL DEFAULT '{"in_person"}', -- in_person, online
    travel_areas TEXT[] NOT NULL DEFAULT '{}',
    hourly_rate_etb NUMERIC(10, 2) NOT NULL DEFAULT 350.00,
    
    -- Secure Storage References (Stored in private 'tutor-documents' bucket)
    national_id_doc_path TEXT,
    degree_cert_doc_path TEXT,
    avatar_url TEXT,
    
    -- Consent & Declarations (Proclamation No. 1321/2024)
    privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
    code_of_conduct_agreed BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Review Workflow Status
    status VARCHAR(30) NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('submitted', 'under_review', 'needs_info', 'approved', 'rejected', 'suspended')),
    admin_review_notes TEXT,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    
    -- Acquisition & Tracking
    referral_source VARCHAR(100),
    utm_source VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TUTOR PUBLIC PROFILES (Strictly curated, sanitized view for public site)
CREATE TABLE IF NOT EXISTS tutor_public_profiles (
    id UUID PRIMARY KEY REFERENCES tutor_applications(id) ON DELETE CASCADE,
    slug VARCHAR(120) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT NOT NULL,
    teaching_approach TEXT NOT NULL,
    education_summary VARCHAR(255) NOT NULL,
    subjects TEXT[] NOT NULL DEFAULT '{}',
    grade_levels TEXT[] NOT NULL DEFAULT '{}',
    curricula TEXT[] NOT NULL DEFAULT '{}',
    teaching_modes TEXT[] NOT NULL DEFAULT '{}',
    service_areas TEXT[] NOT NULL DEFAULT '{}',
    hourly_rate_etb NUMERIC(10, 2) NOT NULL,
    languages TEXT[] NOT NULL DEFAULT '{}',
    avatar_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    badge VARCHAR(50) DEFAULT 'Verified Tutor',
    total_lessons_placed INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PARENT / GUARDIAN TUTORING REQUESTS
CREATE TABLE IF NOT EXISTS parent_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(32) UNIQUE NOT NULL,
    
    parent_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    preferred_contact_method VARCHAR(30) DEFAULT 'Phone', -- Phone, Telegram, WhatsApp
    
    city VARCHAR(100) NOT NULL DEFAULT 'Addis Ababa',
    sub_city VARCHAR(100) NOT NULL,
    general_area VARCHAR(255),
    
    target_tutor_id UUID REFERENCES tutor_applications(id) ON DELETE SET NULL,
    
    subjects TEXT[] NOT NULL DEFAULT '{}',
    grade_level VARCHAR(50) NOT NULL,
    curriculum VARCHAR(100) DEFAULT 'Ethiopian National Curriculum',
    teaching_mode VARCHAR(30) NOT NULL DEFAULT 'in_person',
    schedule_preference VARCHAR(100),
    lesson_frequency VARCHAR(100),
    budget_range_min NUMERIC(10, 2),
    budget_range_max NUMERIC(10, 2),
    preferred_language VARCHAR(50) DEFAULT 'English & Amharic',
    learning_goals TEXT,
    
    status VARCHAR(30) NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'reviewing', 'matching', 'candidates_proposed', 'matched', 'active', 'closed', 'cancelled')),
    admin_notes TEXT,
    privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
    
    referral_source VARCHAR(100),
    utm_source VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. MATCH PROPOSALS
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES parent_requests(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES tutor_applications(id) ON DELETE CASCADE,
    match_score INT NOT NULL DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
    match_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    proposed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tutor_response VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (tutor_response IN ('pending', 'accepted', 'declined')),
    parent_response VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (parent_response IN ('pending', 'accepted', 'declined')),
    status VARCHAR(30) NOT NULL DEFAULT 'proposed'
        CHECK (status IN ('proposed', 'tutor_accepted', 'parent_accepted', 'confirmed', 'declined', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PLACEMENTS & COMMISSION AGREEMENTS (Transparent 60% placement policy)
CREATE TABLE IF NOT EXISTS placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE RESTRICT,
    request_id UUID NOT NULL REFERENCES parent_requests(id) ON DELETE RESTRICT,
    tutor_id UUID NOT NULL REFERENCES tutor_applications(id) ON DELETE RESTRICT,
    
    contract_type VARCHAR(50) NOT NULL DEFAULT 'first_month_recurring'
        CHECK (contract_type IN ('first_month_recurring', 'package_hours', 'single_lesson')),
    agreed_rate_etb NUMERIC(10, 2) NOT NULL,
    total_contract_value_etb NUMERIC(10, 2) NOT NULL,
    commission_percentage NUMERIC(5, 2) NOT NULL DEFAULT 60.00,
    commission_amount_etb NUMERIC(10, 2) NOT NULL,
    commission_basis_description TEXT NOT NULL DEFAULT '60% one-time placement commission applied to the first month contract value',
    
    terms_accepted_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    terms_version VARCHAR(20) NOT NULL DEFAULT 'v1.0-2026',
    
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending_invoice'
        CHECK (payment_status IN ('pending_invoice', 'due', 'partially_paid', 'paid', 'waived_cancellation', 'refunded')),
    payment_reference VARCHAR(100),
    payment_method VARCHAR(50), -- Telebirr, CBE Birr, Awash, Bank Transfer, Cash
    payment_received_at TIMESTAMPTZ,
    
    start_date DATE NOT NULL,
    replacement_guarantee_valid_until DATE,
    follow_up_status VARCHAR(30) NOT NULL DEFAULT 'pending_first_lesson'
        CHECK (follow_up_status IN ('pending_first_lesson', 'first_lesson_completed', 'ongoing_smooth', 'issue_reported', 'concluded')),
    follow_up_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SYSTEM FEE CONFIGURATIONS (Locked audit of fee parameters)
CREATE TABLE IF NOT EXISTS fee_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    default_commission_percentage NUMERIC(5, 2) NOT NULL DEFAULT 60.00,
    applicable_basis VARCHAR(100) NOT NULL DEFAULT 'first_month_lessons',
    failure_replacement_policy TEXT NOT NULL DEFAULT 'If a tutor or student withdraws within the first 2 lessons, a replacement is provided without an additional placement fee.',
    repeat_client_policy TEXT NOT NULL DEFAULT 'No recurring or ongoing fee applies to subsequent months of tutoring.',
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 7. SAFEGUARDING & COMPLAINTS LOG
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(32) UNIQUE NOT NULL,
    reporter_type VARCHAR(30) NOT NULL DEFAULT 'parent'
        CHECK (reporter_type IN ('parent', 'tutor', 'anonymous', 'staff')),
    reporter_name VARCHAR(255),
    reporter_contact VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(30) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent_safeguarding')),
    status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'under_investigation', 'action_taken', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. AUDIT LOG (Administrative accountability & legal integrity)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. DATA SUBJECT RIGHTS & DELETION REQUESTS (Proclamation No. 1321/2024)
CREATE TABLE IF NOT EXISTS data_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(32) UNIQUE NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    requester_contact VARCHAR(255) NOT NULL,
    request_type VARCHAR(50) NOT NULL DEFAULT 'deletion'
        CHECK (request_type IN ('deletion', 'rectification', 'data_export')),
    details TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'verified', 'completed', 'rejected')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERING
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_tutor_app_status ON tutor_applications(status);
CREATE INDEX IF NOT EXISTS idx_tutor_app_subcity ON tutor_applications(sub_city);
CREATE INDEX IF NOT EXISTS idx_tutor_app_subjects ON tutor_applications USING GIN(subjects);
CREATE INDEX IF NOT EXISTS idx_tutor_pub_slug ON tutor_public_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_tutor_pub_subjects ON tutor_public_profiles USING GIN(subjects);
CREATE INDEX IF NOT EXISTS idx_tutor_pub_grades ON tutor_public_profiles USING GIN(grade_levels);
CREATE INDEX IF NOT EXISTS idx_parent_req_status ON parent_requests(status);
CREATE INDEX IF NOT EXISTS idx_parent_req_subcity ON parent_requests(sub_city);
CREATE INDEX IF NOT EXISTS idx_matches_req_tutor ON matches(request_id, tutor_id);
CREATE INDEX IF NOT EXISTS idx_placements_status ON placements(payment_status);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE tutor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Public can ONLY view verified tutor profiles
CREATE POLICY "Public profiles are visible to all visitors"
    ON tutor_public_profiles FOR SELECT
    USING (is_verified = TRUE);

-- Public can insert new tutor applications (draft/submission)
CREATE POLICY "Public can submit tutor application"
    ON tutor_applications FOR INSERT
    WITH CHECK (TRUE);

-- Public CANNOT select raw tutor applications (protecting private phone/ID/docs)
-- Only service role / admin can select
CREATE POLICY "Service role full access on tutor_applications"
    ON tutor_applications FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Public can insert parent requests
CREATE POLICY "Public can submit parent request"
    ON parent_requests FOR INSERT
    WITH CHECK (TRUE);

-- Public CANNOT view parent requests; only service role / admin
CREATE POLICY "Service role full access on parent_requests"
    ON parent_requests FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Public fee config select
CREATE POLICY "Public can view active fee configurations"
    ON fee_configurations FOR SELECT
    USING (is_active = TRUE);

-- Public can file complaints / incidents
CREATE POLICY "Public can submit complaints"
    ON complaints FOR INSERT
    WITH CHECK (TRUE);

-- Public can submit data deletion requests
CREATE POLICY "Public can submit deletion requests"
    ON data_deletion_requests FOR INSERT
    WITH CHECK (TRUE);

-- =============================================================================
-- STORAGE BUCKETS SPECIFICATION
-- =============================================================================
-- Bucket 1: 'tutor-public-avatars' -> Public read, admin write
-- Bucket 2: 'tutor-documents' -> PRIVATE: NO public read, authenticated admin signed URLs only
