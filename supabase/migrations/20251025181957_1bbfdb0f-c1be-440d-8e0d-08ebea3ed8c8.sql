-- Create virtual try-on sessions table
CREATE TABLE public.virtual_tryon_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body_reference_url TEXT NOT NULL,
  generated_image_id BIGINT REFERENCES generated_images(id) ON DELETE SET NULL,
  tryon_result_url TEXT,
  body_mask_data TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  settings JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add try-on tracking to generated_images
ALTER TABLE public.generated_images 
ADD COLUMN IF NOT EXISTS is_virtual_tryon BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tryon_session_id BIGINT REFERENCES virtual_tryon_sessions(id) ON DELETE SET NULL;

-- Create indexes for faster queries
CREATE INDEX idx_tryon_sessions_user_id ON public.virtual_tryon_sessions(user_id);
CREATE INDEX idx_tryon_sessions_status ON public.virtual_tryon_sessions(status);
CREATE INDEX idx_generated_images_tryon ON public.generated_images(tryon_session_id) WHERE tryon_session_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.virtual_tryon_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for virtual_tryon_sessions
CREATE POLICY "Users can view their own try-on sessions"
  ON public.virtual_tryon_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own try-on sessions"
  ON public.virtual_tryon_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own try-on sessions"
  ON public.virtual_tryon_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own try-on sessions"
  ON public.virtual_tryon_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_virtual_tryon_sessions_updated_at
  BEFORE UPDATE ON public.virtual_tryon_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for body reference images (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tryon-references',
  'tryon-references',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;