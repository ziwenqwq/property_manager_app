-- Create a policy to allow all operations on storage.objects
DROP POLICY IF EXISTS allow_all_storage_objects ON storage.objects;
CREATE POLICY allow_all_storage_objects ON storage.objects FOR ALL USING (true) WITH CHECK (true);
