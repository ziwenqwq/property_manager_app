-- Check if the rating column exists in the properties table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'properties'
        AND column_name = 'rating'
    ) THEN
        -- Add the rating column if it doesn't exist
        ALTER TABLE properties ADD COLUMN rating INTEGER;
    END IF;
END $$;

-- Update any NULL ratings to NULL (this forces a refresh of the column)
UPDATE properties SET rating = rating WHERE rating IS NOT NULL;

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
