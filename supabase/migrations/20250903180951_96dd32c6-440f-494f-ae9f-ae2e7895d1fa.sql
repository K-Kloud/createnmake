-- Create image collections table
CREATE TABLE public.image_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collection images junction table
CREATE TABLE public.collection_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.image_collections(id) ON DELETE CASCADE,
  image_id BIGINT NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, image_id)
);

-- Create image favorites table
CREATE TABLE public.image_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_id BIGINT NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, image_id)
);

-- Enable RLS
ALTER TABLE public.image_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for image_collections
CREATE POLICY "Users can view their own collections"
ON public.image_collections FOR SELECT
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own collections"
ON public.image_collections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
ON public.image_collections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
ON public.image_collections FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for collection_images
CREATE POLICY "Users can view collection images they own"
ON public.collection_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.image_collections
    WHERE id = collection_id 
    AND (user_id = auth.uid() OR is_public = true)
  )
);

CREATE POLICY "Users can add images to their collections"
ON public.collection_images FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.image_collections
    WHERE id = collection_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove images from their collections"
ON public.collection_images FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.image_collections
    WHERE id = collection_id AND user_id = auth.uid()
  )
);

-- RLS policies for image_favorites
CREATE POLICY "Users can view their own favorites"
ON public.image_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their favorites"
ON public.image_favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their favorites"
ON public.image_favorites FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_image_collections_user_id ON public.image_collections(user_id);
CREATE INDEX idx_collection_images_collection_id ON public.collection_images(collection_id);
CREATE INDEX idx_collection_images_image_id ON public.collection_images(image_id);
CREATE INDEX idx_image_favorites_user_id ON public.image_favorites(user_id);
CREATE INDEX idx_image_favorites_image_id ON public.image_favorites(image_id);

-- Create updated_at trigger for image_collections
CREATE TRIGGER update_image_collections_updated_at
BEFORE UPDATE ON public.image_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();