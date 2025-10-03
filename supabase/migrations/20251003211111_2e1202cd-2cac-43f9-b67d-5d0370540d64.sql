-- Allow anonymous and authenticated users to view public profile information
CREATE POLICY "Anyone can view public profiles"
ON profiles
FOR SELECT
TO anon, authenticated
USING (true);