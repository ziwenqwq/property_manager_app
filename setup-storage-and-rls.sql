-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
('property-images', 'property-images', true),
('floorplans', 'floorplans', true),
('listing-pdfs', 'listing-pdfs', true),
('feedback-images', 'feedback-images', true),
('feedback-videos', 'feedback-videos', true),
('feedback-audio', 'feedback-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_media ENABLE ROW LEVEL SECURITY;

-- Create policies for properties table
DROP POLICY IF EXISTS allow_all_properties ON properties;
CREATE POLICY allow_all_properties ON properties FOR ALL USING (true) WITH CHECK (true);

-- Create policies for bookings table
DROP POLICY IF EXISTS allow_all_bookings ON bookings;
CREATE POLICY allow_all_bookings ON bookings FOR ALL USING (true) WITH CHECK (true);

-- Create policies for feedback table
DROP POLICY IF EXISTS allow_all_feedback ON feedback;
CREATE POLICY allow_all_feedback ON feedback FOR ALL USING (true) WITH CHECK (true);

-- Create policies for feedback_media table
DROP POLICY IF EXISTS allow_all_feedback_media ON feedback_media;
CREATE POLICY allow_all_feedback_media ON feedback_media FOR ALL USING (true) WITH CHECK (true);

-- Create policy for storage.objects table
DROP POLICY IF EXISTS allow_all_storage_objects ON storage.objects;
CREATE POLICY allow_all_storage_objects ON storage.objects FOR ALL USING (true) WITH CHECK (true);

-- Add metadata column to properties if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE properties ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- Add rating column to properties if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'rating'
  ) THEN
    ALTER TABLE properties ADD COLUMN rating NUMERIC;
  END IF;
END $$;
