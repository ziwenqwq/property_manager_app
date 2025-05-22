-- This is a comprehensive database setup script that includes all necessary
-- database modifications in one place

-- Function to execute arbitrary SQL statements
CREATE OR REPLACE FUNCTION exec_sql(sql_statement text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_statement;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a column exists in a table
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

-- Add floorplans column if it doesn't exist
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

-- Add an index on the rating column for better performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'properties'
        AND indexname = 'idx_properties_rating'
    ) THEN
        CREATE INDEX idx_properties_rating ON properties(rating);
    END IF;
END $$;

-- Make sure RLS policies allow reading and updating the rating column
DO $$
BEGIN
    -- Check if the policy exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'properties'
        AND policyname = 'Enable read access for all users'
    ) THEN
        -- Create the policy if it doesn't exist
        CREATE POLICY "Enable read access for all users" ON properties
            FOR SELECT USING (true);
    END IF;
    
    -- Check if the update policy exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'properties'
        AND policyname = 'Enable update for authenticated users'
    ) THEN
        -- Create the policy if it doesn't exist
        CREATE POLICY "Enable update for authenticated users" ON properties
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Verify all columns exist
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'properties' 
    AND column_name IN ('property_photos', 'rating', 'floorplans');
