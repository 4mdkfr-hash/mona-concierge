-- Migration: Seasonal Campaign Engine — Monaco Events (MON-20)
-- Enables AI-driven booking nudges before Monaco/Riviera seasonal events.

-- ============================================================
-- TABLE: seasonal_events
-- Global Monaco/Riviera event calendar. Seeded here; admin-editable later.
-- ============================================================
CREATE TABLE seasonal_events (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,                         -- "Monaco Grand Prix"
  slug                 TEXT NOT NULL UNIQUE,                  -- "monaco-grand-prix"
  description          TEXT,
  recurrence_month     INT  NOT NULL CHECK (recurrence_month BETWEEN 1 AND 12),
  recurrence_day       INT  CHECK (recurrence_day BETWEEN 1 AND 31),  -- NULL = approximate (first week etc.)
  advance_days_trigger INT  NOT NULL DEFAULT 14,              -- trigger X days before event
  target_segment       TEXT NOT NULL DEFAULT 'all'
                         CHECK (target_segment IN ('all', 'vip_only', 'repeat_clients')),
  target_service_types TEXT[] DEFAULT '{}',                   -- non-empty only when segment='service_type'
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Monaco/Riviera events
INSERT INTO seasonal_events (name, slug, description, recurrence_month, recurrence_day, advance_days_trigger, target_segment) VALUES
  ('Monaco Grand Prix',          'monaco-grand-prix',       'Formula 1 Grand Prix de Monaco — the jewel of the F1 calendar.',                  5,  25, 21, 'all'),
  ('Monaco Yacht Show',          'monaco-yacht-show',       'World''s premier superyacht show at Port Hercule.',                              9,  23, 14, 'all'),
  ('Christmas & New Year',       'christmas-new-year',      'Festive season — boutiques, restaurants, and salons at full capacity.',          12,  15, 10, 'all'),
  ('MIPCOM Cannes',              'mipcom-cannes',           'International TV content market in Cannes — HNW media crowd.',                  10,  12, 14, 'all'),
  ('MIDEM Cannes',               'midem-cannes',            'Global music industry event in Cannes.',                                         6,   5, 14, 'all'),
  ('F1 Pre-Season Testing',      'f1-testing',              'F1 testing at Circuit de Barcelona — F1 crowd in Monaco.',                       2,  20, 10, 'vip_only'),
  ('Monaco International Circus','monaco-circus',           'Festival International du Cirque de Monte-Carlo.',                               1,  20, 10, 'all'),
  ('Monte-Carlo Rolex Masters',  'rolex-masters-tennis',    'ATP 1000 tennis tournament at Monte-Carlo Country Club.',                        4,  10, 14, 'all'),
  ('Monaco Run',                 'monaco-run',              'Annual running event through the Principality.',                                 2,   1, 10, 'all'),
  ('Cannes Film Festival',       'cannes-film-festival',    'Festival de Cannes — A-listers flood the Riviera.',                              5,  12, 14, 'all');


-- ============================================================
-- TABLE: venue_campaign_settings
-- Per-venue overrides: opt-in to events, custom advance days, frequency cap.
-- ============================================================
CREATE TABLE venue_campaign_settings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id             UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  seasonal_event_id    UUID NOT NULL REFERENCES seasonal_events(id) ON DELETE CASCADE,
  is_enabled           BOOLEAN NOT NULL DEFAULT TRUE,         -- venue can disable specific events
  advance_days_override INT,                                  -- NULL = use seasonal_events default
  frequency_cap_days   INT  NOT NULL DEFAULT 21,              -- min days between campaigns to same client
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_venue_event UNIQUE (venue_id, seasonal_event_id)
);

CREATE INDEX idx_venue_campaign_settings_venue ON venue_campaign_settings(venue_id);
CREATE INDEX idx_venue_campaign_settings_event ON venue_campaign_settings(seasonal_event_id);

ALTER TABLE venue_campaign_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venue_campaign_settings_owner"
  ON venue_campaign_settings FOR ALL
  USING (venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL));


