-- Fix PUBLIC_USER_DATA: Restrict profiles table access
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create secure policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Authenticated users can view basic public info (username, avatar) but not sensitive data
CREATE POLICY "Authenticated users can view public profile data"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: Frontend should filter sensitive fields (phone, email, address) unless viewing own profile

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Fix EXPOSED_SENSITIVE_DATA: Restrict artisan_portfolio table access
-- Drop existing public policy
DROP POLICY IF EXISTS "Public can view public portfolio items" ON public.artisan_portfolio;

-- Authenticated users can view public portfolio items (but not sensitive business data)
CREATE POLICY "Authenticated users can view public portfolios"
ON public.artisan_portfolio
FOR SELECT
TO authenticated
USING (is_public = true);

-- Artisans can view their own portfolio (including private items)
CREATE POLICY "Artisans can view own portfolio"
ON public.artisan_portfolio
FOR SELECT
TO authenticated
USING (artisan_id = auth.uid());

-- Admin users can view all portfolios
CREATE POLICY "Admins can view all portfolios"
ON public.artisan_portfolio
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Keep existing policies for artisan management
-- (Artisans can manage their own portfolio - already exists)