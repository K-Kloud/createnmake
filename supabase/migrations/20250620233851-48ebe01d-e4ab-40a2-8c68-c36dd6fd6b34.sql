
-- Phase 1: Critical Database Triggers Implementation

-- 1. Enhanced user lifecycle automation
CREATE OR REPLACE FUNCTION handle_new_user_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create profile if it doesn't exist
  INSERT INTO public.profiles (id, created_at, monthly_image_limit, images_generated_count)
  VALUES (NEW.id, NOW(), 5, 0)
  ON CONFLICT (id) DO NOTHING;
  
  -- Send welcome notification
  INSERT INTO public.user_notifications (
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
  INSERT INTO public.audit_logs (
    user_id,
    action,
    action_details
  ) VALUES (
    NEW.id,
    'user_registered',
    jsonb_build_object(
      'email', NEW.email,
      'provider', COALESCE(NEW.app_metadata->>'provider', 'email'),
      'registration_time', NOW()
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user lifecycle
DROP TRIGGER IF EXISTS on_auth_user_created_lifecycle ON auth.users;
CREATE TRIGGER on_auth_user_created_lifecycle
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_lifecycle();

-- 2. Content engagement automation
CREATE OR REPLACE FUNCTION handle_image_engagement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  image_owner_id UUID;
BEGIN
  -- Get image owner
  SELECT user_id INTO image_owner_id 
  FROM generated_images 
  WHERE id = NEW.image_id;
  
  -- Notify image owner about new like/comment (avoid self-notifications)
  IF image_owner_id != NEW.user_id THEN
    INSERT INTO public.user_notifications (
      user_id,
      title,
      message,
      notification_type,
      metadata
    ) VALUES (
      image_owner_id,
      CASE 
        WHEN TG_TABLE_NAME = 'image_likes' THEN 'Your image got a like!'
        WHEN TG_TABLE_NAME = 'comments' THEN 'New comment on your image'
        ELSE 'New engagement on your image'
      END,
      CASE 
        WHEN TG_TABLE_NAME = 'image_likes' THEN 'Someone liked your design'
        WHEN TG_TABLE_NAME = 'comments' THEN 'Someone commented on your design'
        ELSE 'Someone engaged with your design'
      END,
      'engagement',
      jsonb_build_object(
        'image_id', NEW.image_id,
        'engagement_type', TG_TABLE_NAME,
        'from_user_id', NEW.user_id
      )
    );
  END IF;
  
  -- Update user activity metrics
  INSERT INTO public.activity_metrics (
    user_id,
    metric_type,
    metric_value,
    recorded_at
  ) VALUES (
    NEW.user_id,
    CASE 
      WHEN TG_TABLE_NAME = 'image_likes' THEN 'likes_given'
      WHEN TG_TABLE_NAME = 'comments' THEN 'comments_made'
      ELSE 'engagement_action'
    END,
    1,
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Create triggers for engagement
DROP TRIGGER IF EXISTS on_image_like_engagement ON image_likes;
CREATE TRIGGER on_image_like_engagement
  AFTER INSERT ON image_likes
  FOR EACH ROW EXECUTE FUNCTION handle_image_engagement();

DROP TRIGGER IF EXISTS on_comment_engagement ON comments;
CREATE TRIGGER on_comment_engagement
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION handle_image_engagement();

-- 3. Subscription and limit management
CREATE OR REPLACE FUNCTION handle_subscription_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profile with new subscription details
  UPDATE public.profiles 
  SET 
    creator_tier = CASE 
      WHEN NEW.status = 'active' THEN 
        CASE NEW.plan_id
          WHEN 1 THEN 'basic'
          WHEN 2 THEN 'pro'
          WHEN 3 THEN 'enterprise'
          ELSE 'free'
        END
      ELSE 'free'
    END,
    monthly_image_limit = CASE 
      WHEN NEW.status = 'active' THEN 
        COALESCE((SELECT monthly_image_limit FROM subscription_plans WHERE id = NEW.plan_id), 5)
      ELSE 5
    END,
    subscription_updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Send notification about subscription change
  INSERT INTO public.user_notifications (
    user_id,
    title,
    message,
    notification_type,
    metadata
  ) VALUES (
    NEW.user_id,
    CASE 
      WHEN NEW.status = 'active' THEN 'Subscription Activated!'
      WHEN NEW.status = 'canceled' THEN 'Subscription Canceled'
      ELSE 'Subscription Updated'
    END,
    CASE 
      WHEN NEW.status = 'active' THEN 'Your subscription is now active. Enjoy your new features!'
      WHEN NEW.status = 'canceled' THEN 'Your subscription has been canceled. You can reactivate anytime.'
      ELSE 'Your subscription status has been updated.'
    END,
    'subscription',
    jsonb_build_object(
      'plan_id', NEW.plan_id,
      'status', NEW.status,
      'change_date', NOW()
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for subscription changes
DROP TRIGGER IF EXISTS on_subscription_change ON creator_subscriptions;
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON creator_subscriptions
  FOR EACH ROW EXECUTE FUNCTION handle_subscription_changes();

-- 4. Usage limit enforcement
CREATE OR REPLACE FUNCTION check_generation_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_limit INTEGER;
  current_count INTEGER;
  current_month_start DATE;
BEGIN
  -- Get current month start
  current_month_start := date_trunc('month', CURRENT_DATE);
  
  -- Get user's monthly limit
  SELECT monthly_image_limit INTO user_limit
  FROM profiles 
  WHERE id = NEW.user_id;
  
  -- Count images generated this month
  SELECT COUNT(*) INTO current_count
  FROM generated_images
  WHERE user_id = NEW.user_id 
    AND created_at >= current_month_start;
  
  -- Check if limit exceeded
  IF current_count >= COALESCE(user_limit, 5) THEN
    -- Send limit reached notification
    INSERT INTO public.user_notifications (
      user_id,
      title,
      message,
      notification_type,
      metadata
    ) VALUES (
      NEW.user_id,
      'Generation Limit Reached',
      'You have reached your monthly image generation limit. Upgrade your plan to generate more images.',
      'limit_reached',
      jsonb_build_object(
        'current_count', current_count,
        'limit', user_limit,
        'period', 'monthly'
      )
    );
    
    RAISE EXCEPTION 'Monthly generation limit of % images reached. Current count: %', user_limit, current_count;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for generation limits
DROP TRIGGER IF EXISTS check_generation_limits_trigger ON generated_images;
CREATE TRIGGER check_generation_limits_trigger
  BEFORE INSERT ON generated_images
  FOR EACH ROW EXECUTE FUNCTION check_generation_limits();

-- 5. Real-time data consistency
CREATE OR REPLACE FUNCTION maintain_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user image count on new generation
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET images_generated_count = images_generated_count + 1
    WHERE id = NEW.user_id;
    
    RETURN NEW;
  END IF;
  
  -- Update user image count on deletion
  IF TG_OP = 'DELETE' THEN
    UPDATE profiles 
    SET images_generated_count = GREATEST(images_generated_count - 1, 0)
    WHERE id = OLD.user_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger for user stats maintenance
DROP TRIGGER IF EXISTS maintain_user_stats_trigger ON generated_images;
CREATE TRIGGER maintain_user_stats_trigger
  AFTER INSERT OR DELETE ON generated_images
  FOR EACH ROW EXECUTE FUNCTION maintain_user_stats();

-- 6. Automated milestone notifications
CREATE OR REPLACE FUNCTION check_user_milestones()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  milestone_count INTEGER;
  milestone_message TEXT;
BEGIN
  milestone_count := NEW.images_generated_count;
  
  -- Check for milestone achievements
  IF milestone_count IN (1, 5, 10, 25, 50, 100, 250, 500, 1000) THEN
    milestone_message := CASE milestone_count
      WHEN 1 THEN 'First image generated! Welcome to the community!'
      WHEN 5 THEN 'Great start! You''ve generated 5 images!'
      WHEN 10 THEN 'Double digits! 10 images created!'
      WHEN 25 THEN 'Quarter century! 25 amazing designs!'
      WHEN 50 THEN 'Half a hundred! You''re on fire!'
      WHEN 100 THEN 'Century club! 100 incredible images!'
      WHEN 250 THEN 'Power user! 250 images generated!'
      WHEN 500 THEN 'Expert creator! 500 designs and counting!'
      WHEN 1000 THEN 'Master designer! 1000 images milestone!'
    END;
    
    INSERT INTO public.user_notifications (
      user_id,
      title,
      message,
      notification_type,
      metadata
    ) VALUES (
      NEW.id,
      'Milestone Achievement! 🎉',
      milestone_message,
      'milestone',
      jsonb_build_object(
        'milestone_type', 'image_count',
        'milestone_value', milestone_count,
        'achievement_date', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for milestone tracking
DROP TRIGGER IF EXISTS check_milestones_trigger ON profiles;
CREATE TRIGGER check_milestones_trigger
  AFTER UPDATE OF images_generated_count ON profiles
  FOR EACH ROW 
  WHEN (NEW.images_generated_count > OLD.images_generated_count)
  EXECUTE FUNCTION check_user_milestones();