-- ============================================================
-- TABLE: campaign_templates
-- Message templates per seasonal event × language × channel.
-- Merge tags: {{client_name}}, {{venue_name}}, {{event_name}}, {{event_date}}.
-- ============================================================
CREATE TABLE campaign_templates (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seasonal_event_id    UUID NOT NULL REFERENCES seasonal_events(id) ON DELETE CASCADE,
  language             TEXT NOT NULL CHECK (language IN ('fr', 'en', 'ru')),
  channel              TEXT NOT NULL CHECK (channel IN ('whatsapp', 'instagram')),
  subject              TEXT,                                  -- reserved for future email support
  body                 TEXT NOT NULL,
  use_ai_enrichment    BOOLEAN NOT NULL DEFAULT FALSE,        -- if TRUE, AI rewrites body at send time
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_template_event_lang_channel UNIQUE (seasonal_event_id, language, channel)
);

CREATE INDEX idx_campaign_templates_event ON campaign_templates(seasonal_event_id);

ALTER TABLE campaign_templates ENABLE ROW LEVEL SECURITY;
-- Templates are global (not venue-scoped); readable by all authenticated users
CREATE POLICY "campaign_templates_readable"
  ON campaign_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Seed default templates (FR/EN/RU × WhatsApp) for Monaco Grand Prix
INSERT INTO campaign_templates (seasonal_event_id, language, channel, body) VALUES
  ((SELECT id FROM seasonal_events WHERE slug = 'monaco-grand-prix'), 'fr', 'whatsapp',
   'Bonjour {{client_name}} 👋 Le Grand Prix de Monaco approche ! Réservez dès maintenant chez {{venue_name}} pour profiter de l''ambiance unique de la Principauté. Répondez à ce message pour réserver.'),
  ((SELECT id FROM seasonal_events WHERE slug = 'monaco-grand-prix'), 'en', 'whatsapp',
   'Hi {{client_name}} 👋 The Monaco Grand Prix is just around the corner! Book your visit at {{venue_name}} and be part of the most glamorous weekend in motorsport. Reply to reserve your spot.'),
  ((SELECT id FROM seasonal_events WHERE slug = 'monaco-grand-prix'), 'ru', 'whatsapp',
   'Привет, {{client_name}} 👋 Гран-при Монако уже совсем скоро! Забронируйте визит в {{venue_name}} заранее — в это время все места разлетаются. Ответьте на это сообщение, чтобы записаться.');


-- ============================================================
-- TABLE: campaign_runs
-- One record per triggered campaign batch (venue × event × year).
-- ============================================================
CREATE TABLE campaign_runs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id             UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  seasonal_event_id    UUID NOT NULL REFERENCES seasonal_events(id),
  event_year           INT  NOT NULL,                         -- prevents duplicate runs in same year
  trigger_type         TEXT NOT NULL DEFAULT 'auto'
                         CHECK (trigger_type IN ('auto', 'manual')),
  triggered_by_agent   UUID,                                  -- set for manual triggers
  target_client_count  INT  NOT NULL DEFAULT 0,
  sent_count           INT  NOT NULL DEFAULT 0,
  failed_count         INT  NOT NULL DEFAULT 0,
  skipped_count        INT  NOT NULL DEFAULT 0,               -- opted-out or freq-capped
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'running', 'done', 'failed')),
  started_at           TIMESTAMPTZ,
  finished_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_campaign_run_venue_event_year UNIQUE (venue_id, seasonal_event_id, event_year)
);

CREATE INDEX idx_campaign_runs_venue    ON campaign_runs(venue_id);
CREATE INDEX idx_campaign_runs_event    ON campaign_runs(seasonal_event_id);
CREATE INDEX idx_campaign_runs_status   ON campaign_runs(status);
CREATE INDEX idx_campaign_runs_created  ON campaign_runs(created_at DESC);

ALTER TABLE campaign_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_runs_scoped_to_venue"
  ON campaign_runs FOR ALL
  USING (venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL));


