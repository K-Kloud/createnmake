-- Phase 9: Critical Security Fixes
-- Fix Function Search Path Vulnerabilities (5 critical functions)

-- 1. Fix maintain_image_likes_sync function
CREATE OR REPLACE FUNCTION public.maintain_image_likes_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Someone liked an image
    UPDATE generated_images 
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = NEW.image_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Someone unliked an image
    UPDATE generated_images 
    SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
    WHERE id = OLD.image_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- 2. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. Fix validate_widget_update function
CREATE OR REPLACE FUNCTION public.validate_widget_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 4. Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- 5. Fix validate_and_sanitize_content function
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Sanitize text fields in content_blocks
    IF TG_TABLE_NAME = 'content_blocks' THEN
        NEW.title := public.sanitize_text_input(NEW.title);
        
        -- Validate JSON content structure
        IF NOT (NEW.content ? 'data' AND jsonb_typeof(NEW.content->'data') = 'object') THEN
            RAISE EXCEPTION 'Invalid content structure';
        END IF;
    END IF;
    
    -- Rate limiting for content creation
    IF TG_OP = 'INSERT' THEN
        PERFORM public.validate_admin_operation('content_creation');
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 6. Create secure authentication helper function
CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN auth.uid() IS NOT NULL;
END;
$function$;

-- 7. Create secure admin check function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    );
END;
$function$;

-- 8. Fix anonymous access by updating RLS policies to require authentication
-- Update ab_test_events policies
DROP POLICY IF EXISTS "Admins can view all AB test events" ON public.ab_test_events;
CREATE POLICY "Admins can view all AB test events" 
ON public.ab_test_events 
FOR SELECT 
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Users can insert their own AB test events" ON public.ab_test_events;
CREATE POLICY "Users can insert their own AB test events" 
ON public.ab_test_events 
FOR INSERT 
TO authenticated
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

-- Update activity_metrics policies
DROP POLICY IF EXISTS "Authenticated users can view their own activity metrics" ON public.activity_metrics;
CREATE POLICY "Authenticated users can view their own activity metrics" 
ON public.activity_metrics 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Update content_blocks to require authentication for management
DROP POLICY IF EXISTS "Public can view active content" ON public.content_blocks;
CREATE POLICY "Public can view active content" 
ON public.content_blocks 
FOR SELECT 
TO authenticated, anon
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage all content" ON public.content_blocks;
CREATE POLICY "Admins can manage all content" 
ON public.content_blocks 
FOR ALL 
TO authenticated
USING (public.is_admin_user());

-- Update breadcrumb_configs to require authentication
DROP POLICY IF EXISTS "Public can view active breadcrumb configs" ON public.breadcrumb_configs;
CREATE POLICY "Public can view active breadcrumb configs" 
ON public.breadcrumb_configs 
FOR SELECT 
TO authenticated, anon
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage breadcrumb configs" ON public.breadcrumb_configs;
CREATE POLICY "Admins can manage breadcrumb configs" 
ON public.breadcrumb_configs 
FOR ALL 
TO authenticated
USING (public.is_admin_user());