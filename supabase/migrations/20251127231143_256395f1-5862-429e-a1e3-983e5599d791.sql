-- =====================================================
-- MARKETPLACE ENHANCEMENTS: Advanced Reviews & Seller Profiles
-- =====================================================

-- Enhanced product reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id INTEGER NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_reviews_image ON public.product_reviews(image_id);
CREATE INDEX idx_product_reviews_user ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON public.product_reviews(rating);

-- Review helpful votes
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Seller profiles extension
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  business_name TEXT,
  bio TEXT,
  specialties TEXT[],
  years_experience INTEGER,
  featured_work UUID[],
  response_rate DECIMAL(3,2) DEFAULT 0.00,
  avg_response_time_hours INTEGER,
  total_sales INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  badge_tier TEXT CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_seller_profiles_user ON public.seller_profiles(user_id);
CREATE INDEX idx_seller_profiles_verified ON public.seller_profiles(verified);

-- =====================================================
-- PERSONALIZATION & NOTIFICATIONS
-- =====================================================

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  favorite_categories TEXT[],
  favorite_artisans UUID[],
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "in_app": true}'::jsonb,
  theme_preference TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Smart recommendations
CREATE TABLE IF NOT EXISTS public.smart_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommended_image_id INTEGER REFERENCES public.generated_images(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('trending', 'similar', 'personalized', 'new_arrival')),
  score DECIMAL(3,2) NOT NULL,
  reason TEXT,
  shown_at TIMESTAMPTZ,
  clicked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recommendations_user ON public.smart_recommendations(user_id);
CREATE INDEX idx_recommendations_score ON public.smart_recommendations(score DESC);

-- Activity feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('follow', 'like', 'purchase', 'review', 'new_item', 'milestone')),
  activity_data JSONB NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_feed_user ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_unread ON public.activity_feed(user_id, is_read) WHERE is_read = false;

-- =====================================================
-- PROFESSIONAL DEMOS & WORKFLOWS
-- =====================================================

-- Workflow templates
CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  steps JSONB NOT NULL,
  tools_required TEXT[],
  estimated_time_minutes INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_by UUID,
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workflow_templates_category ON public.workflow_templates(category);
CREATE INDEX idx_workflow_templates_featured ON public.workflow_templates(featured);

-- Workflow completions
CREATE TABLE IF NOT EXISTS public.workflow_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT
);

-- =====================================================
-- SUPPORT & HELP
-- =====================================================

-- FAQ categories and articles
CREATE TABLE IF NOT EXISTS public.faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faq_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.faq_categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_faq_articles_category ON public.faq_articles(category_id);

-- Quick help tooltips
CREATE TABLE IF NOT EXISTS public.help_tooltips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  element_selector TEXT NOT NULL,
  tooltip_text TEXT NOT NULL,
  position TEXT DEFAULT 'top',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_help_tooltips_page ON public.help_tooltips(page_path, is_active);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Product reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.product_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Review votes
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes"
  ON public.review_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote"
  ON public.review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seller profiles
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seller profiles"
  ON public.seller_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own seller profile"
  ON public.seller_profiles FOR ALL
  USING (auth.uid() = user_id);

-- User preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Smart recommendations
ALTER TABLE public.smart_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON public.smart_recommendations FOR SELECT
  USING (auth.uid() = user_id);

-- Activity feed
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON public.activity_feed FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own activity"
  ON public.activity_feed FOR UPDATE
  USING (auth.uid() = user_id);

-- Workflow templates
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view templates"
  ON public.workflow_templates FOR SELECT
  USING (true);

-- Workflow completions
ALTER TABLE public.workflow_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON public.workflow_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record completions"
  ON public.workflow_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- FAQ public access
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view FAQ categories"
  ON public.faq_categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view FAQ articles"
  ON public.faq_articles FOR SELECT
  USING (true);

-- Help tooltips
ALTER TABLE public.help_tooltips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tooltips"
  ON public.help_tooltips FOR SELECT
  USING (is_active = true);