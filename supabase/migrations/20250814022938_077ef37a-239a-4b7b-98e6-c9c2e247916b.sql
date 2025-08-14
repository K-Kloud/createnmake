-- Add foreign key constraints to link comments and replies to profiles
ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE comment_replies 
ADD CONSTRAINT comment_replies_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Ensure profiles table has proper RLS policy for reading profile data
CREATE POLICY "Public can view profile info for comments" 
ON profiles 
FOR SELECT 
USING (true);