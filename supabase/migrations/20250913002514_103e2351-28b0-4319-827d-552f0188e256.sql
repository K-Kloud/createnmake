-- Create make_requests table for product manufacturing requests
CREATE TABLE public.make_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_image_url TEXT NOT NULL,
  product_prompt TEXT NOT NULL,
  product_price TEXT,
  creator_name TEXT NOT NULL,
  product_details JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  admin_notes TEXT,
  assigned_artisan_id UUID REFERENCES auth.users(id),
  assigned_manufacturer_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.make_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own make requests" 
ON public.make_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own make requests" 
ON public.make_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Artisans can view assigned requests" 
ON public.make_requests 
FOR SELECT 
USING (auth.uid() = assigned_artisan_id);

CREATE POLICY "Manufacturers can view assigned requests" 
ON public.make_requests 
FOR SELECT 
USING (auth.uid() = assigned_manufacturer_id);

CREATE POLICY "Admins can manage all make requests" 
ON public.make_requests 
FOR ALL 
USING (is_admin_user());

CREATE POLICY "Creators can view requests for their products" 
ON public.make_requests 
FOR SELECT 
USING (auth.uid() = creator_id);

-- Create trigger for email notifications
CREATE OR REPLACE FUNCTION public.notify_make_request_created()
RETURNS TRIGGER AS $$
DECLARE
  service_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2lmZmFqa3Bmd2RmeHdva3dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzc1NTgzMCwiZXhwIjoyMDQ5MzMxODMwfQ.0qmsiQRy7fy6CqTxZXQ2_WCw4oOILaD6TnN0wEQ3vcs';
BEGIN
  -- Call the edge function to send email notifications
  PERFORM extensions.http_post(
    url => 'https://igkiffajkpfwdfxwokwg.supabase.co/functions/v1/notify-make-request',
    headers => jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body => jsonb_build_object(
      'requestId', NEW.id::text,
      'userId', NEW.user_id::text,
      'creatorId', NEW.creator_id::text,
      'productDetails', row_to_json(NEW)
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER trigger_notify_make_request_created
  AFTER INSERT ON public.make_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_make_request_created();

-- Create updated_at trigger
CREATE TRIGGER update_make_requests_updated_at
  BEFORE UPDATE ON public.make_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();