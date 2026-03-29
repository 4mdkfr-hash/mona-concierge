-- Menu / Services table for venue AI context
CREATE TABLE IF NOT EXISTS venue_services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric,
  duration_min integer,
  category text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venue_services_venue_id ON venue_services(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_services_active ON venue_services(venue_id, active) WHERE active = true;

ALTER TABLE venue_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venue members can manage services"
  ON venue_services FOR ALL
  USING (venue_id IN (SELECT id FROM venues));
