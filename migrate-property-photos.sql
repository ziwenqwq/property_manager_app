-- This script migrates property photos from feedback_media to property metadata
-- First, create a function to handle the migration
CREATE OR REPLACE FUNCTION migrate_property_photos() RETURNS void AS $$
DECLARE
    property_record RECORD;
    photo_urls TEXT[];
    metadata_json JSONB;
BEGIN
    -- Loop through all properties
    FOR property_record IN SELECT id, metadata FROM properties LOOP
        -- Get photos for this property from feedback_media
        SELECT array_agg(media_url) INTO photo_urls
        FROM feedback_media
        WHERE feedback_id = property_record.id AND media_type = 'property_photo';
        
        -- If we found photos, update the property metadata
        IF photo_urls IS NOT NULL AND array_length(photo_urls, 1) > 0 THEN
            -- Parse existing metadata or create new object
            IF property_record.metadata IS NULL THEN
                metadata_json := '{}'::jsonb;
            ELSE
                metadata_json := property_record.metadata::jsonb;
            END IF;
            
            -- Add photos to metadata
            metadata_json := jsonb_set(metadata_json, '{photos}', to_jsonb(photo_urls));
            
            -- Update the property
            UPDATE properties
            SET metadata = metadata_json
            WHERE id = property_record.id;
            
            -- Delete the old photo records
            DELETE FROM feedback_media
            WHERE feedback_id = property_record.id AND media_type = 'property_photo';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_property_photos();

-- Drop the function after use
DROP FUNCTION migrate_property_photos();
