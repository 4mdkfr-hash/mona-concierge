-- Migration: Fix google channel name inconsistency
-- venue_channels and conversations had 'google_business' in CHECK constraint
-- but all application code uses 'google_bm'. Align to 'google_bm'.

ALTER TABLE venue_channels
  DROP CONSTRAINT IF EXISTS venue_channels_channel_check;

ALTER TABLE venue_channels
  ADD CONSTRAINT venue_channels_channel_check
    CHECK (channel IN ('whatsapp', 'instagram', 'google_bm'));

ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS conversations_channel_check;

ALTER TABLE conversations
  ADD CONSTRAINT conversations_channel_check
    CHECK (channel IN ('whatsapp', 'instagram', 'google_bm'));
