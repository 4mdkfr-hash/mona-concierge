-- Migration: Per-venue Google Calendar OAuth token storage
-- B3 from MON-102: Connect Google Calendar button → OAuth2 → store per venue

ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS google_calendar_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_id TEXT DEFAULT 'primary';

COMMENT ON COLUMN venues.google_calendar_refresh_token IS 'OAuth2 refresh token for the venue owner Google Calendar';
COMMENT ON COLUMN venues.google_calendar_id IS 'Google Calendar ID to use for booking events (default: primary)';
