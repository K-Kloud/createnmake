-- Fix session handling to prevent duplicate constraint violations
-- Add a function to handle session cleanup and creation

CREATE OR REPLACE FUNCTION handle_session_upsert(
  p_user_id uuid,
  p_session_id text,
  p_device_type text DEFAULT NULL,
  p_browser text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- First, try to update existing session
  UPDATE user_sessions
  SET 
    start_time = NOW(),
    last_activity = NOW(),
    device_type = COALESCE(p_device_type, device_type),
    browser = COALESCE(p_browser, browser),
    ip_address = COALESCE(p_ip_address, ip_address)
  WHERE session_id = p_session_id;
  
  -- If no session was updated, insert a new one
  IF NOT FOUND THEN
    INSERT INTO user_sessions (
      user_id,
      session_id,
      start_time,
      last_activity,
      device_type,
      browser,
      ip_address
    ) VALUES (
      p_user_id,
      p_session_id,
      NOW(),
      NOW(),
      p_device_type,
      p_browser,
      p_ip_address
    )
    ON CONFLICT (session_id) DO UPDATE SET
      start_time = NOW(),
      last_activity = NOW(),
      device_type = COALESCE(p_device_type, user_sessions.device_type),
      browser = COALESCE(p_browser, user_sessions.browser),
      ip_address = COALESCE(p_ip_address, user_sessions.ip_address);
  END IF;
END;
$$;