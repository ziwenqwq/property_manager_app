-- Check if the estate_agent column exists in the bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'estate_agent'
  ) THEN
    -- Add the estate_agent column if it doesn't exist
    ALTER TABLE bookings ADD COLUMN estate_agent TEXT;
    
    -- Add comment
    COMMENT ON COLUMN bookings.estate_agent IS 'Name of the estate agent conducting the viewing';
  END IF;
END $$;

-- Check if the status column exists in the bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'status'
  ) THEN
    -- Add the status column if it doesn't exist
    ALTER TABLE bookings ADD COLUMN status TEXT DEFAULT 'scheduled';
    
    -- Add comment
    COMMENT ON COLUMN bookings.status IS 'Status of the booking: scheduled, completed, or cancelled';
  END IF;
END $$;

-- Verify the columns exist
SELECT 
    column_name, 
    data_type,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_name = 'bookings' 
    AND column_name IN ('estate_agent', 'status');
