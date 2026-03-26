-- Migration: Smart Upsell & Follow-up System
-- MON-15: DB schema for upsell mappings, follow-up event queue, message schedule

-- ============================================================
-- TABLE: upsell_mappings
-- Per-venue rules: procedure → recommended product/service
-- ============================================================
CREATE TABLE upsell_mappings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  -- The service/procedure the customer just had (or booked)
  trigger_service TEXT NOT NULL,
  -- What to recommend
  recommended_product TEXT NOT NULL,
  -- Which follow-up type this mapping applies to
  event_type      TEXT NOT NULL CHECK (event_type IN ('pre_visit_upsell', 'post_visit_cross_sell', 'retention')),
  -- Hours offset from booking time to fire:
  --   pre_visit_upsell: negative (e.g. -24 = 24h before)
  --   post_visit_cross_sell: positive (e.g. 48 = 48h after)
  --   retention: positive (e.g. 672 = ~4 weeks after)
  fire_offset_hours INTEGER NOT NULL DEFAULT 24,
  -- Locale-keyed message template key (references prompt_templates)
  template_key    TEXT NOT NULL DEFAULT 'default',
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_upsell_mappings_venue ON upsell_mappings(venue_id);
CREATE INDEX idx_upsell_mappings_service ON upsell_mappings(venue_id, trigger_service);

ALTER TABLE upsell_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venue_owner_only" ON upsell_mappings
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'venue_id' = venue_id::text));


-- ============================================================
-- TABLE: follow_up_events
-- Scheduled outbound event queue, triggered by booking completion
-- Cron scans this every 15 min for fire_at <= now, status = pending
-- ============================================================
CREATE TABLE follow_up_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id            UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  booking_id          UUID REFERENCES bookings(id) ON DELETE SET NULL,
  conversation_id     UUID REFERENCES conversations(id) ON DELETE SET NULL,
  upsell_mapping_id   UUID REFERENCES upsell_mappings(id) ON DELETE SET NULL,

  event_type          TEXT NOT NULL CHECK (event_type IN ('pre_visit_upsell', 'post_visit_cross_sell', 'retention')),
  fire_at             TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),

  -- Delivery target (denormalised for easy cron access without joining bookings)
  customer_name       TEXT,
  customer_phone      TEXT,                          -- E.164 for WhatsApp
  customer_channel    TEXT NOT NULL
                        CHECK (customer_channel IN ('whatsapp', 'instagram', 'google_bm')),
  customer_channel_id TEXT NOT NULL,                 -- phone / IG user id / GBM conv id
  language            TEXT NOT NULL DEFAULT 'fr'
                        CHECK (language IN ('fr', 'en', 'ru')),

  retry_count         INTEGER NOT NULL DEFAULT 0,
  last_error          TEXT,
  processed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_follow_up_events_venue ON follow_up_events(venue_id);
CREATE INDEX idx_follow_up_events_fire ON follow_up_events(status, fire_at)
  WHERE status = 'pending';
CREATE INDEX idx_follow_up_events_booking ON follow_up_events(booking_id);

ALTER TABLE follow_up_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON follow_up_events
  USING (auth.role() = 'service_role');


-- ============================================================
-- TABLE: message_schedule
-- Outbound message queue with status tracking and retry/backoff
-- ============================================================
CREATE TABLE message_schedule (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id              UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  follow_up_event_id    UUID NOT NULL REFERENCES follow_up_events(id) ON DELETE CASCADE,

  channel               TEXT NOT NULL
                          CHECK (channel IN ('whatsapp', 'instagram', 'google_bm')),
  recipient_id          TEXT NOT NULL,   -- phone (WhatsApp) / user_id (IG) / conv_id (GBM)

  -- Rendered message content (filled by AI at dispatch time)
  message_content       TEXT,
  ai_model              TEXT,
  prompt_tokens         INTEGER,
  completion_tokens     INTEGER,

  status                TEXT NOT NULL DEFAULT 'queued'
                          CHECK (status IN ('queued', 'sending', 'sent', 'failed')),
  sent_at               TIMESTAMPTZ,
  external_message_id   TEXT,           -- ID returned by messaging platform

  retry_count           INTEGER NOT NULL DEFAULT 0,
  next_retry_at         TIMESTAMPTZ,
  last_error            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_schedule_venue ON message_schedule(venue_id);
CREATE INDEX idx_message_schedule_status ON message_schedule(status, next_retry_at)
  WHERE status IN ('queued', 'failed');
CREATE INDEX idx_message_schedule_event ON message_schedule(follow_up_event_id);

ALTER TABLE message_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON message_schedule
  USING (auth.role() = 'service_role');


-- ============================================================
-- Seed: default upsell mapping templates (example data, Monaco/Riviera context)
-- These would normally be inserted per-venue via the owner dashboard.
-- Kept here as reference for the Engineer to populate in dev.
-- ============================================================
-- INSERT INTO upsell_mappings (venue_id, trigger_service, recommended_product, event_type, fire_offset_hours, template_key)
-- SELECT id, 'haircut', 'hair_treatment', 'post_visit_cross_sell', 48, 'salon_crosssell'
-- FROM venues WHERE type = 'salon' LIMIT 1;
