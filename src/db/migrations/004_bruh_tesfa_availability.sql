-- =============================================================================
-- BRUH TESFA (ብሩህ ተስፋ) - Migration 004: Availability & Schedule Architecture
-- Non-destructive refinement adding structured recurring schedules,
-- blackout dates, time intervals, and parent schedule preferences.
-- Timezone: Africa/Addis_Ababa (UTC+3, EAT)
-- =============================================================================

-- 1. ADD STRUCTURED AVAILABILITY COLUMNS TO TUTOR APPLICATIONS
ALTER TABLE tutor_applications
    ADD COLUMN IF NOT EXISTS weekly_availability JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS blackout_dates TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS extra_availability JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS min_lesson_duration_minutes INT DEFAULT 60,
    ADD COLUMN IF NOT EXISTS max_lesson_duration_minutes INT DEFAULT 120,
    ADD COLUMN IF NOT EXISTS max_weekly_hours INT DEFAULT 20,
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Africa/Addis_Ababa',
    ADD COLUMN IF NOT EXISTS availability_confirmed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS availability_notes TEXT;

-- 2. ADD SCHEDULE PREFERENCE COLUMNS TO PARENT REQUESTS
ALTER TABLE parent_requests
    ADD COLUMN IF NOT EXISTS preferred_days TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS preferred_time_windows TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS schedule_flexibility VARCHAR(50) DEFAULT 'flexible_windows',
    ADD COLUMN IF NOT EXISTS earliest_start_date DATE,
    ADD COLUMN IF NOT EXISTS hours_per_session NUMERIC(3, 1) DEFAULT 1.5,
    ADD COLUMN IF NOT EXISTS lessons_per_week INT DEFAULT 3;

-- 3. ADD PERFORMANCE INDEXES FOR SCHEDULE QUERYING
CREATE INDEX IF NOT EXISTS idx_tutor_app_weekly_avail ON tutor_applications USING GIN (weekly_availability);
CREATE INDEX IF NOT EXISTS idx_parent_requests_preferred_days ON parent_requests USING GIN (preferred_days);
CREATE INDEX IF NOT EXISTS idx_tutor_app_blackout_dates ON tutor_applications USING GIN (blackout_dates);

-- 4. COMMENT FOR DATA DICTIONARY
COMMENT ON COLUMN tutor_applications.weekly_availability IS 'Structured JSON map of DayOfWeek -> TimeInterval[] with start/end times in Africa/Addis_Ababa local time.';
COMMENT ON COLUMN parent_requests.schedule_flexibility IS 'Flexibility tier: strict_times, flexible_windows, weekends_only, or open_schedule.';
