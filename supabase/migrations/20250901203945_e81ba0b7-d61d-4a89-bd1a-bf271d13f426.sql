-- Update monthly image limits and implement rollover system

-- 1. Add last_reset_date column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_reset_date DATE DEFAULT CURRENT_DATE;

-- 2. Update default monthly image limit from 5 to 10
ALTER TABLE profiles 
ALTER COLUMN monthly_image_limit SET DEFAULT 10;

-- 3. Update all existing free tier users to have 10 monthly images
UPDATE profiles 
SET monthly_image_limit = 10 
WHERE monthly_image_limit = 5;

-- 4. Update subscription plans to reflect new free tier limit
UPDATE subscription_plans 
SET monthly_image_limit = 10 
WHERE id = 1 AND monthly_image_limit = 5; -- Assuming plan 1 is free tier

-- 5. Create function to reset monthly image counts
CREATE OR REPLACE FUNCTION public.reset_monthly_image_counts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  users_reset INTEGER := 0;
  current_month_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
BEGIN
  -- Reset image counts for users who haven't been reset this month
  UPDATE profiles 
  SET 
    images_generated_count = 0,
    last_reset_date = current_month_start
  WHERE last_reset_date < current_month_start 
     OR last_reset_date IS NULL;
  
  GET DIAGNOSTICS users_reset = ROW_COUNT;
  
  -- Log the reset operation
  INSERT INTO audit_logs (
    action,
    action_details
  ) VALUES (
    'monthly_image_count_reset',
    jsonb_build_object(
      'users_reset', users_reset,
      'reset_date', current_month_start,
      'executed_at', NOW()
    )
  );
  
  RETURN users_reset;
END;
$function$;

-- 6. Create function to get accurate monthly image count
CREATE OR REPLACE FUNCTION public.get_monthly_images_generated(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_month_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  monthly_count INTEGER;
BEGIN
  -- Count images generated this calendar month
  SELECT COUNT(*) INTO monthly_count
  FROM generated_images
  WHERE user_id = user_uuid 
    AND DATE(created_at) >= current_month_start;
  
  RETURN COALESCE(monthly_count, 0);
END;
$function$;

-- 7. Update profiles trigger to handle monthly reset on image generation
CREATE OR REPLACE FUNCTION public.check_and_reset_monthly_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_month_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  actual_monthly_count INTEGER;
BEGIN
  -- Check if user needs monthly reset
  IF OLD.last_reset_date < current_month_start OR OLD.last_reset_date IS NULL THEN
    -- Reset the count and update last_reset_date
    NEW.images_generated_count := 1; -- This will be the first image of the month
    NEW.last_reset_date := current_month_start;
  ELSE
    -- Get actual count from generated_images table
    SELECT public.get_monthly_images_generated(NEW.id) INTO actual_monthly_count;
    NEW.images_generated_count := actual_monthly_count;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 8. Create trigger to auto-reset monthly counts
DROP TRIGGER IF EXISTS trigger_monthly_count_reset ON profiles;
CREATE TRIGGER trigger_monthly_count_reset
  BEFORE UPDATE OF images_generated_count ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_reset_monthly_count();