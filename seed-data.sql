-- Insert sample properties
INSERT INTO properties (name, address, listing_agent, listing_price, square_footage, bedrooms, created_at, updated_at)
VALUES 
('Luxury Waterfront Villa', '123 Oceanview Drive, Malibu, CA 90210', 'Jane Smith', 2450000, 3200, 4, NOW(), NOW()),
('Modern Mountain Retreat', '789 Alpine Way, Aspen, CO 81611', 'David Wilson', 3750000, 4100, 5, NOW(), NOW()),
('Downtown Modern Loft', '456 Urban Street, Apt 7B, New York, NY 10001', 'Michael Johnson', 1250000, 1800, 2, NOW(), NOW()),
('Suburban Family Home', '789 Maple Avenue, Chicago, IL 60007', 'Robert Davis', 850000, 2500, 3, NOW(), NOW());

-- Insert sample bookings
INSERT INTO bookings (property_id, date, time, estate_agent, notes, created_at)
VALUES 
((SELECT id FROM properties WHERE name = 'Luxury Waterfront Villa' LIMIT 1), CURRENT_DATE + INTERVAL '2 days', '14:00', 'Alex Thompson', 'Interested in seeing the pool area and backyard', NOW());

-- Insert sample feedback
INSERT INTO feedback (property_id, text, created_at)
VALUES 
((SELECT id FROM properties WHERE name = 'Luxury Waterfront Villa' LIMIT 1), 'Absolutely stunning property with amazing ocean views. The master bedroom is spacious and the kitchen is well-equipped with high-end appliances.', NOW());

-- Insert sample feedback media
INSERT INTO feedback_media (feedback_id, media_type, media_url, created_at)
VALUES 
((SELECT id FROM feedback LIMIT 1), 'image', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', NOW());
