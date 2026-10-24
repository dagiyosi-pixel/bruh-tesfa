-- =============================================================================
-- BRUH TESFA (ብሩህ ተስፋ) - Migration 005: Telegram Bot, Alerts & Broadcast Logs
-- =============================================================================
-- Non-destructive extension supporting:
-- 1. Opt-in personalized vacancy alerts for Telegram bot subscribers
-- 2. Idempotent Telegram announcement broadcast logs & delivery tracking
-- 3. Campaign attribution indexing
-- =============================================================================

-- 1. TELEGRAM BOT SUBSCRIBERS (Opt-in vacancy alerts)
CREATE TABLE IF NOT EXISTS telegram_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    subjects TEXT[] DEFAULT '{}',
    grade_levels TEXT[] DEFAULT '{}',
    sub_cities TEXT[] DEFAULT '{}',
    teaching_format VARCHAR(50) NOT NULL DEFAULT 'either'
        CHECK (teaching_format IN ('in_person', 'online', 'either')),
    last_alert_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TELEGRAM BROADCAST LOGS (Audit trail & duplicate prevention)
CREATE TABLE IF NOT EXISTS telegram_broadcast_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID REFERENCES vacancies(id) ON DELETE SET NULL,
    channel_id VARCHAR(255) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    broadcast_type VARCHAR(50) NOT NULL DEFAULT 'channel_announcement'
        CHECK (broadcast_type IN ('channel_announcement', 'subscriber_alert', 'custom_broadcast')),
    recipient_count INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'published'
        CHECK (status IN ('published', 'failed', 'simulated')),
    caption_snippet TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES FOR FAST SUBSCRIBER MATCHING & IDEMPOTENCY
CREATE INDEX IF NOT EXISTS idx_tg_subscribers_active ON telegram_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_tg_subscribers_chat_id ON telegram_subscribers(chat_id);
CREATE INDEX IF NOT EXISTS idx_tg_subscribers_subjects ON telegram_subscribers USING GIN(subjects);
CREATE INDEX IF NOT EXISTS idx_tg_subscribers_subcities ON telegram_subscribers USING GIN(sub_cities);

CREATE INDEX IF NOT EXISTS idx_tg_broadcast_vacancy ON telegram_broadcast_logs(vacancy_id, channel_id);
CREATE INDEX IF NOT EXISTS idx_tg_broadcast_created ON telegram_broadcast_logs(created_at DESC);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE telegram_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_broadcast_logs ENABLE ROW LEVEL SECURITY;

-- Service role only has full access (never exposed to unauthenticated public visitors)
CREATE POLICY "Service role full access on telegram_subscribers"
    ON telegram_subscribers FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on telegram_broadcast_logs"
    ON telegram_broadcast_logs FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');
