-- Make sure property_photos column exists
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
    
    -- Add comment
    COMMENT ON COLUMN properties.property_photos IS 'JSON array of property photo URLs';
  END IF;
END $$;

-- Check if the column was added successfully
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name = 'property_photos';

-- Test updating a property with photos
UPDATE properties
SET property_photos = '["https://example.com/test-photo.jpg"]'
WHERE name LIKE '%Goodge Street%';
