-- Create or replace the check_column_exists function to fix the ambiguous column reference
CREATE OR REPLACE FUNCTION check_column_exists(p_table_name text, p_column_name text)
RETURNS boolean AS $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = p_table_name 
    AND column_name = p_column_name
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT check_column_exists('bookings', 'estate_agent');
