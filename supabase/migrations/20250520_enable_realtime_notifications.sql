
-- Enable row level security on the table
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for the user_notifications table
CREATE POLICY "Users can view their own notifications" 
ON user_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON user_notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Set the replica identity to full for realtime change tracking
ALTER TABLE user_notifications REPLICA IDENTITY FULL;

-- Add the table to the realtime publication for change events
ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;
