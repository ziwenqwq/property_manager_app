-- This is the database schema we'll use for our Supabase database
-- You can run this in the Supabase SQL editor

-- Create tables
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  listing_agent TEXT,
  listing_price DECIMAL(12, 2),
  square_footage INTEGER,
  bedrooms INTEGER,
  listing_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  is_floorplan BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  estate_agent TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'image', 'video', 'audio'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_media ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Properties policies
CREATE POLICY "Users can view their own properties" 
  ON properties FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties" 
  ON properties FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties" 
  ON properties FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" 
  ON properties FOR DELETE 
  USING (auth.uid() = user_id);

-- Property images policies
CREATE POLICY "Users can view images of their properties" 
  ON property_images FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = property_images.property_id 
    AND properties.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert images to their properties" 
  ON property_images FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = property_images.property_id 
    AND properties.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete images from their properties" 
  ON property_images FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = property_images.property_id 
    AND properties.user_id = auth.uid()
  ));

-- Bookings policies
CREATE POLICY "Users can view their own bookings" 
  ON bookings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" 
  ON bookings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
  ON bookings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" 
  ON bookings FOR DELETE 
  USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view their own feedback" 
  ON feedback FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" 
  ON feedback FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
  ON feedback FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback" 
  ON feedback FOR DELETE 
  USING (auth.uid() = user_id);

-- Feedback media policies
CREATE POLICY "Users can view media of their feedback" 
  ON feedback_media FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM feedback 
    WHERE feedback.id = feedback_media.feedback_id 
    AND feedback.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert media to their feedback" 
  ON feedback_media FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM feedback 
    WHERE feedback.id = feedback_media.feedback_id 
    AND feedback.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete media from their feedback" 
  ON feedback_media FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM feedback 
    WHERE feedback.id = feedback_media.feedback_id 
    AND feedback.user_id = auth.uid()
  ));
