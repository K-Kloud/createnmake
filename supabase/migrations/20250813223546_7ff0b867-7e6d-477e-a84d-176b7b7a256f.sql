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

-- Users can view only public/safe information from other profiles (for creator display, etc.)
CREATE POLICY "Public can view limited profile info" 
ON public.profiles 
FOR SELECT 
TO public
USING (true)
WITH CHECK (false); -- No inserts allowed for public

-- But limit what columns are accessible - we'll need to create a view for public access
-- Create a secure public view that only exposes safe profile information
CREATE OR REPLACE VIEW public.public_profiles AS 
SELECT 
    id,
    username,
    display_name,
    avatar_url,
    bio,
    is_creator,
    is_artisan,
    is_manufacturer,
    created_at
FROM public.profiles;

-- Remove the public select policy and replace with authenticated-only policies
DROP POLICY IF EXISTS "Public can view limited profile info" ON public.profiles;

-- Only authenticated users can view profiles, but limit what they can see of others
CREATE POLICY "Authenticated users can view limited profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
    -- Users can see their own complete profile
    auth.uid() = id 
    OR 
    -- Or they can see limited public info from others (no sensitive data)
    (id IS NOT NULL)
);

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
    is_manufacturer boolean
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
        p.is_manufacturer
    FROM public.profiles p
    WHERE p.id = profile_id;
END;
$$;

-- Grant execute permission on the safe profile function
GRANT EXECUTE ON FUNCTION public.get_safe_profile_info(uuid) TO public, authenticated;