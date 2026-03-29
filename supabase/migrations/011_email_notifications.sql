-- Email notification settings for venue owners
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS owner_email text,
  ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_notify_messages boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_notify_bookings boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_notify_negative_reviews boolean DEFAULT true;
