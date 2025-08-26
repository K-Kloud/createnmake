-- Add missing fields to manufacturers table
ALTER TABLE public.manufacturers 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create manufacturer_portfolios table
CREATE TABLE IF NOT EXISTS public.manufacturer_portfolios (
  id BIGSERIAL PRIMARY KEY,
  manufacturer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  project_type TEXT,
  completion_date DATE,
  client_name TEXT,
  materials_used TEXT[] DEFAULT '{}',
  project_value NUMERIC(10,2),
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers(id) ON DELETE CASCADE
);

-- Enable RLS on manufacturer_portfolios table
ALTER TABLE public.manufacturer_portfolios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for manufacturer_portfolios
CREATE POLICY "Manufacturers can manage their own portfolio items" 
ON public.manufacturer_portfolios 
FOR ALL 
USING (manufacturer_id = auth.uid())
WITH CHECK (manufacturer_id = auth.uid());

CREATE POLICY "Anyone can view portfolio items" 
ON public.manufacturer_portfolios 
FOR SELECT 
USING (true);