-- ============================================================
-- TABLE: campaign_sends
-- Individual send record: one row per client per campaign_run.
-- ============================================================
CREATE TABLE campaign_sends (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_run_id      UUID NOT NULL REFERENCES campaign_runs(id) ON DELETE CASCADE,
  client_profile_id    UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  channel              TEXT NOT NULL CHECK (channel IN ('whatsapp', 'instagram')),
  language             TEXT NOT NULL CHECK (language IN ('fr', 'en', 'ru')),
  rendered_body        TEXT,                                  -- actual message sent (after merge + AI)
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  skip_reason          TEXT,                                  -- 'opted_out', 'freq_cap', 'no_template', etc.
  external_message_id  TEXT,                                  -- WhatsApp/IG message id from provider
  sent_at              TIMESTAMPTZ,
  error_message        TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaign_sends_run       ON campaign_sends(campaign_run_id);
CREATE INDEX idx_campaign_sends_client    ON campaign_sends(client_profile_id);
CREATE INDEX idx_campaign_sends_status    ON campaign_sends(status);

ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_sends_scoped_via_run"
  ON campaign_sends FOR ALL
  USING (
    campaign_run_id IN (
      SELECT id FROM campaign_runs
      WHERE venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL)
    )
  );


-- ============================================================
-- TABLE: campaign_opt_outs
-- GDPR-safe permanent opt-out: client no longer receives campaigns from venue.
-- ============================================================
CREATE TABLE campaign_opt_outs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id             UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  client_profile_id    UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  opted_out_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason               TEXT,                                  -- optional client-provided reason
  CONSTRAINT uq_opt_out_client_venue UNIQUE (venue_id, client_profile_id)
);

CREATE INDEX idx_campaign_opt_outs_venue  ON campaign_opt_outs(venue_id);
CREATE INDEX idx_campaign_opt_outs_client ON campaign_opt_outs(client_profile_id);

ALTER TABLE campaign_opt_outs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_opt_outs_scoped_to_venue"
  ON campaign_opt_outs FOR ALL
  USING (venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL));


-- ============================================================
-- FUNCTION: get_campaign_targets
-- Returns eligible client_profile_ids for a campaign run.
-- Filters: consent, opt-out, frequency cap, VIP segment.
-- ============================================================
CREATE OR REPLACE FUNCTION get_campaign_targets(
  p_venue_id           UUID,
  p_seasonal_event_id  UUID,
  p_frequency_cap_days INT  DEFAULT 21,
  p_target_segment     TEXT DEFAULT 'all'
)
RETURNS TABLE (client_profile_id UUID, channel TEXT, language TEXT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    cp.id,
    cp.channel,
    cp.language
  FROM client_profiles cp
  WHERE
    cp.venue_id = p_venue_id
    AND cp.consent_given = TRUE
    AND cp.data_deletion_requested_at IS NULL

    -- Not permanently opted out
    AND NOT EXISTS (
      SELECT 1 FROM campaign_opt_outs co
      WHERE co.venue_id = p_venue_id AND co.client_profile_id = cp.id
    )

    -- Frequency cap: no campaign sent to this client in the last N days
    AND NOT EXISTS (
      SELECT 1 FROM campaign_sends cs
      JOIN campaign_runs cr ON cr.id = cs.campaign_run_id
      WHERE cr.venue_id = p_venue_id
        AND cs.client_profile_id = cp.id
        AND cs.status = 'sent'
        AND cs.sent_at >= NOW() - (p_frequency_cap_days || ' days')::INTERVAL
    )

    -- Segment filter
    AND CASE
      WHEN p_target_segment = 'vip_only'      THEN cp.vip_tier = 'vip'
      WHEN p_target_segment = 'repeat_clients' THEN cp.visit_count >= 2
      ELSE TRUE
    END

    -- Must have a reachable channel
    AND cp.channel IN ('whatsapp', 'instagram');
$$;


-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
CREATE TRIGGER update_seasonal_events_updated_at
  BEFORE UPDATE ON seasonal_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_campaign_settings_updated_at
  BEFORE UPDATE ON venue_campaign_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_templates_updated_at
  BEFORE UPDATE ON campaign_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
