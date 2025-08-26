-- Add artisan profile fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "17:00", "available": true}, "tuesday": {"start": "09:00", "end": "17:00", "available": true}, "wednesday": {"start": "09:00", "end": "17:00", "available": true}, "thursday": {"start": "09:00", "end": "17:00", "available": true}, "friday": {"start": "09:00", "end": "17:00", "available": true}, "saturday": {"start": "10:00", "end": "16:00", "available": false}, "sunday": {"start": "10:00", "end": "16:00", "available": false}}'::jsonb,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_project_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS minimum_project_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS response_time_hours INTEGER DEFAULT 24;

-- Add check constraints for valid values
ALTER TABLE profiles 
ADD CONSTRAINT availability_status_check 
CHECK (availability_status IN ('available', 'busy', 'unavailable'));

-- Create artisan portfolio table
CREATE TABLE IF NOT EXISTS artisan_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  project_type TEXT,
  materials_used TEXT[],
  completion_date DATE,
  client_name TEXT,
  project_value NUMERIC,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE artisan_portfolio ENABLE ROW LEVEL SECURITY;

-- Create policies for artisan_portfolio
CREATE POLICY "Artisans can manage their own portfolio" 
ON artisan_portfolio 
FOR ALL 
USING (artisan_id = auth.uid())
WITH CHECK (artisan_id = auth.uid());

CREATE POLICY "Public can view public portfolio items" 
ON artisan_portfolio 
FOR SELECT 
USING (is_public = true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_artisan_portfolio_artisan_id ON artisan_portfolio(artisan_id);
CREATE INDEX IF NOT EXISTS idx_artisan_portfolio_featured ON artisan_portfolio(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_artisan_portfolio_public ON artisan_portfolio(is_public) WHERE is_public = true;

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_artisan_portfolio_updated_at
  BEFORE UPDATE ON artisan_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();