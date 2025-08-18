-- Add missing INSERT policy for error_logs to allow users to log their own errors
CREATE POLICY "Users can insert their own error logs" 
ON error_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Also add a policy for system/service role to insert error logs
CREATE POLICY "System can insert error logs" 
ON error_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');