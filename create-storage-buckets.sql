-- Create storage buckets directly
INSERT INTO storage.buckets (id, name, public)
VALUES 
('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES 
('floorplans', 'floorplans', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES 
('listing-pdfs', 'listing-pdfs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES 
('feedback-images', 'feedback-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES 
('feedback-videos', 'feedback-videos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES 
('feedback-audio', 'feedback-audio', true)
ON CONFLICT (id) DO NOTHING;
