-- Add floorplans column to properties table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'floorplans'
  ) THEN
    -- Add the floorplans column if it doesn't exist
    ALTER TABLE properties ADD COLUMN floorplans TEXT;
    
    -- Add comment
    COMMENT ON COLUMN properties.floorplans IS 'JSON array of floorplan image URLs';
  END IF;
END $$;
