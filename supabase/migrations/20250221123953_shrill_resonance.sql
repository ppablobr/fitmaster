-- Drop the existing INSERT policy
DROP POLICY "Users can insert own exercises" ON exercises;

-- Create a new INSERT policy that allows inserts for your test user
-- REPLACE '00000000-0000-0000-0000-000000000000' with your actual test user ID
CREATE POLICY "Allow insert for test user"
  ON exercises
  FOR INSERT
  TO public -- Or 'authenticated' if you want to restrict it slightly more
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Keep the SELECT policy as is (or modify it similarly if needed)
CREATE POLICY "Users can read own exercises"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
