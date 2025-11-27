-- Fix username display by updating handle_new_user function and backfilling existing profiles

-- 1. Create a function to generate username from email
CREATE OR REPLACE FUNCTION public.generate_username_from_email(email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  email_prefix TEXT;
  clean_prefix TEXT;
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract the part before @ symbol
  email_prefix := SPLIT_PART(email, '@', 1);
  
  -- Clean up the prefix (remove dots, underscores, dashes, and trailing numbers)
  clean_prefix := REGEXP_REPLACE(
    REGEXP_REPLACE(email_prefix, '[._-]', '', 'g'),
    '\d+$',
    ''
  );
  
  -- Ensure it's not empty after cleaning
  IF LENGTH(clean_prefix) = 0 THEN
    clean_prefix := 'User';
  END IF;
  
  -- Capitalize first letter
  base_username := UPPER(SUBSTRING(clean_prefix FROM 1 FOR 1)) || SUBSTRING(clean_prefix FROM 2);
  
  -- Check if username exists and add counter if needed
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- 2. Update handle_new_user function to generate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username from email
  generated_username := generate_username_from_email(NEW.email);
  
  -- Create profile with username and display_name
  INSERT INTO profiles (
    id, 
    created_at, 
    monthly_image_limit, 
    images_generated_count,
    username,
    display_name
  )
  VALUES (
    NEW.id, 
    NOW(), 
    10,  -- Updated default from 5 to 10
    0,
    generated_username,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      generated_username
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(profiles.username, EXCLUDED.username),
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name);
  
  -- Send welcome notification
  INSERT INTO user_notifications (
    user_id,
    title,
    message,
    notification_type,
    metadata
  ) VALUES (
    NEW.id,
    'Welcome to OpenTeknologies!',
    'Start exploring and creating amazing designs today.',
    'welcome',
    jsonb_build_object('onboarding_step', 1)
  );
  
  -- Log user registration
  INSERT INTO audit_logs (
    user_id,
    action,
    action_details
  ) VALUES (
    NEW.id,
    'user_registered',
    jsonb_build_object(
      'email', NEW.email,
      'username', generated_username,
      'provider', COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
      'registration_time', NOW()
    )
  );
  
  RETURN NEW;
END;
$function$;

-- 3. Update handle_new_user_lifecycle function to match
CREATE OR REPLACE FUNCTION public.handle_new_user_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username from email
  generated_username := generate_username_from_email(NEW.email);
  
  -- Create profile with username and display_name
  INSERT INTO profiles (
    id, 
    created_at, 
    monthly_image_limit, 
    images_generated_count,
    username,
    display_name
  )
  VALUES (
    NEW.id, 
    NOW(), 
    10,  -- Updated default from 5 to 10
    0,
    generated_username,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      generated_username
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(profiles.username, EXCLUDED.username),
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name);
  
  -- Send welcome notification
  INSERT INTO user_notifications (
    user_id,
    title,
    message,
    notification_type,
    metadata
  ) VALUES (
    NEW.id,
    'Welcome to OpenTeknologies!',
    'Start exploring and creating amazing designs today.',
    'welcome',
    jsonb_build_object('onboarding_step', 1)
  );
  
  -- Log user registration
  INSERT INTO audit_logs (
    user_id,
    action,
    action_details
  ) VALUES (
    NEW.id,
    'user_registered',
    jsonb_build_object(
      'email', NEW.email,
      'username', generated_username,
      'provider', COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
      'registration_time', NOW()
    )
  );
  
  RETURN NEW;
END;
$function$;

-- 4. Backfill existing profiles with usernames
DO $$
DECLARE
  profile_record RECORD;
  user_record RECORD;
  generated_username TEXT;
BEGIN
  -- Loop through all profiles that don't have a username
  FOR profile_record IN 
    SELECT p.id 
    FROM profiles p 
    WHERE p.username IS NULL OR p.username = ''
  LOOP
    BEGIN
      -- Get the user's email from auth.users
      SELECT email INTO user_record 
      FROM auth.users 
      WHERE id = profile_record.id;
      
      IF FOUND AND user_record.email IS NOT NULL THEN
        -- Generate username from email
        generated_username := generate_username_from_email(user_record.email);
        
        -- Update the profile
        UPDATE profiles
        SET 
          username = generated_username,
          display_name = COALESCE(display_name, generated_username)
        WHERE id = profile_record.id;
        
        RAISE NOTICE 'Updated profile % with username: %', profile_record.id, generated_username;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to update profile %: %', profile_record.id, SQLERRM;
      CONTINUE;
    END;
  END LOOP;
END $$;

-- 5. Add index on username for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 6. Add comment explaining the username generation logic
COMMENT ON COLUMN profiles.username IS 'Unique username generated from email or user metadata. Generated automatically on user creation.';
COMMENT ON COLUMN profiles.display_name IS 'Display name for the user, can be set by the user or defaults to username.';