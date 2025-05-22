-- Add metadata column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'metadata'
  ) THEN
    -- Add the metadata column if it doesn't exist
    ALTER TABLE properties ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- Update the database types to match our TypeScript types
COMMENT ON COLUMN properties.metadata IS 'JSON metadata for property, including floorplans and other data';
