-- MonaConcierge Initial Schema
-- Run in Supabase SQL Editor or via supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- VENUES
-- ==========================================
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('restaurant', 'boutique', 'salon')),
  country text DEFAULT 'MC',
  timezone text DEFAULT 'Europe/Monaco',
  tone_brief text,
  languages text[] DEFAULT '{fr,en,ru}',
  google_place_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venues are readable by authenticated users with matching venue_id"
  ON venues FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ==========================================
-- VENUE CHANNELS
-- ==========================================
CREATE TABLE IF NOT EXISTS venue_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'instagram', 'google_business')),
  channel_account_id text,
  access_token text,
  webhook_verified boolean DEFAULT false,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE venue_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venue channels readable by venue owners"
  ON venue_channels FOR SELECT
  USING (
    venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL)
  );

-- ==========================================
-- CONVERSATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'instagram', 'google_business')),
  customer_id text NOT NULL,
  customer_name text,
  customer_phone text,
  language text CHECK (language IN ('fr', 'en', 'ru')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'snoozed')),
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_conversations_venue_id ON conversations(venue_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversations scoped to venue"
  ON conversations FOR ALL
  USING (venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL));

-- ==========================================
-- MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content text NOT NULL,
  media_url text,
  ai_generated boolean DEFAULT false,
  ai_model text,
  status text DEFAULT 'delivered' CHECK (status IN ('pending', 'delivered', 'read', 'failed')),
  external_message_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages scoped to venue via conversation"
  ON messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL)
    )
  );

-- ==========================================
-- GOOGLE REVIEWS
-- ==========================================
CREATE TABLE IF NOT EXISTS google_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  review_id text UNIQUE NOT NULL,
  author_name text,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content text,
  reply_text text,
  replied_at timestamptz,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_google_reviews_venue_id ON google_reviews(venue_id);
CREATE INDEX idx_google_reviews_rating ON google_reviews(rating);

ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews scoped to venue"
  ON google_reviews FOR ALL
  USING (venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL));

-- ==========================================
-- BOOKINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  customer_name text,
  customer_phone text,
  customer_channel text,
  service_type text,
  booked_at timestamptz NOT NULL,
  google_event_id text,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  confirmation_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bookings_venue_id ON bookings(venue_id);
CREATE INDEX idx_bookings_booked_at ON bookings(booked_at);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bookings scoped to venue"
  ON bookings FOR ALL
  USING (venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL));

-- ==========================================
-- AI USAGE LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id),
  conversation_id uuid REFERENCES conversations(id),
  model text,
  prompt_tokens int,
  completion_tokens int,
  cost_eur numeric(10,4),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ai_usage_logs_venue_id ON ai_usage_logs(venue_id);
CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI logs scoped to venue"
  ON ai_usage_logs FOR SELECT
  USING (venue_id IN (SELECT id FROM venues WHERE auth.uid() IS NOT NULL));

-- ==========================================
-- UPDATED_AT TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
