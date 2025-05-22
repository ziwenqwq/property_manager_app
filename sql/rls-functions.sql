-- Function to enable RLS on a table
CREATE OR REPLACE FUNCTION enable_rls(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a policy that allows all operations for all users
CREATE OR REPLACE FUNCTION create_allow_all_policy(table_name text, policy_name text)
RETURNS void AS $$
BEGIN
  -- Drop the policy if it already exists
  BEGIN
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors
  END;
  
  -- Create the policy
  EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (true) WITH CHECK (true)', 
                policy_name, table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
