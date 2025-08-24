-- Fix handle_new_user_lifecycle function to use correct metadata field
CREATE OR REPLACE FUNCTION public.handle_new_user_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile if it doesn't exist
  INSERT INTO profiles (id, created_at, monthly_image_limit, images_generated_count)
  VALUES (NEW.id, NOW(), 5, 0)
  ON CONFLICT (id) DO NOTHING;
  
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
  
  -- Log user registration - fix metadata field access
  INSERT INTO audit_logs (
    user_id,
    action,
    action_details
  ) VALUES (
    NEW.id,
    'user_registered',
    jsonb_build_object(
      'email', NEW.email,
      'provider', COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
      'registration_time', NOW()
    )
  );
  
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user function to use correct metadata field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile if it doesn't exist
  INSERT INTO profiles (id, created_at, monthly_image_limit, images_generated_count)
  VALUES (NEW.id, NOW(), 5, 0)
  ON CONFLICT (id) DO NOTHING;
  
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
  
  -- Log user registration - fix metadata field access
  INSERT INTO audit_logs (
    user_id,
    action,
    action_details
  ) VALUES (
    NEW.id,
    'user_registered',
    jsonb_build_object(
      'email', NEW.email,
      'provider', COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
      'registration_time', NOW()
    )
  );
  
  RETURN NEW;
END;
$function$;