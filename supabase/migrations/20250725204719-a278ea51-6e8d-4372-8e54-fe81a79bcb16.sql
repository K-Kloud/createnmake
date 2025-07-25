-- Fix remaining database security issues

-- Fix remaining database functions with search path
CREATE OR REPLACE FUNCTION public.get_image_metrics(p_image_id bigint)
 RETURNS TABLE(metric_type text, total_value bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT mm.metric_type, SUM(mm.metric_value)::BIGINT as total_value
    FROM marketplace_metrics mm
    WHERE mm.image_id = p_image_id
    GROUP BY mm.metric_type;

    -- Check if any metrics were found
    IF NOT FOUND THEN
        RAISE NOTICE 'No metrics found for image ID %', p_image_id;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_image_versions(image_id bigint)
 RETURNS TABLE(id bigint, image_url text, edit_prompt text, edit_version integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  original_id bigint;
BEGIN
  -- Get the original image ID
  SELECT COALESCE(original_image_id, generated_images.id) 
  INTO original_id
  FROM generated_images 
  WHERE generated_images.id = get_image_versions.image_id;
  
  RETURN QUERY
  SELECT 
    gi.id,
    gi.image_url,
    gi.edit_prompt,
    gi.edit_version,
    gi.created_at
  FROM generated_images gi
  WHERE gi.original_image_id = original_id 
     OR (gi.id = original_id AND gi.original_image_id IS NULL)
  ORDER BY gi.edit_version ASC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_generation_limits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    INSERT INTO user_notifications (
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
$function$;

CREATE OR REPLACE FUNCTION public.maintain_user_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.check_user_milestones()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    
    INSERT INTO user_notifications (
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
$function$;

CREATE OR REPLACE FUNCTION public.increment_views(image_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if the image_id exists
  IF EXISTS (SELECT 1 FROM generated_images WHERE id = image_id) THEN
    UPDATE generated_images
    SET views = COALESCE(views, 0) + 1
    WHERE id = image_id;
  ELSE
    RAISE NOTICE 'Image ID % does not exist.', image_id;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_ai_agent_health(p_agent_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  health_status TEXT;
  last_task_success BOOLEAN;
  error_rate NUMERIC;
  avg_response_time NUMERIC;
  result JSONB;
BEGIN
  -- Check recent task success rate
  SELECT 
    (COUNT(CASE WHEN status = 'completed' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000)
  INTO error_rate, avg_response_time
  FROM ai_agent_tasks 
  WHERE agent_id = p_agent_id 
    AND created_at > NOW() - INTERVAL '1 hour';

  -- Determine health status
  IF error_rate IS NULL THEN
    health_status := 'unknown';
  ELSIF error_rate >= 95 THEN
    health_status := 'healthy';
  ELSIF error_rate >= 80 THEN
    health_status := 'degraded';
  ELSE
    health_status := 'unhealthy';
  END IF;

  -- Update or insert health record
  INSERT INTO ai_agent_health (
    agent_id, 
    status, 
    response_time_ms, 
    success_rate,
    metadata
  ) VALUES (
    p_agent_id,
    health_status,
    COALESCE(avg_response_time, 0)::INTEGER,
    COALESCE(error_rate, 0),
    jsonb_build_object(
      'checked_at', NOW(),
      'tasks_in_last_hour', (SELECT COUNT(*) FROM ai_agent_tasks WHERE agent_id = p_agent_id AND created_at > NOW() - INTERVAL '1 hour')
    )
  )
  ON CONFLICT (agent_id) 
  DO UPDATE SET
    status = EXCLUDED.status,
    response_time_ms = EXCLUDED.response_time_ms,
    success_rate = EXCLUDED.success_rate,
    last_check_at = NOW(),
    metadata = EXCLUDED.metadata;

  -- Return health summary
  SELECT jsonb_build_object(
    'agent_id', p_agent_id,
    'status', health_status,
    'success_rate', COALESCE(error_rate, 0),
    'avg_response_time_ms', COALESCE(avg_response_time, 0),
    'last_check', NOW()
  ) INTO result;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.queue_ai_agent_task(p_agent_id bigint, p_task_type text, p_payload jsonb, p_priority integer DEFAULT 5, p_scheduled_for timestamp with time zone DEFAULT now())
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  task_id UUID;
BEGIN
  INSERT INTO ai_agent_queue (
    agent_id,
    task_type,
    priority,
    payload,
    scheduled_for
  ) VALUES (
    p_agent_id,
    p_task_type,
    p_priority,
    p_payload,
    p_scheduled_for
  )
  RETURNING id INTO task_id;

  RETURN task_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_ai_monitoring()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Make HTTP request to trigger AI agent monitoring
  SELECT net.http_post(
    url => 'https://igkiffajkpfwdfxwokwg.supabase.co/functions/v1/ai-agent-monitor',
    headers => '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2lmZmFqa3Bmd2RmeHdva3dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc1NTgzMCwiZXhwIjoyMDQ5MzMxODMwfQ.0qmsiQRy7fy6CqTxZXQ2_WCw4oOILaD6TnN0wEQ3vcs"}'::jsonb,
    body => '{"manual": true, "triggered_by": "admin"}'::jsonb
  ) INTO result;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'AI monitoring triggered manually',
    'request_id', result
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_comment_reply_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO user_notifications (
    user_id,
    title,
    message,
    notification_type,
    metadata
  )
  SELECT 
    c.user_id,
    'New reply to your comment',
    'Someone has replied to your comment',
    'comment_reply',
    jsonb_build_object(
      'comment_id', NEW.comment_id,
      'image_id', c.image_id,
      'from_user_id', NEW.user_id
    )
  FROM comments c
  WHERE c.id = NEW.comment_id AND c.user_id != NEW.user_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_user_image_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE profiles
  SET images_generated_count = images_generated_count + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_admin_role_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Log admin role changes
    INSERT INTO audit_logs (
        user_id,
        action,
        action_details
    ) VALUES (
        auth.uid(),
        CASE
            WHEN TG_OP = 'INSERT' THEN 'admin_role_granted'
            WHEN TG_OP = 'UPDATE' THEN 'admin_role_updated'
            WHEN TG_OP = 'DELETE' THEN 'admin_role_revoked'
        END,
        jsonb_build_object(
            'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
            'role', COALESCE(NEW.role, OLD.role),
            'operation', TG_OP,
            'timestamp', now()
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into profiles (id)
  values (new.id);
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.validate_widget_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Ensure widget configuration is valid JSON
    IF NEW.widgets IS NOT NULL AND jsonb_typeof(NEW.widgets) != 'object' THEN
        RAISE EXCEPTION 'Widget configuration must be a valid JSON object';
    END IF;
    
    -- Log the widget update
    INSERT INTO audit_logs (
        user_id, 
        action, 
        action_details
    ) VALUES (
        NEW.user_id,
        'Update Dashboard Widgets',
        jsonb_build_object(
            'previous_config', OLD.widgets,
            'new_config', NEW.widgets
        )
    );
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Password must be at least 8 characters
  IF LENGTH(password) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one number
  IF password !~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one special character
  IF password !~ '[^A-Za-z0-9]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;