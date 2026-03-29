-- Add owner_id to venues (links a Supabase auth user to their venue)
ALTER TABLE venues ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS venues_owner_id_idx ON venues(owner_id);

-- Seed: link Richmont Monaco to 4mdkfr@gmail.com
UPDATE venues
SET owner_id = (SELECT id FROM auth.users WHERE email = '4mdkfr@gmail.com' LIMIT 1)
WHERE id = 'ab6fcb09-8ecc-4e51-93af-4dfacea0c84e';
