-- Fix the anonymous access policy for manufacturer_portfolios
-- Replace the overly permissive policy with a more secure one

DROP POLICY IF EXISTS "Anyone can view portfolio items" ON public.manufacturer_portfolios;

-- Create a more secure policy that only allows authenticated users to view portfolios
CREATE POLICY "Authenticated users can view portfolio items" 
ON public.manufacturer_portfolios 
FOR SELECT 
USING (auth.uid() IS NOT NULL);