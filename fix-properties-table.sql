-- Check if the rating column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'rating'
  ) THEN
    -- Add the rating column if it doesn't exist
    ALTER TABLE properties ADD COLUMN rating NUMERIC;
  END IF;
END $$;

-- Update the database types to match our TypeScript types
COMMENT ON TABLE properties IS 'Property listings';
COMMENT ON COLUMN properties.rating IS 'Property rating from 1-10';
