-- Rename and extend venue_services for W7 AI context injection
-- Rename active → is_active, duration_min → duration_minutes
-- Add currency, sort_order columns

ALTER TABLE venue_services
  RENAME COLUMN active TO is_active;

ALTER TABLE venue_services
  RENAME COLUMN duration_min TO duration_minutes;

ALTER TABLE venue_services
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Drop old index and recreate with new column name
DROP INDEX IF EXISTS idx_venue_services_active;
CREATE INDEX IF NOT EXISTS idx_venue_services_is_active ON venue_services(venue_id, is_active) WHERE is_active = true;

-- Seed: Richmont Monaco services
INSERT INTO venue_services (venue_id, name, price, currency, category, duration_minutes, is_active, sort_order) VALUES
('ab6fcb09-8ecc-4e51-93af-4dfacea0c84e', 'Soin du visage Mesoestetic', 120, 'EUR', 'Face', 60, true, 1),
('ab6fcb09-8ecc-4e51-93af-4dfacea0c84e', 'Soin éclat Codage', 95, 'EUR', 'Face', 45, true, 2),
('ab6fcb09-8ecc-4e51-93af-4dfacea0c84e', 'Mésolift Teoxane', 150, 'EUR', 'Face', 30, true, 3),
('ab6fcb09-8ecc-4e51-93af-4dfacea0c84e', 'Soin minceur', 110, 'EUR', 'Body', 60, true, 4),
('ab6fcb09-8ecc-4e51-93af-4dfacea0c84e', 'Enveloppement détox', 90, 'EUR', 'Body', 45, true, 5),
('ab6fcb09-8ecc-4e51-93af-4dfacea0c84e', 'Massage relaxant', 90, 'EUR', 'Massage', 60, true, 6),
('ab6fcb09-8ecc-4e51-93af-4dfacea0c84e', 'Massage deep tissue', 110, 'EUR', 'Massage', 60, true, 7),
('ab6fcb09-8ecc-4e51-93af-4dfacea0c84e', 'Massage aux pierres chaudes', 120, 'EUR', 'Massage', 75, true, 8),
('ab6fcb09-8ecc-4e51-93af-4dfacea0c84e', 'Manucure classique', 35, 'EUR', 'Nails', 30, true, 9),
('ab6fcb09-8ecc-4e51-93af-4dfacea0c84e', 'Pose vernis semi-permanent', 45, 'EUR', 'Nails', 45, true, 10),
('ab6fcb09-8ecc-4e51-93af-4dfacea0c84e', 'Pédicure complète', 50, 'EUR', 'Nails', 45, true, 11)
ON CONFLICT DO NOTHING;
