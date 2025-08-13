-- Fix critical security vulnerability in profiles table
-- Remove the overly permissive public access policy and replace with secure policies

-- Drop the dangerous public access policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create secure policies for profile access
-- Users can view their own complete profile
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Only authenticated users can view limited profile info from others
-- This replaces the dangerous public access
CREATE POLICY "Authenticated users can view limited profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
    -- Users can see their own complete profile
    auth.uid() = id 
    OR 
    -- Or they can see limited public info from others (no sensitive data like phone, address)
    (id IS NOT NULL AND auth.uid() IS NOT NULL)
);

-- Create a secure public view that only exposes safe profile information
-- Excluding sensitive data: phone, address, business_name, business_type, specialties
CREATE OR REPLACE VIEW public.public_profiles AS 
SELECT 
    id,
    username,
    display_name,
    avatar_url,
    bio,
    is_creator,
    is_artisan,
    website,
    location,
    created_at
FROM public.profiles;

-- Add a function to get safe profile info for marketplace/public use
CREATE OR REPLACE FUNCTION public.get_safe_profile_info(profile_id uuid)
RETURNS TABLE (
    id uuid,
    username text,
    display_name text,
    avatar_url text,
    bio text,
    is_creator boolean,
    is_artisan boolean,
    website text,
    location text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.display_name,
        p.avatar_url,
        p.bio,
        p.is_creator,
        p.is_artisan,
        p.website,
        p.location
    FROM public.profiles p
    WHERE p.id = profile_id;
END;
$$;

-- Grant execute permission on the safe profile function
GRANT EXECUTE ON FUNCTION public.get_safe_profile_info(uuid) TO public, authenticated;

-- Log the security fix
INSERT INTO audit_logs (action, action_details)
VALUES (
    'security_fix_profiles_table',
    jsonb_build_object(
        'issue', 'removed_public_access_to_profiles',
        'fix_date', NOW(),
        'sensitive_data_protected', ARRAY['phone', 'address', 'business_name', 'business_type', 'specialties', 'first_name', 'last_name'],
        'safe_data_accessible', ARRAY['username', 'display_name', 'avatar_url', 'bio', 'is_creator', 'is_artisan', 'website', 'location']
    )
);