-- Migration: Week 2 Feature Schema
-- Covers: Google Reviews auto-reply, Stripe billing, booking enhancements, venue onboarding

-- ============================================================
-- VENUE ENHANCEMENTS
-- ============================================================
ALTER TABLE venues ADD COLUMN IF NOT EXISTS auto_reply_reviews  BOOLEAN     DEFAULT TRUE;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS trial_ends_at       TIMESTAMPTZ;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS subscription_plan   TEXT        DEFAULT 'standard';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS menu_text           TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN    DEFAULT FALSE;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS onboarding_step     TEXT        DEFAULT 'venue_info';

-- ============================================================
-- BOOKING ENHANCEMENTS
-- ============================================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes           TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS party_size      INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id);

-- ============================================================
-- TABLE: review_templates
-- Per-venue, per-sentiment, per-language reply templates.
-- Used as baseline context for AI-generated replies.
-- ============================================================
CREATE TABLE IF NOT EXISTS review_templates (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    UUID    NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  sentiment   TEXT    NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  language    TEXT    NOT NULL CHECK (language IN ('fr', 'en', 'ru')),
  template    TEXT    NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_review_template UNIQUE (venue_id, sentiment, language)
);

CREATE INDEX idx_review_templates_venue ON review_templates(venue_id);

ALTER TABLE review_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_templates_venue_owner"
  ON review_templates FOR ALL
  USING (venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL));

CREATE TRIGGER update_review_templates_updated_at
  BEFORE UPDATE ON review_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
