-- =============================================================================
-- BRUH TESFA (ብሩህ ተስፋ) - Non-Destructive Schema Refinements & Concurrency Controls
-- Migration: 003_bruh_tesfa_refinements.sql
-- Framework: Supabase / PostgreSQL (15+)
-- Compliance: Ethiopian Personal Data Protection Proclamation No. 1321/2024
-- =============================================================================

-- 1. PARENT REQUESTS: Add student_count column if omitted from 001
ALTER TABLE IF EXISTS parent_requests 
ADD COLUMN IF NOT EXISTS student_count INT DEFAULT 1;

-- 2. VACANCY APPLICATIONS: Fix over-broad duplicate constraint to support re-application after withdrawal
-- A static UNIQUE(vacancy_id, applicant_phone) blocked re-application if an applicant had previously withdrawn.
-- We replace it with partial unique indexes matching application domain rules.
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_active_applicant_per_vacancy' 
        AND table_name = 'vacancy_applications'
    ) THEN
        ALTER TABLE vacancy_applications DROP CONSTRAINT unique_active_applicant_per_vacancy;
    END IF;
END $$;

-- Enforce uniqueness ONLY for active applications (not withdrawn or rejected)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_applicant_phone 
ON vacancy_applications(vacancy_id, applicant_phone) 
WHERE status NOT IN ('withdrawn', 'not_selected');

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_tutor_app 
ON vacancy_applications(vacancy_id, tutor_id) 
WHERE tutor_id IS NOT NULL AND status NOT IN ('withdrawn', 'not_selected');

-- 3. PLACEMENTS: Prevent duplicate placement agreements for the same match proposal
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_placement_per_match 
ON placements(match_id);

-- 4. VACANCIES: Ensure performance index on status and created_at for rapid pagination
CREATE INDEX IF NOT EXISTS idx_vacancies_status_created 
ON tutoring_vacancies(status, created_at DESC);

-- 5. AUDIT LOGS: Index for resource tracking and compliance investigation
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource 
ON audit_logs(resource_type, resource_id);

-- 6. RLS Policies: Service role and admin verification
-- Ensure authenticated admin can read private vacancy applications
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Admins can read all vacancy applications' 
        AND tablename = 'vacancy_applications'
    ) THEN
        CREATE POLICY "Admins can read all vacancy applications"
            ON vacancy_applications FOR SELECT
            USING (
                auth.jwt() ->> 'role' = 'service_role' OR 
                auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
            );
    END IF;
END $$;
