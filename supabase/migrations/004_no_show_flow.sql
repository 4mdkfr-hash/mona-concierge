-- Migration: No-Show Detection & Reschedule Flow
-- MON-19: Schema changes for smart no-show management (Premium Tier 2, W6)

-- ============================================================
-- EXTEND bookings.status to include no_show + rescheduled
-- ============================================================
ALTER TABLE bookings DROP CONSTRAINT bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'));

-- Track when no-show notification was sent (prevents duplicate messages)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS no_show_notified_at TIMESTAMPTZ;

-- Link a rescheduled booking back to the original no-show booking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rescheduled_from_booking_id UUID REFERENCES bookings(id);

-- Partial index for efficient no-show scanner queries
-- Scans: status='confirmed' AND booked_at <= now()-15min AND no_show_notified_at IS NULL
CREATE INDEX IF NOT EXISTS idx_bookings_no_show_scan
  ON bookings(booked_at, venue_id)
  WHERE status = 'confirmed' AND no_show_notified_at IS NULL;

-- ============================================================
-- EXTEND follow_up_events.event_type to include no_show_reschedule
-- Reuses the existing dispatch pipeline (Claude → channel → retry)
-- ============================================================
ALTER TABLE follow_up_events DROP CONSTRAINT follow_up_events_event_type_check;
ALTER TABLE follow_up_events ADD CONSTRAINT follow_up_events_event_type_check
  CHECK (event_type IN (
    'pre_visit_upsell',
    'post_visit_cross_sell',
    'retention',
    'no_show_reschedule'
  ));

-- Store proposed reschedule slots as JSON array in the event metadata
-- e.g. ["Mardi 27 mai à 14h00", "Mercredi 28 mai à 10h30", "Jeudi 29 mai à 16h00"]
ALTER TABLE follow_up_events ADD COLUMN IF NOT EXISTS proposed_slots JSONB;
