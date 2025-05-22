-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  listing_agent TEXT,
  listing_price NUMERIC,
  square_footage NUMERIC,
  bedrooms INTEGER,
  listing_url TEXT,
  listing_pdf TEXT,
  rating NUMERIC,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  estate_agent TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);

CREATE TABLE IF NOT EXISTS feedback_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL,
  media_type TEXT NOT NULL,
  media_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Add comments to tables and columns
COMMENT ON TABLE properties IS 'Property listings';
COMMENT ON COLUMN properties.rating IS 'Property rating from 1-10';
COMMENT ON COLUMN properties.metadata IS 'JSON metadata for property, including floorplans and other data';

COMMENT ON TABLE feedback_media IS 'Media files for feedback and properties';
COMMENT ON COLUMN feedback_media.media_type IS 'Type of media: image, video, audio, property_photo, etc.';
