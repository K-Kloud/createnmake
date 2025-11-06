-- Add notification_preferences column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{
  "milestone": {"email": true, "toast": true, "in_app": true},
  "badge": {"email": true, "toast": true, "in_app": true},
  "leaderboard": {"email": true, "toast": true, "in_app": true},
  "engagement": {"email": true, "toast": true, "in_app": true},
  "subscription": {"email": true, "toast": true, "in_app": true},
  "welcome": {"email": true, "toast": true, "in_app": true},
  "security": {"email": true, "toast": true, "in_app": true},
  "verification": {"email": true, "toast": true, "in_app": true},
  "order": {"email": true, "toast": true, "in_app": true},
  "payment": {"email": true, "toast": true, "in_app": true},
  "system": {"email": true, "toast": true, "in_app": true},
  "re_engagement": {"email": true, "toast": false, "in_app": true},
  "recommendation": {"email": false, "toast": true, "in_app": true},
  "content_update": {"email": false, "toast": true, "in_app": true},
  "deal": {"email": true, "toast": true, "in_app": true},
  "make_reminder": {"email": true, "toast": true, "in_app": true},
  "creator_activity": {"email": false, "toast": true, "in_app": true}
}'::jsonb;