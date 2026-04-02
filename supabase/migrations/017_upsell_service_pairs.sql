-- Migration: Upsell service pairs — per-service upsell recommendation
-- B2 from MON-102: Settings → Upsell Pairs section

ALTER TABLE venue_services
  ADD COLUMN IF NOT EXISTS upsell_service_id UUID REFERENCES venue_services(id) ON DELETE SET NULL;

COMMENT ON COLUMN venue_services.upsell_service_id IS 'When this service is booked/discussed, AI suggests this upsell service (one suggestion max)';

CREATE INDEX IF NOT EXISTS idx_venue_services_upsell
  ON venue_services(venue_id, upsell_service_id)
  WHERE upsell_service_id IS NOT NULL;
