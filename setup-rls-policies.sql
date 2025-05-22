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
