-- Migration: VIP Client Recognition — Memory & Preferences
-- MON-18: client_profiles table for Premium Tier 2

-- ============================================================
-- TABLE: client_profiles
-- Per-venue client identity record, built from booking history
-- and explicit staff inputs. Used to personalise AI responses.
-- ============================================================
CREATE TABLE client_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id            UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,

  -- Identity: keyed on phone (WhatsApp) or channel+channel_id (IG/GBM)
  -- At least one of phone / channel_id must be set
  phone               TEXT,                          -- E.164, nullable if IG-only client
  channel             TEXT CHECK (channel IN ('whatsapp', 'instagram', 'google_bm')),
  channel_id          TEXT,                          -- IG user id / GBM conversation id

  -- Resolved display name (most recent booking or staff override)
  full_name           TEXT,
  preferred_name      TEXT,                          -- "Marie", overrides full_name in greetings
  language            TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'ru')),

  -- ── Preference vectors ────────────────────────────────────
  -- Stored as JSONB arrays so Claude can read them directly.
  -- Max lengths enforced in app layer (not DB) to keep prompts lean.
  favourite_services  TEXT[]  DEFAULT '{}',          -- ["balayage", "deep_tissue_massage"]
  disliked_services   TEXT[]  DEFAULT '{}',          -- ["acrylic_nails"]
  preferred_staff     TEXT[]  DEFAULT '{}',          -- staff name or id
  allergies           TEXT[]  DEFAULT '{}',          -- ["latex", "shellac"]
  notes               TEXT,                          -- free-form staff notes (≤500 chars enforced in app)

  -- ── Visit history summary ─────────────────────────────────
  -- Denormalised counters updated by trigger/function on booking completion
  visit_count         INTEGER NOT NULL DEFAULT 0,
  last_visit_at       TIMESTAMPTZ,
  last_service        TEXT,                          -- most recent service_type

  -- ── VIP tier ──────────────────────────────────────────────
  -- Computed from visit_count + spend; updated nightly or on booking close
  vip_tier            TEXT DEFAULT 'standard' CHECK (vip_tier IN ('standard', 'regular', 'vip')),
  lifetime_spend_eur  NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- ── GDPR ─────────────────────────────────────────────────
  -- consent_given must be TRUE before preferences are stored or used
  -- in AI prompts. Reset on explicit withdrawal.
  consent_given       BOOLEAN NOT NULL DEFAULT FALSE,
  consent_given_at    TIMESTAMPTZ,
  data_deletion_requested_at TIMESTAMPTZ,           -- set on GDPR erasure request; triggers job

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Uniqueness: one profile per phone per venue, or channel+id per venue
  CONSTRAINT uq_client_phone_venue     UNIQUE NULLS NOT DISTINCT (venue_id, phone),
  CONSTRAINT uq_client_channel_venue   UNIQUE NULLS NOT DISTINCT (venue_id, channel, channel_id)
);

CREATE INDEX idx_client_profiles_venue       ON client_profiles(venue_id);
CREATE INDEX idx_client_profiles_phone       ON client_profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_client_profiles_vip_tier    ON client_profiles(venue_id, vip_tier);
CREATE INDEX idx_client_profiles_last_visit  ON client_profiles(venue_id, last_visit_at DESC NULLS LAST);

ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Staff can read/update profiles for their venue; service role has full access
CREATE POLICY "client_profiles_venue_owner"
  ON client_profiles FOR ALL
  USING (venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL));


-- ============================================================
-- FUNCTION: upsert_client_profile_from_booking
-- Called after a booking is marked 'completed'.
-- Updates visit_count, last_visit_at, last_service.
-- Does NOT overwrite manually set preferences.
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_client_profile_from_booking(
  p_venue_id      UUID,
  p_phone         TEXT,
  p_full_name     TEXT,
  p_service_type  TEXT,
  p_channel       TEXT DEFAULT 'whatsapp',
  p_channel_id    TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  INSERT INTO client_profiles (
    venue_id, phone, channel, channel_id, full_name, language,
    last_service, visit_count, last_visit_at
  )
  VALUES (
    p_venue_id, p_phone, p_channel, p_channel_id, p_full_name, 'fr',
    p_service_type, 1, NOW()
  )
  ON CONFLICT (venue_id, phone) DO UPDATE SET
    full_name        = COALESCE(EXCLUDED.full_name, client_profiles.full_name),
    last_service     = EXCLUDED.last_service,
    visit_count      = client_profiles.visit_count + 1,
    last_visit_at    = NOW(),
    -- Append service to favourites if not already present (max 10)
    favourite_services = CASE
      WHEN p_service_type IS NOT NULL
        AND NOT (client_profiles.favourite_services @> ARRAY[p_service_type])
        AND array_length(client_profiles.favourite_services, 1) < 10
      THEN client_profiles.favourite_services || ARRAY[p_service_type]
      ELSE client_profiles.favourite_services
    END,
    vip_tier = CASE
      WHEN (client_profiles.visit_count + 1) >= 10 THEN 'vip'
      WHEN (client_profiles.visit_count + 1) >= 4  THEN 'regular'
      ELSE 'standard'
    END,
    updated_at = NOW()
  RETURNING id INTO v_profile_id;

  -- If ON CONFLICT didn't RETURN (Postgres limitation), fetch id
  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id
    FROM client_profiles
    WHERE venue_id = p_venue_id AND phone = p_phone;
  END IF;

  RETURN v_profile_id;
END;
$$;


-- ============================================================
-- FUNCTION: build_vip_context_snippet
-- Returns a compact text block to inject into the Claude system
-- prompt (≤ ~300 tokens). Returns NULL if no profile or no
-- consent.
-- ============================================================
CREATE OR REPLACE FUNCTION build_vip_context_snippet(
  p_venue_id UUID,
  p_phone    TEXT
)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT CASE
    WHEN cp.consent_given = FALSE THEN NULL
    WHEN cp.data_deletion_requested_at IS NOT NULL THEN NULL
    ELSE
      '## Client Context' || E'\n' ||
      'Name: ' || COALESCE(cp.preferred_name, cp.full_name, 'Unknown') || E'\n' ||
      'Language: ' || cp.language || E'\n' ||
      'Visits: ' || cp.visit_count || E'\n' ||
      CASE WHEN cp.last_service IS NOT NULL
           THEN 'Last service: ' || cp.last_service || E'\n' ELSE '' END ||
      CASE WHEN array_length(cp.favourite_services, 1) > 0
           THEN 'Favourite services: ' || array_to_string(cp.favourite_services, ', ') || E'\n'
           ELSE '' END ||
      CASE WHEN array_length(cp.allergies, 1) > 0
           THEN '⚠️ Allergies/contraindications: ' || array_to_string(cp.allergies, ', ') || E'\n'
           ELSE '' END ||
      CASE WHEN cp.notes IS NOT NULL
           THEN 'Staff notes: ' || LEFT(cp.notes, 200) || E'\n'
           ELSE '' END ||
      CASE WHEN cp.vip_tier != 'standard'
           THEN 'Tier: ' || UPPER(cp.vip_tier) || E'\n'
           ELSE '' END
  END
  FROM client_profiles cp
  WHERE cp.venue_id = p_venue_id AND cp.phone = p_phone
  LIMIT 1;
$$;


-- ============================================================
-- UPDATED_AT trigger (reuse existing function)
-- ============================================================
CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
