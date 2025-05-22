-- Add property_photos column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'property_photos'
  ) THEN
    -- Add the property_photos column if it doesn't exist
    ALTER TABLE properties ADD COLUMN property_photos TEXT;
  END IF;
END $$;

-- Update the database types to match our TypeScript types
COMMENT ON COLUMN properties.property_photos IS 'JSON array of property photo URLs';
