-- Create artisan reviews table
CREATE TABLE IF NOT EXISTS public.artisan_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id BIGINT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  craftsmanship_rating INTEGER CHECK (craftsmanship_rating >= 1 AND craftsmanship_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, order_id)
);

-- Create order invoices table
CREATE TABLE IF NOT EXISTS public.order_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('artisan', 'manufacturer')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  maker_id UUID NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  invoice_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order status history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('artisan', 'manufacturer')),
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.artisan_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artisan_reviews
CREATE POLICY "Users can view reviews for artisans"
  ON public.artisan_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their orders"
  ON public.artisan_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.artisan_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Artisans can view their own reviews"
  ON public.artisan_reviews FOR SELECT
  USING (auth.uid() = artisan_id);

-- RLS Policies for order_invoices
CREATE POLICY "Users can view their own invoices"
  ON public.order_invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Makers can view invoices for their orders"
  ON public.order_invoices FOR SELECT
  USING (auth.uid() = maker_id);

CREATE POLICY "System can create invoices"
  ON public.order_invoices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Makers can update their invoices"
  ON public.order_invoices FOR UPDATE
  USING (auth.uid() = maker_id);

-- RLS Policies for order_status_history
CREATE POLICY "Users can view their order history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artisan_quotes 
      WHERE id::text = order_status_history.order_id 
      AND user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM quote_requests 
      WHERE id::text = order_status_history.order_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert order history"
  ON public.order_status_history FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_artisan_reviews_artisan ON public.artisan_reviews(artisan_id);
CREATE INDEX idx_artisan_reviews_user ON public.artisan_reviews(user_id);
CREATE INDEX idx_order_invoices_user ON public.order_invoices(user_id);
CREATE INDEX idx_order_invoices_maker ON public.order_invoices(maker_id);
CREATE INDEX idx_order_invoices_number ON public.order_invoices(invoice_number);
CREATE INDEX idx_order_status_history_order ON public.order_status_history(order_id, order_type);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_artisan_reviews_updated_at
  BEFORE UPDATE ON public.artisan_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_invoices_updated_at
  BEFORE UPDATE ON public.order_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();