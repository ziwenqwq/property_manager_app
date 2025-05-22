-- Add exec_sql function if it doesn't exist
CREATE OR REPLACE FUNCTION exec_sql(sql_statement text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_statement;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add check_column_exists function
CREATE OR REPLACE FUNCTION check_column_exists(table_name text, column_name text)
RETURNS boolean AS $$
DECLARE
    column_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = $1
        AND column_name = $2
    ) INTO column_exists;
    
    RETURN column_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    
    -- Add comment
    COMMENT ON COLUMN properties.property_photos IS 'JSON array of property photo URLs';
  END IF;
END $$;

-- Add rating column if it doesn't exist
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
    
    -- Add comment
    COMMENT ON COLUMN properties.rating IS 'Property rating from 1-10';
  END IF;
END $$;

-- Test the rating column by updating a property
UPDATE properties
SET rating = 5
WHERE id = (SELECT id FROM properties LIMIT 1);
