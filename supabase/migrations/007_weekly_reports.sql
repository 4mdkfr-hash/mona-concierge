-- Migration: Weekly WhatsApp Report
-- MON-17/MON-23: weekly_reports table + venue opt-in columns

-- ============================================================
-- VENUE ENHANCEMENTS
-- ============================================================
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS weekly_report_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS owner_phone            TEXT,
  ADD COLUMN IF NOT EXISTS owner_language         TEXT    NOT NULL DEFAULT 'fr'
    CHECK (owner_language IN ('fr', 'en', 'ru'));

-- ============================================================
-- TABLE: weekly_reports
-- One row per venue per report period. Stores stats, generated
-- content, and WhatsApp delivery status.
-- ============================================================
CREATE TABLE IF NOT EXISTS weekly_reports (
  id                   UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id             UUID    NOT NULL REFERENCES venues(id) ON DELETE CASCADE,

  -- Report window (UTC)
  period_start         TIMESTAMPTZ NOT NULL,
  period_end           TIMESTAMPTZ NOT NULL,

  -- Aggregated stats
  message_count        INTEGER NOT NULL DEFAULT 0,
  bookings_made        INTEGER NOT NULL DEFAULT 0,
  upsells_sent         INTEGER NOT NULL DEFAULT 0,
  avg_rating           NUMERIC(3,2),
  rating_delta         NUMERIC(3,2),    -- vs prior 7-day window

  -- Generated content
  ai_recommendations   TEXT,
  report_text          TEXT,            -- final formatted WhatsApp message

  -- Delivery
  whatsapp_message_id  TEXT,
  status               TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  error_message        TEXT,
  sent_at              TIMESTAMPTZ,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_venue_period
  ON weekly_reports (venue_id, period_start DESC);

ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_reports_venue_owner"
  ON weekly_reports FOR ALL
  USING (venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL));
