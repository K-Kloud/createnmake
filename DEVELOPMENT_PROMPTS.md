# OpenTeknologies Platform - Development Prompts Documentation

> **Complete modular prompts reference for building an AI-powered fashion design and manufacturing platform**

**Version:** 1.0  
**Last Updated:** 2025-10-29  
**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Supabase, Stripe

---

## Table of Contents

1. [Platform Architecture & Foundation](#1-platform-architecture--foundation)
2. [AI & Image Generation System](#2-ai--image-generation-system)
3. [User Roles & Dashboards](#3-user-roles--dashboards)
4. [Marketplace & E-commerce](#4-marketplace--e-commerce)
5. [Subscription & Monetization](#5-subscription--monetization)
6. [AI Agents & Automation](#6-ai-agents--automation)
7. [Analytics & Business Intelligence](#7-analytics--business-intelligence)
8. [Communication & Notifications](#8-communication--notifications)
9. [Advanced Features](#9-advanced-features)
10. [Edge Functions & Backend Services](#10-edge-functions--backend-services)

---

## 1. Platform Architecture & Foundation

### 1.1 Project Initialization

**Purpose:** Set up the base React + Vite + TypeScript project with Tailwind CSS and shadcn/ui components.

**Prompt:**
```
Create a modern React application with the following setup:
- React 18+ with TypeScript
- Vite as the build tool
- Tailwind CSS for styling with shadcn/ui component library
- React Router for navigation
- React Query (@tanstack/react-query) for data fetching
- Include ESLint and TypeScript configurations
- Set up proper folder structure: src/components, src/pages, src/hooks, src/services, src/types
```

**Key Files:**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind customization
- `src/index.css` - Global styles and CSS variables

---

### 1.2 Supabase Integration

**Purpose:** Connect the application to Supabase for authentication, database, and storage.

**Prompt:**
```
Integrate Supabase into the React application:
1. Install @supabase/supabase-js package
2. Create a Supabase client in src/integrations/supabase/client.ts
3. Set up environment variables for Supabase URL and anon key
4. Create type definitions in src/integrations/supabase/types.ts
5. Implement authentication helpers in src/integrations/supabase/auth.tsx
6. Create useAuth hook for managing authentication state
7. Add protected route wrapper component
```

**Database Tables Required:**
- `profiles` - Extended user information
- `admin_roles` - Admin user permissions

**Key Files:**
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/auth.tsx`
- `src/hooks/useAuth.ts`
- `src/components/ProtectedRoute.tsx`

---

### 1.3 Authentication System

**Purpose:** Complete user authentication flow with email/password, OAuth providers, and session management.

**Prompt:**
```
Implement a comprehensive authentication system:
1. Create login page with email/password and social OAuth options
2. Implement signup page with form validation using react-hook-form and zod
3. Add password reset functionality
4. Create profile management page
5. Implement session persistence and automatic refresh
6. Add role-based access control (regular user, creator, artisan, manufacturer, admin)
7. Create onboarding flow for new users
8. Add email verification
```

**Database Schema:**
```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_creator BOOLEAN DEFAULT false,
  is_artisan BOOLEAN DEFAULT false,
  is_manufacturer BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  creator_tier TEXT DEFAULT 'free',
  monthly_image_limit INTEGER DEFAULT 5,
  images_generated_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin roles
CREATE TABLE admin_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`
- `src/pages/Profile.tsx`
- `src/components/auth/*`

---

### 1.4 Design System & Theming

**Purpose:** Create a consistent, customizable design system with dark mode support.

**Prompt:**
```
Set up a comprehensive design system:
1. Define color palette in index.css using HSL CSS variables
2. Create semantic color tokens (primary, secondary, accent, muted, etc.)
3. Implement dark mode support using next-themes
4. Set up typography scale with font families and sizes
5. Define spacing, border radius, and shadow tokens
6. Create reusable shadcn/ui components with proper variants
7. Ensure all colors use HSL format for consistency
8. Add smooth transitions and animations
```

**Key Files:**
- `src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind theme extension
- `src/components/ui/*` - shadcn/ui components

**Design Tokens Example:**
```css
:root {
  --primary: 210 100% 50%;
  --secondary: 280 80% 60%;
  --accent: 340 82% 52%;
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --border: 214 32% 91%;
  --gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)));
}
```

---

### 1.5 Routing & Navigation

**Purpose:** Set up application routing with lazy loading and nested routes.

**Prompt:**
```
Create a comprehensive routing system:
1. Set up React Router v6 with lazy-loaded routes
2. Create main navigation component with responsive design
3. Implement nested routes for different user roles (creator, artisan, manufacturer, admin)
4. Add breadcrumb navigation
5. Create 404 not found page
6. Implement route guards for authentication
7. Add loading states for lazy-loaded routes with Suspense
8. Create dynamic route handlers for collections, products, profiles
```

**Key Files:**
- `src/routes/AppRoutes.tsx`
- `src/routes/AdminRoutes.tsx`
- `src/routes/CreatorRoutes.tsx`
- `src/components/Navigation.tsx`
- `src/components/DynamicRouter.tsx`

---

## 2. AI & Image Generation System

### 2.1 Multi-Provider Image Generation

**Purpose:** Integrate multiple AI image generation providers with fallback support.

**Prompt:**
```
Create a flexible AI image generation system supporting multiple providers:
1. Integrate FAL.ai as the primary provider using @fal-ai/client
2. Add Gemini AI (google/gemini-2.5-flash-image-preview) as secondary provider
3. Implement Hugging Face Inference API integration
4. Add xAI integration for specialized fashion generation
5. Create a unified interface for all providers
6. Implement automatic fallback if primary provider fails
7. Add provider selection in settings
8. Track usage and costs per provider
9. Support different aspect ratios (1:1, 4:3, 16:9, 3:4, 9:16)
10. Handle reference images for style transfer
```

**Database Schema:**
```sql
CREATE TABLE generated_images (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  item_type TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '1:1',
  image_url TEXT,
  reference_image_url TEXT,
  provider TEXT DEFAULT 'fal',
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  edit_version INTEGER DEFAULT 1,
  original_image_id BIGINT REFERENCES generated_images(id)
);
```

**Key Services:**
- `src/services/imageGeneration.ts` - Main generation service
- `src/services/geminiImageGeneration.ts` - Gemini provider
- `src/services/huggingfaceImageGeneration.ts` - HF provider
- `src/services/xaiImageGeneration.ts` - xAI provider
- `src/hooks/useImageGenerationAPI.ts` - React hook

**Edge Function:**
```typescript
// supabase/functions/generate-image/index.ts
// Multi-provider image generation with fallback logic
```

---

### 2.2 AI Prompt Enhancement

**Purpose:** Automatically enhance user prompts for better image generation results.

**Prompt:**
```
Build an AI-powered prompt enhancement system:
1. Analyze user's generation history to build a style profile
2. Extract preferred colors, styles, and keywords
3. Use Gemini AI to enhance prompts with technical details
4. Add fashion-specific terminology automatically
5. Suggest improvements for vague prompts
6. Include lighting, texture, and composition details
7. Maintain user's creative intent while improving clarity
8. Track enhancement effectiveness with A/B testing
9. Allow users to accept/reject suggestions
10. Build a learning system that improves over time
```

**Database Schema:**
```sql
CREATE TABLE user_style_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id),
  preferred_styles TEXT[],
  preferred_colors TEXT[],
  common_keywords TEXT[],
  quality_preferences JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Files:**
- `src/services/aiPromptEnhancer.ts`
- Edge function: `supabase/functions/enhance-prompt/index.ts`

---

### 2.3 Reference Image Analysis

**Purpose:** Analyze uploaded reference images to extract style, color, and composition data.

**Prompt:**
```
Create an image analysis system for reference images:
1. Use Gemini Vision API to analyze uploaded images
2. Extract dominant colors with hex codes
3. Identify style (modern, vintage, minimalist, etc.)
4. Detect composition and layout patterns
5. Identify objects and clothing items
6. Analyze texture and material properties
7. Generate enhanced prompts based on analysis
8. Support multiple image uploads for style mixing
9. Create visual similarity search
10. Store analysis results for future reference
```

**Key Files:**
- `src/services/imageAnalysis.ts`
- Edge function: `supabase/functions/analyze-reference-image/index.ts`

**Analysis Output Example:**
```typescript
interface ImageAnalysisResult {
  dominantColors: string[];        // ['#2C3E50', '#E74C3C']
  style: string;                   // 'contemporary'
  composition: string;             // 'centered subject, rule of thirds'
  objects: string[];               // ['t-shirt', 'cotton fabric']
  textureDescription: string;      // 'smooth cotton with natural draping'
  enhancedPrompt: string;          // Full enhanced prompt
}
```

---

### 2.4 Virtual Try-On System

**Purpose:** AI-powered virtual try-on allowing users to see clothes on their body.

**Prompt:**
```
Implement a virtual try-on system:
1. Allow users to upload body reference photos
2. Store reference images in Supabase Storage
3. Use AI to map clothing designs onto body photos
4. Support multiple clothing items in one session
5. Enable batch try-on for multiple designs
6. Save try-on sessions for later review
7. Allow sharing try-on results
8. Implement garment physics simulation
9. Add adjustments for fit and sizing
10. Track try-on history and favorites
```

**Database Schema:**
```sql
CREATE TABLE virtual_tryon_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  body_image_url TEXT NOT NULL,
  clothing_image_url TEXT NOT NULL,
  result_image_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE body_references (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  body_type TEXT,
  measurements JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Files:**
- `src/hooks/useVirtualTryOn.ts`
- `src/services/virtualTryOn.ts`
- `src/pages/TryOn.tsx`
- Edge function: `supabase/functions/virtual-tryon/index.ts`

---

### 2.5 Computer Vision & Object Detection

**Purpose:** Detect fashion items, analyze quality, and extract metadata from images.

**Prompt:**
```
Build a computer vision system for fashion analysis:
1. Detect clothing items in images with bounding boxes
2. Classify item types (shirt, dress, pants, etc.)
3. Extract color palettes with confidence scores
4. Analyze style characteristics
5. Predict fashion trends based on visual data
6. Generate automatic tags and categories
7. Quality assessment scoring
8. Brand and pattern recognition
9. Fabric type detection
10. Size estimation from images
```

**Key Files:**
- `src/hooks/useComputerVision.ts`
- Edge function: `supabase/functions/computer-vision-analysis/index.ts`

**Detection Output:**
```typescript
interface DetectedItem {
  id: string;
  type: string;              // 't-shirt', 'dress', etc.
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;        // 0-1
  colors: string[];          // Hex colors
  style: string;             // 'casual', 'formal', etc.
  estimatedPrice: number;
}
```

---

### 2.6 Design Validation & Optimization

**Purpose:** Automatically validate designs for production feasibility and optimize them.

**Prompt:**
```
Create a design validation workflow:
1. Check if designs meet production requirements
2. Validate color palettes for printability
3. Ensure resolution and quality standards
4. Detect potential manufacturing issues
5. Suggest optimizations for better results
6. Calculate production costs automatically
7. Check fabric compatibility
8. Validate size specifications
9. Generate technical specification sheets
10. Create production-ready files
```

**Key Files:**
- Workflow step in `src/types/workflow.ts`
- Edge function: `supabase/functions/validate-design/index.ts`

---

## 3. User Roles & Dashboards

### 3.1 Creator/Designer Dashboard

**Purpose:** Comprehensive dashboard for fashion designers to create and manage designs.

**Prompt:**
```
Build a creator dashboard with:
1. AI image generation interface with prompt builder
2. Design gallery with filtering and sorting
3. Collections management (create, edit, organize)
4. Generation history with regeneration options
5. Analytics showing views, likes, and engagement
6. Revenue tracking for sold designs
7. Collaboration tools for team projects
8. Version control for design iterations
9. Export options (PNG, SVG, PDF)
10. Inspiration feed and trending designs
11. Quick actions panel
12. Recent activity timeline
```

**Database Schema:**
```sql
CREATE TABLE image_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  image_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE collection_images (
  id BIGSERIAL PRIMARY KEY,
  collection_id UUID REFERENCES image_collections(id) ON DELETE CASCADE,
  image_id BIGINT REFERENCES generated_images(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, image_id)
);
```

**Key Components:**
- `src/pages/creator/Dashboard.tsx`
- `src/pages/creator/ImageGenerator.tsx`
- `src/pages/creator/MyDesigns.tsx`
- `src/pages/creator/Collections.tsx`
- `src/pages/creator/Analytics.tsx`

---

### 3.2 Artisan Dashboard

**Purpose:** Dashboard for artisans to receive custom orders and manage production.

**Prompt:**
```
Create an artisan dashboard featuring:
1. Incoming make requests from users
2. Order management with status tracking
3. Custom quote creation interface
4. Client communication system
5. Production timeline and milestones
6. Payment tracking and invoicing
7. Portfolio showcase of completed works
8. Materials inventory management
9. Production capacity calendar
10. Client reviews and ratings
11. Earnings and financial reports
```

**Database Schema:**
```sql
CREATE TABLE make_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  creator_id UUID REFERENCES auth.users(id),
  image_id BIGINT REFERENCES generated_images(id),
  product_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  budget_min DECIMAL,
  budget_max DECIMAL,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE artisan_quotes (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT REFERENCES make_requests(id),
  artisan_id UUID REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id),
  quoted_price DECIMAL NOT NULL,
  estimated_days INTEGER,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/pages/Artisan.tsx`
- `src/pages/artisan/Dashboard.tsx`
- `src/pages/artisan/Orders.tsx`
- `src/pages/artisan/QuoteBuilder.tsx`

---

### 3.3 Manufacturer Dashboard

**Purpose:** Dashboard for manufacturers handling bulk orders and production.

**Prompt:**
```
Build a manufacturer dashboard with:
1. Bulk order request management
2. Production planning and scheduling
3. Material sourcing and procurement
4. Quality control checkpoints
5. Shipping and logistics tracking
6. Wholesale pricing calculator
7. MOQ (Minimum Order Quantity) settings
8. Production capacity management
9. Supplier relationship management
10. Batch production reports
11. Automated reorder notifications
```

**Database Schema:**
```sql
CREATE TABLE manufacturers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  business_license TEXT,
  specialties TEXT[],
  min_order_quantity INTEGER,
  production_capacity INTEGER,
  certifications TEXT[],
  verified BOOLEAN DEFAULT false
);

CREATE TABLE quote_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  manufacturer_id UUID REFERENCES manufacturers(id),
  design_id BIGINT REFERENCES generated_images(id),
  quantity INTEGER NOT NULL,
  specifications JSONB,
  status TEXT DEFAULT 'pending',
  quoted_price DECIMAL,
  lead_time_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/pages/Manufacturer.tsx`
- `src/pages/manufacturer/Dashboard.tsx`
- `src/pages/manufacturer/Orders.tsx`
- `src/pages/manufacturer/Production.tsx`

---

### 3.4 Admin Dashboard

**Purpose:** Comprehensive admin panel for platform management and monitoring.

**Prompt:**
```
Create a powerful admin dashboard with:
1. User management (view, edit, suspend, delete)
2. Content moderation queue
3. Platform analytics and metrics
4. Financial reports and transactions
5. AI agent monitoring and health checks
6. System logs and error tracking
7. Feature flags and A/B test management
8. Database backup and maintenance
9. Email notification management
10. Role and permission management
11. Security event monitoring
12. API usage and rate limiting
13. Subscription plan management
```

**Database Schema:**
```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  action_details JSONB,
  action_time TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET
);

CREATE TABLE security_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  details JSONB,
  severity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/Users.tsx`
- `src/pages/admin/Analytics.tsx`
- `src/pages/admin/Monitoring.tsx`
- `src/pages/admin/AIAgents.tsx`

---

### 3.5 CRM System

**Purpose:** Customer relationship management for tracking interactions and conversions.

**Prompt:**
```
Implement a CRM system with:
1. Customer profile management
2. Interaction history tracking
3. Lead scoring and qualification
4. Sales pipeline visualization
5. Automated follow-up reminders
6. Email campaign integration
7. Customer segmentation
8. Lifetime value calculation
9. Churn prediction and prevention
10. Support ticket integration
```

**Database Schema:**
```sql
CREATE TABLE crm_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_name TEXT,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'lead',
  lead_score INTEGER DEFAULT 0,
  lifetime_value DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE crm_interactions (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID REFERENCES crm_customers(id),
  interaction_type TEXT NOT NULL,
  notes TEXT,
  outcome TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/pages/admin/CRM.tsx`
- `src/components/crm/*`

---

## 4. Marketplace & E-commerce

### 4.1 Marketplace Gallery

**Purpose:** Public marketplace where users can browse and purchase designs.

**Prompt:**
```
Create a marketplace with:
1. Grid and list view layouts
2. Advanced filtering (category, price, style, color)
3. Sort options (trending, new, popular, price)
4. Search with autocomplete
5. Design preview with zoom and image carousel
6. Designer profile links
7. Related designs recommendations
8. Wishlist functionality
9. Social sharing buttons
10. Quick add to cart
11. Infinite scroll or pagination
12. Mobile-responsive design
```

**Database Schema:**
```sql
CREATE TABLE marketplace_listings (
  id BIGSERIAL PRIMARY KEY,
  image_id BIGINT REFERENCES generated_images(id),
  seller_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'active',
  views INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE marketplace_metrics (
  id BIGSERIAL PRIMARY KEY,
  image_id BIGINT REFERENCES generated_images(id),
  metric_type TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/pages/Marketplace.tsx`
- `src/components/marketplace/ProductCard.tsx`
- `src/components/marketplace/FilterPanel.tsx`
- `src/components/marketplace/ProductDetail.tsx`

---

### 4.2 Shopping Cart & Checkout

**Purpose:** Full shopping cart and checkout flow with payment processing.

**Prompt:**
```
Implement e-commerce checkout:
1. Shopping cart with add/remove/update quantity
2. Cart persistence (localStorage + database)
3. Checkout form with address and payment
4. Stripe payment integration
5. Order confirmation and receipt
6. Digital download delivery
7. Coupon and discount codes
8. Tax calculation
9. Multiple payment methods
10. Guest checkout option
11. Saved payment methods
12. Order tracking
```

**Database Schema:**
```sql
CREATE TABLE cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  image_id BIGINT REFERENCES generated_images(id),
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_intent_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id),
  image_id BIGINT REFERENCES generated_images(id),
  quantity INTEGER NOT NULL,
  price DECIMAL NOT NULL
);
```

**Key Components:**
- `src/components/marketplace/ShoppingCart.tsx`
- `src/pages/Checkout.tsx`
- `src/hooks/useCart.ts`
- Edge function: `supabase/functions/create-payment-intent/index.ts`

---

### 4.3 Product Reviews & Ratings

**Purpose:** Allow users to review and rate purchased designs.

**Prompt:**
```
Add review system with:
1. Star rating (1-5 stars)
2. Written review submission
3. Review moderation
4. Helpful votes on reviews
5. Verified purchase badges
6. Photos in reviews
7. Reply to reviews (sellers)
8. Review statistics and averages
9. Filter reviews by rating
10. Report inappropriate reviews
```

**Database Schema:**
```sql
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  image_id BIGINT REFERENCES generated_images(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE review_votes (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT REFERENCES reviews(id),
  user_id UUID REFERENCES auth.users(id),
  vote_type TEXT CHECK (vote_type IN ('helpful', 'not_helpful')),
  UNIQUE(review_id, user_id)
);
```

**Key Components:**
- `src/components/marketplace/ReviewSection.tsx`
- `src/components/marketplace/ReviewForm.tsx`

---

### 4.4 Collections & Curation

**Purpose:** Allow creators to curate collections of designs.

**Prompt:**
```
Create collections feature:
1. Create public/private collections
2. Add/remove images to collections
3. Reorder images in collections
4. Collection cover image selection
5. Collection following
6. Collection discovery page
7. Trending collections
8. Collection analytics
9. Collaborative collections
10. Collection export/sharing
```

**Database Schema:**
```sql
-- Already defined in section 3.1
-- Plus:

CREATE TABLE collection_followers (
  id BIGSERIAL PRIMARY KEY,
  collection_id UUID REFERENCES image_collections(id),
  user_id UUID REFERENCES auth.users(id),
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, user_id)
);

CREATE TABLE collection_activity (
  id BIGSERIAL PRIMARY KEY,
  collection_id UUID REFERENCES image_collections(id),
  user_id UUID REFERENCES auth.users(id),
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/pages/Collections.tsx`
- `src/pages/CollectionDetail.tsx`
- `src/components/collections/*`

---

## 5. Subscription & Monetization

### 5.1 Subscription Plans

**Purpose:** Tiered subscription system with usage limits and features.

**Prompt:**
```
Create subscription tiers:

**Free Tier:**
- 5 images/month
- Basic quality
- Watermarked images
- Community support

**Basic ($9/month):**
- 50 images/month
- High quality
- No watermarks
- Email support
- Basic analytics

**Pro ($29/month):**
- 200 images/month
- Ultra quality
- Priority generation
- Advanced AI features
- API access
- Advanced analytics
- Priority support

**Enterprise ($99/month):**
- Unlimited images
- Maximum quality
- White-label options
- Dedicated account manager
- Custom AI training
- Advanced API access
- SLA guarantee

Features to implement:
1. Stripe subscription integration
2. Usage tracking and limits
3. Automatic monthly resets
4. Upgrade/downgrade flows
5. Trial periods
6. Proration handling
7. Failed payment handling
8. Cancellation with reason tracking
```

**Database Schema:**
```sql
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly DECIMAL NOT NULL,
  price_yearly DECIMAL,
  stripe_price_id TEXT,
  monthly_image_limit INTEGER NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE user_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id),
  plan_id INTEGER REFERENCES subscription_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/pages/Pricing.tsx`
- `src/components/subscription/PlanCard.tsx`
- `src/components/subscription/SubscriptionManager.tsx`
- Edge functions:
  - `supabase/functions/create-subscription/index.ts`
  - `supabase/functions/cancel-subscription/index.ts`
  - `supabase/functions/check-subscription/index.ts`
  - `supabase/functions/stripe-webhook/index.ts`

---

### 5.2 Usage Tracking

**Purpose:** Track user's monthly image generation against their limits.

**Prompt:**
```
Implement usage tracking:
1. Count images generated per calendar month
2. Display remaining quota in UI
3. Prevent generation when limit reached
4. Send notification at 80% and 100% usage
5. Automatic monthly reset on 1st of month
6. Usage history and charts
7. Projected usage warnings
8. Grace period for overages
9. Usage analytics dashboard
10. Export usage reports
```

**Database Functions:**
```sql
CREATE FUNCTION get_monthly_images_generated(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_month_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  monthly_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO monthly_count
  FROM generated_images
  WHERE user_id = user_uuid 
    AND DATE(created_at) >= current_month_start;
  RETURN COALESCE(monthly_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION reset_monthly_image_counts()
RETURNS INTEGER AS $$
DECLARE
  users_reset INTEGER := 0;
BEGIN
  UPDATE profiles 
  SET images_generated_count = 0,
      last_reset_date = date_trunc('month', CURRENT_DATE)::DATE
  WHERE last_reset_date < date_trunc('month', CURRENT_DATE)::DATE;
  GET DIAGNOSTICS users_reset = ROW_COUNT;
  RETURN users_reset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Key Components:**
- `src/components/subscription/UsageIndicator.tsx`
- `src/hooks/useSubscription.ts`

---

### 5.3 Payment Processing

**Purpose:** Handle payments securely using Stripe.

**Prompt:**
```
Integrate Stripe payments:
1. Create Stripe customer on signup
2. Save payment methods securely
3. Process one-time payments for designs
4. Handle recurring subscription billing
5. Implement 3D Secure authentication
6. Handle payment failures gracefully
7. Automatic retry for failed payments
8. Refund processing
9. Invoice generation
10. Payment history dashboard
11. Multiple currency support
12. Tax calculation and collection
```

**Key Edge Functions:**
- `supabase/functions/create-payment-intent/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/create-subscription/index.ts`
- `supabase/functions/cancel-subscription/index.ts`

---

### 5.4 Creator Earnings

**Purpose:** Track and payout earnings to creators selling designs.

**Prompt:**
```
Build creator earnings system:
1. Track sales and commissions
2. Platform fee calculation (e.g., 15%)
3. Minimum payout threshold ($50)
4. Payout schedule (weekly/monthly)
5. Payment method management
6. Earnings dashboard with charts
7. Transaction history
8. Tax document generation (1099)
9. Referral bonuses
10. Performance incentives
```

**Database Schema:**
```sql
CREATE TABLE creator_earnings (
  id BIGSERIAL PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id),
  order_id BIGINT REFERENCES orders(id),
  gross_amount DECIMAL NOT NULL,
  platform_fee DECIMAL NOT NULL,
  net_amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payout_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payouts (
  id BIGSERIAL PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id),
  amount DECIMAL NOT NULL,
  stripe_payout_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/pages/creator/Earnings.tsx`
- Edge function: `supabase/functions/process-payouts/index.ts`

---

## 6. AI Agents & Automation

### 6.1 AI Agent Framework

**Purpose:** Autonomous AI agents that perform automated tasks.

**Prompt:**
```
Create an AI agent system with:
1. Agent registration and configuration
2. Task queue and scheduling
3. Agent health monitoring
4. Automatic retry on failures
5. Agent performance metrics
6. Multi-agent coordination
7. Agent logging and debugging
8. Rate limiting and throttling
9. Agent versioning
10. Manual trigger capabilities
```

**Database Schema:**
```sql
CREATE TABLE ai_agents (
  agent_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id INTEGER REFERENCES ai_agents(agent_id),
  task_type TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_agent_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id INTEGER REFERENCES ai_agents(agent_id),
  task_type TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  payload JSONB,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_agent_health (
  agent_id INTEGER PRIMARY KEY REFERENCES ai_agents(agent_id),
  status TEXT NOT NULL,
  last_check_at TIMESTAMPTZ DEFAULT NOW(),
  response_time_ms INTEGER,
  success_rate NUMERIC,
  metadata JSONB
);
```

**Key Components:**
- Edge function: `supabase/functions/ai-agent-monitor/index.ts`
- Edge function: `supabase/functions/ai-agent-worker/index.ts`

---

### 6.2 Customer Support Agent

**Purpose:** AI-powered chatbot for customer support.

**Prompt:**
```
Build an AI support chatbot:
1. Natural language understanding
2. Answer FAQs automatically
3. Escalate to human when needed
4. Access knowledge base
5. Multi-language support
6. Context-aware responses
7. Sentiment analysis
8. Ticket creation
9. Order status lookup
10. Proactive assistance suggestions
```

**Database Schema:**
```sql
CREATE TABLE support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'open',
  sentiment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE support_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID REFERENCES support_conversations(id),
  sender_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/components/support/ChatBot.tsx`
- Edge function: `supabase/functions/ai-support/index.ts`

---

### 6.3 Content Moderation Agent

**Purpose:** Automatically moderate user-generated content.

**Prompt:**
```
Create content moderation AI:
1. Scan uploaded images for inappropriate content
2. Text analysis for offensive language
3. Automatic flagging system
4. Confidence scoring
5. Human review queue
6. False positive handling
7. User appeal process
8. Moderation history
9. Custom rule configuration
10. Bulk moderation actions
```

**Database Schema:**
```sql
CREATE TABLE moderation_queue (
  id BIGSERIAL PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id BIGINT NOT NULL,
  flagged_reason TEXT,
  confidence_score DECIMAL,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- Edge function: `supabase/functions/content-moderator/index.ts`

---

### 6.4 Marketing Automation Agent

**Purpose:** Automated marketing campaigns and email sequences.

**Prompt:**
```
Build marketing automation:
1. Email campaign scheduling
2. User segmentation
3. Personalized content
4. A/B testing
5. Conversion tracking
6. Abandoned cart emails
7. Welcome series
8. Re-engagement campaigns
9. Birthday/anniversary emails
10. Performance analytics
```

**Database Schema:**
```sql
CREATE TABLE email_campaigns (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  segment_criteria JSONB,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_sends (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT REFERENCES email_campaigns(id),
  user_id UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false
);
```

---

### 6.5 Fraud Detection Agent

**Purpose:** Detect and prevent fraudulent activities.

**Prompt:**
```
Implement fraud detection:
1. Unusual activity pattern detection
2. Multiple account detection
3. Payment fraud screening
4. Velocity checks
5. IP and device fingerprinting
6. Risk scoring
7. Automated account suspension
8. Alert notifications
9. False positive management
10. Investigation tools
```

**Database Schema:**
```sql
CREATE TABLE fraud_alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  alert_type TEXT NOT NULL,
  risk_score INTEGER,
  details JSONB,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Analytics & Business Intelligence

### 7.1 Real-Time Analytics Dashboard

**Purpose:** Live analytics showing platform metrics.

**Prompt:**
```
Create analytics dashboard with:
1. Real-time user count
2. Active sessions tracking
3. Revenue metrics (daily, monthly, yearly)
4. Conversion funnels
5. User acquisition channels
6. Retention cohorts
7. Popular designs and trends
8. Geographic distribution
9. Device and browser stats
10. Performance metrics
11. Custom date range filters
12. Export reports as PDF/CSV
```

**Database Schema:**
```sql
CREATE TABLE page_analytics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  referrer TEXT,
  device_type TEXT,
  browser TEXT,
  time_spent_seconds INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT UNIQUE NOT NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  device_type TEXT,
  browser TEXT,
  ip_address INET
);

CREATE TABLE conversion_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  event_type TEXT NOT NULL,
  funnel_name TEXT,
  funnel_step TEXT,
  step_order INTEGER,
  completed BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/pages/admin/Analytics.tsx`
- `src/components/analytics/MetricCard.tsx`
- `src/components/analytics/ConversionFunnel.tsx`
- `src/hooks/useAnalytics.ts`

---

### 7.2 User Behavior Tracking

**Purpose:** Track and analyze user interactions.

**Prompt:**
```
Implement user tracking:
1. Page view tracking
2. Click event tracking
3. Scroll depth measurement
4. Time on page
5. Exit pages
6. Search queries
7. Filter usage
8. Button clicks
9. Form submissions
10. Error encounters
11. Feature usage frequency
```

**Key Components:**
- `src/hooks/usePageTracking.ts`
- Edge function: `supabase/functions/track-event/index.ts`

---

### 7.3 A/B Testing Framework

**Purpose:** Run A/B tests to optimize conversion and UX.

**Prompt:**
```
Build A/B testing system:
1. Create experiments with variants
2. Random assignment with consistent bucketing
3. Track variant performance
4. Statistical significance calculation
5. Automatic winner selection
6. Gradual rollout of winners
7. Multi-variate testing support
8. Segment-based testing
9. Event tracking per variant
10. Experiment analytics dashboard
```

**Database Schema:**
```sql
CREATE TABLE ab_tests (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  variants JSONB NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ab_test_assignments (
  id BIGSERIAL PRIMARY KEY,
  test_id BIGINT REFERENCES ab_tests(id),
  user_id UUID REFERENCES auth.users(id),
  variant TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, user_id)
);

CREATE TABLE ab_test_results (
  id BIGSERIAL PRIMARY KEY,
  test_id BIGINT REFERENCES ab_tests(id),
  variant TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 7.4 Predictive Analytics

**Purpose:** Use ML to predict user behavior and trends.

**Prompt:**
```
Implement predictive features:
1. Churn prediction
2. Purchase likelihood scoring
3. Lifetime value estimation
4. Next best action recommendations
5. Trend forecasting
6. Demand prediction
7. Price optimization suggestions
8. Inventory forecasting
9. Seasonal pattern detection
10. Anomaly detection
```

**Database Schema:**
```sql
CREATE TABLE predictive_analytics (
  id BIGSERIAL PRIMARY KEY,
  model_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  prediction JSONB NOT NULL,
  confidence_score DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_insights (
  id BIGSERIAL PRIMARY KEY,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 7.5 Activity & Performance Metrics

**Purpose:** Track detailed performance and activity metrics.

**Prompt:**
```
Create metrics tracking:
1. API response times
2. Database query performance
3. Page load times
4. Error rates
5. User engagement scores
6. Feature adoption rates
7. System health metrics
8. Resource utilization
9. Cache hit rates
10. Third-party API performance
```

**Database Schema:**
```sql
CREATE TABLE performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  duration_ms INTEGER,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_metrics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Communication & Notifications

### 8.1 Real-Time Messaging System

**Purpose:** Direct messaging between users.

**Prompt:**
```
Build messaging system with:
1. One-on-one conversations
2. Group chats
3. Real-time message delivery
4. Typing indicators
5. Read receipts
6. Message reactions
7. File and image sharing
8. Message search
9. Conversation threading
10. Notification preferences
11. Message encryption
12. Archive and delete
```

**Database Schema:**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'direct',
  last_message_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  user_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  attachments JSONB,
  read_by UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/pages/Messages.tsx`
- `src/components/messaging/ConversationList.tsx`
- `src/components/messaging/ChatWindow.tsx`
- `src/hooks/useMessages.ts`

---

### 8.2 Push Notifications

**Purpose:** Browser and mobile push notifications.

**Prompt:**
```
Implement push notifications:
1. Browser notification permission
2. Service worker for push
3. Notification preferences
4. Priority levels
5. Action buttons in notifications
6. Notification grouping
7. Scheduled notifications
8. Rich media in notifications
9. Notification analytics
10. Cross-platform support (iOS, Android, Web)
```

**Database Schema:**
```sql
CREATE TABLE push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/services/pushNotifications.ts`
- Edge function: `supabase/functions/send-push-notification/index.ts`

---

### 8.3 Email Notifications

**Purpose:** Transactional and marketing emails.

**Prompt:**
```
Set up email system:
1. Welcome emails
2. Order confirmations
3. Shipping notifications
4. Password reset emails
5. Weekly digest emails
6. Promotional campaigns
7. Email templates with branding
8. Unsubscribe management
9. Email preferences
10. Email tracking (opens, clicks)
```

**Key Components:**
- Edge function: `supabase/functions/send-email/index.ts`
- Edge function: `supabase/functions/notify-make-order-created/index.ts`
- Edge function: `supabase/functions/notify-make-request/index.ts`

---

### 8.4 In-App Notification Center

**Purpose:** Centralized notification inbox within the app.

**Prompt:**
```
Create notification center:
1. Notification bell icon with badge
2. Dropdown notification list
3. Mark as read/unread
4. Notification categories
5. Filter and search
6. Bulk actions
7. Notification preferences
8. Auto-dismiss old notifications
9. Notification sound options
10. Desktop notification toggle
```

**Database Schema:**
```sql
CREATE TABLE user_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/components/notifications/NotificationCenter.tsx`
- `src/hooks/useNotifications.ts`

---

### 8.5 Comment System

**Purpose:** Comments on designs with threading and moderation.

**Prompt:**
```
Build comment system:
1. Top-level comments
2. Nested replies (threading)
3. Markdown support
4. Mention users with @username
5. Like/upvote comments
6. Report inappropriate comments
7. Edit and delete own comments
8. Moderator actions
9. Sort by newest/popular
10. Load more pagination
```

**Database Schema:**
```sql
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  image_id BIGINT REFERENCES generated_images(id),
  user_id UUID REFERENCES auth.users(id),
  parent_comment_id BIGINT REFERENCES comments(id),
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comment_replies (
  id BIGSERIAL PRIMARY KEY,
  comment_id BIGINT REFERENCES comments(id),
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Components:**
- `src/components/comments/CommentSection.tsx`
- `src/components/comments/CommentForm.tsx`

---

## 9. Advanced Features

### 9.1 Workflow Orchestration

**Purpose:** Automated multi-step workflows for complex processes.

**Prompt:**
```
Create workflow engine:
1. Define workflow types (design_to_manufacturing, custom_design, bulk_order)
2. Step-by-step execution with state management
3. Conditional branching
4. Parallel execution
5. Error handling and rollback
6. Progress tracking
7. Step validation
8. Workflow templates
9. Manual intervention points
10. Audit trail and logging
```

**Database Schema:**
```sql
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  workflow_type TEXT NOT NULL,
  current_step TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  input_data JSONB,
  step_history JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_step_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflow_executions(id),
  step_name TEXT NOT NULL,
  output_data JSONB,
  quality_score DECIMAL,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Files:**
- `src/types/workflow.ts`
- `src/contexts/WorkflowContext.tsx`
- `src/hooks/useWorkflow.ts`

---

### 9.2 Multi-Language Support (i18n)

**Purpose:** Support multiple languages for global reach.

**Prompt:**
```
Implement internationalization:
1. Set up i18next with react-i18next
2. Language detection from browser
3. Language switcher component
4. Translation files for each language (en, es, fr, de, etc.)
5. RTL support for Arabic, Hebrew
6. Date and number formatting per locale
7. Currency conversion
8. Lazy load translations
9. Translation management system
10. Fallback language handling
```

**Key Files:**
- `src/i18n/config.ts`
- `src/locales/en.json`
- `src/locales/es.json`
- `src/components/LanguageSwitcher.tsx`

---

### 9.3 Dynamic Content Management

**Purpose:** Admin-controlled content blocks without code changes.

**Prompt:**
```
Build CMS system:
1. Create content blocks table
2. Block types (hero, feature_grid, testimonials, FAQ, etc.)
3. WYSIWYG editor for content
4. Drag-and-drop page builder
5. Content versioning
6. Publish/unpublish scheduling
7. Content localization
8. Media library integration
9. SEO metadata per page
10. Preview before publish
```

**Database Schema:**
```sql
CREATE TABLE content_blocks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  block_type TEXT NOT NULL,
  content JSONB NOT NULL,
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  blocks UUID[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 9.4 API Key Management

**Purpose:** Allow developers to integrate via API.

**Prompt:**
```
Create API key system:
1. Generate API keys for users
2. Key rotation and expiration
3. Rate limiting per key
4. Usage tracking and quotas
5. Scope and permission management
6. Webhook configuration
7. API documentation with examples
8. Test environment keys
9. Key revocation
10. Audit logs for API usage
```

**Database Schema:**
```sql
CREATE TABLE api_keys (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  key_name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  permissions TEXT[],
  rate_limit INTEGER DEFAULT 1000,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 9.5 SEO Optimization

**Purpose:** Optimize platform for search engines.

**Prompt:**
```
Implement SEO best practices:
1. Dynamic meta tags with react-helmet
2. Semantic HTML structure
3. Open Graph tags for social sharing
4. Twitter Card metadata
5. JSON-LD structured data
6. XML sitemap generation
7. robots.txt configuration
8. Canonical URLs
9. Image alt tags
10. Page speed optimization
11. Mobile-friendly design
12. Schema.org markup for products
```

**Key Components:**
- `src/components/SEO.tsx`
- Edge function: `supabase/functions/generate-sitemap/index.ts`

---

### 9.6 Search Functionality

**Purpose:** Full-text search across designs, users, and collections.

**Prompt:**
```
Implement search:
1. Full-text search with PostgreSQL
2. Search autocomplete
3. Search suggestions
4. Filter search results
5. Search history
6. Trending searches
7. Search analytics
8. Fuzzy matching
9. Search by tags
10. Visual similarity search
```

**Database Schema:**
```sql
CREATE TABLE search_queries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  results_count INTEGER,
  clicked_result_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. Edge Functions & Backend Services

### 10.1 Image Generation Functions

**Function: `generate-image`**
```typescript
Purpose: Main image generation endpoint supporting multiple AI providers
Input: { prompt, itemType, aspectRatio, referenceImageUrl?, userId }
Output: { success, imageUrl, imageId, error?, suggestions? }
Provider: FAL.ai (primary), with fallback to others
```

**Function: `generate-image-gemini`**
```typescript
Purpose: Generate images using Google Gemini AI
Model: google/gemini-2.5-flash-image-preview
Supports: Text-to-image, image editing
```

**Function: `generate-image-huggingface`**
```typescript
Purpose: Generate images using Hugging Face Inference API
Models: FLUX.1-dev, Stable Diffusion variants
```

**Function: `generate-image-xai`**
```typescript
Purpose: Generate images using xAI models
Specialized: Fashion and apparel generation
```

---

### 10.2 Virtual Try-On Functions

**Function: `virtual-tryon`**
```typescript
Purpose: Generate virtual try-on images
Process:
1. Validate subscription and limits
2. Download body and clothing images
3. Process with AI model
4. Upload result to storage
5. Update database with result
Input: { bodyImageUrl, clothingImageUrl }
Output: { success, resultImageUrl, sessionId }
```

**Function: `upload-tryon-image`**
```typescript
Purpose: Handle image uploads for try-on
Validates: File type, size, dimensions
Storage: Supabase Storage bucket 'tryon-images'
```

---

### 10.3 Analysis Functions

**Function: `analyze-reference-image`**
```typescript
Purpose: Analyze uploaded reference images
AI: Gemini Vision API
Extracts:
- Dominant colors
- Style characteristics
- Composition analysis
- Object detection
- Texture description
Output: Enhanced prompt based on analysis
```

**Function: `computer-vision-analysis`**
```typescript
Purpose: Detailed computer vision analysis
Features:
- Fashion item detection
- Color palette extraction
- Style classification
- Trend prediction
- Tag generation
```

**Function: `enhance-prompt`**
```typescript
Purpose: AI-powered prompt enhancement
Process:
1. Analyze user's generation history
2. Extract style preferences
3. Use Gemini to enhance prompt
4. Add technical details
Output: { enhancedPrompt, suggestions, confidence }
```

---

### 10.4 Subscription & Payment Functions

**Function: `check-subscription`**
```typescript
Purpose: Verify subscription status and limits
Checks:
- Active subscription
- Monthly image quota
- Usage remaining
- Subscription features
Output: {
  tier, isActive, monthlyLimit,
  imagesGenerated, canGenerateImage, remainingImages
}
```

**Function: `create-subscription`**
```typescript
Purpose: Create new Stripe subscription
Process:
1. Create or get Stripe customer
2. Create subscription
3. Store in database
4. Update user profile
```

**Function: `cancel-subscription`**
```typescript
Purpose: Cancel Stripe subscription
Options: Immediate or end of period
Updates: Profile tier and limits
```

**Function: `stripe-webhook`**
```typescript
Purpose: Handle Stripe webhook events
Events:
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

**Function: `create-payment-intent`**
```typescript
Purpose: Create Stripe payment intent
Use: One-time design purchases
Calculates: Total, tax, fees
```

---

### 10.5 AI Agent Functions

**Function: `ai-agent-monitor`**
```typescript
Purpose: Monitor and manage AI agents
Tasks:
- Health checks
- Task queue processing
- Performance metrics
- Error handling
- Automatic recovery
Schedule: Runs every 5 minutes via cron
```

**Function: `ai-agent-worker`**
```typescript
Purpose: Process queued AI agent tasks
Handles:
- Content generation
- Moderation
- Analytics
- Notifications
- Data processing
```

**Function: `ai-support`**
```typescript
Purpose: AI chatbot for customer support
AI: Gemini for natural language
Features:
- Answer FAQs
- Order lookup
- Escalation to human
- Context awareness
```

**Function: `content-moderator`**
```typescript
Purpose: Automated content moderation
Checks:
- Inappropriate images
- Offensive text
- Spam detection
- Policy violations
Action: Flag for review or auto-reject
```

---

### 10.6 Notification Functions

**Function: `send-email`**
```typescript
Purpose: Send transactional emails
Templates:
- Welcome email
- Order confirmation
- Password reset
- Subscription updates
Provider: Resend or SendGrid
```

**Function: `notify-make-request`**
```typescript
Purpose: Notify when custom make request created
Recipients: Selected artisans
Contains: Request details, user info, deadline
```

**Function: `notify-make-order-created`**
```typescript
Purpose: Notify on new order
Types: Artisan orders, manufacturer quotes
Sends: Email notifications to both parties
```

**Function: `send-push-notification`**
```typescript
Purpose: Send push notifications
Targets: Web Push API subscriptions
Types: Engagement, updates, promotions
```

---

### 10.7 Analytics Functions

**Function: `track-event`**
```typescript
Purpose: Track user events and analytics
Events:
- Page views
- Button clicks
- Conversions
- Engagement
Storage: page_analytics, activity_metrics tables
```

**Function: `get-analytics-summary`**
```typescript
Purpose: Get aggregated analytics
Admin only: Security check
Returns: Users, sessions, revenue, trends
Time ranges: 7d, 30d, 90d
```

**Function: `analyze-user-activity`**
```typescript
Purpose: Analyze user behavior patterns
AI: Pattern detection
Output: Activity insights, predictions
Admin only
```

---

### 10.8 Workflow Functions

**Function: `start-workflow`**
```typescript
Purpose: Initialize workflow execution
Types: design_to_manufacturing, custom_design, bulk_order
Creates: workflow_executions record
Returns: Workflow ID
```

**Function: `advance-workflow-step`**
```typescript
Purpose: Move workflow to next step
Validates: Current step completion
Updates: Step history, status
Triggers: Next step processing
```

**Function: `workflow-automation`**
```typescript
Purpose: Automated workflow processing
Steps:
1. Input processing
2. Design generation
3. Validation
4. Optimization
5. Production routing
6. Quote generation
```

---

### 10.9 Storage & Media Functions

**Function: `upload-to-storage`**
```typescript
Purpose: Upload files to Supabase Storage
Buckets:
- generated-images
- tryon-images
- avatars
- documents
Validates: File type, size
Returns: Public URL
```

**Function: `optimize-image`**
```typescript
Purpose: Optimize images for storage
Process:
- Resize to optimal dimensions
- Compress without quality loss
- Generate thumbnails
- Convert formats (WebP)
```

---

### 10.10 Security & Admin Functions

**Function: `validate-admin`**
```typescript
Purpose: Verify admin privileges
Checks:
- User authentication
- Admin role in admin_roles table
- Rate limiting
Logs: All admin actions in audit_logs
```

**Function: `audit-log`**
```typescript
Purpose: Log security and admin events
Captures:
- User actions
- Security events
- Data changes
- API calls
Includes: IP, timestamp, details
```

**Function: `security-scan`**
```typescript
Purpose: Scan for security issues
Checks:
- Unusual login patterns
- Suspicious activity
- Rate limit violations
- Potential fraud
```

---

## Database Schema Summary

### Core Tables
```sql
-- Users and profiles
profiles
admin_roles
user_sessions

-- Content
generated_images
image_collections
collection_images
collection_followers
comments
reviews

-- Commerce
marketplace_listings
orders
order_items
cart_items
artisan_quotes
quote_requests
make_requests

-- Subscriptions
subscription_plans
user_subscriptions
creator_earnings
payouts

-- AI & Workflows
ai_agents
ai_agent_tasks
ai_agent_queue
ai_agent_health
workflow_executions
workflow_step_outputs
virtual_tryon_sessions

-- Analytics
page_analytics
user_sessions
conversion_events
performance_metrics
activity_metrics
ab_tests

-- Communication
conversations
messages
user_notifications
push_subscriptions
email_campaigns

-- System
audit_logs
security_events
api_keys
content_blocks
search_queries
```

---

## Environment Variables & Secrets

### Required Secrets
```bash
# Supabase
SUPABASE_URL=https://igkiffajkpfwdfxwokwg.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...

# AI Providers
FAL_KEY=<fal.ai API key>
GEMINI_API_KEY=<Google Gemini key>
HUGGINGFACE_TOKEN=<HF token>
XAI_API_KEY=<xAI key>

# Payment
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
# or
SENDGRID_API_KEY=SG....

# Storage
SUPABASE_SERVICE_ROLE_KEY=<for admin operations>

# AI Gateway
LOVABLE_API_KEY=<for Nano banana model>
```

---

## Deployment & DevOps

### Deployment Prompt
```
Deploy the platform:
1. Set up Supabase project
2. Run database migrations in order
3. Configure RLS policies
4. Deploy edge functions
5. Add environment variables and secrets
6. Configure Stripe webhooks
7. Set up custom domain
8. Enable CORS for production domain
9. Configure CDN for assets
10. Set up monitoring and alerts
11. Enable database backups
12. Configure rate limiting
```

### Monitoring Prompt
```
Set up monitoring:
1. Sentry for error tracking
2. LogRocket for session replay
3. Supabase database metrics
4. Edge function logs
5. Uptime monitoring
6. Performance budgets
7. Cost tracking and alerts
8. Security scanning
9. Database query performance
10. API rate limits
```

---

## Testing Strategy

### Testing Prompt
```
Implement comprehensive testing:

**Unit Tests:**
- Utility functions
- Custom hooks
- Services and API clients
- Type validations

**Integration Tests:**
- API endpoints
- Database operations
- Edge functions
- Payment flows

**E2E Tests:**
- User registration/login
- Image generation flow
- Purchase workflow
- Admin operations
- Multi-user scenarios

**Performance Tests:**
- Load testing edge functions
- Database query optimization
- Image generation throughput
- Concurrent user handling

**Security Tests:**
- SQL injection prevention
- XSS protection
- CSRF protection
- Authentication bypass attempts
- RLS policy validation

Tools: Vitest, React Testing Library, Playwright, k6
```

---

## Future Enhancements Roadmap

### Phase 1: Mobile Apps
```
Build native mobile apps:
1. React Native or Flutter
2. Offline support
3. Camera integration
4. Push notifications
5. Biometric auth
6. AR try-on features
```

### Phase 2: Social Features
```
Add social networking:
1. User feeds and timelines
2. Follow/unfollow users
3. Social sharing
4. Design challenges and contests
5. Community voting
6. Collaborative projects
```

### Phase 3: Advanced AI
```
Enhanced AI capabilities:
1. Custom AI model training per user
2. Style transfer from real photos
3. 3D model generation
4. Animation and motion graphics
5. Video generation
6. Voice-controlled design
```

### Phase 4: Marketplace Expansion
```
Scale the marketplace:
1. NFT minting for designs
2. Print-on-demand integration
3. Affiliate program
4. White-label solutions
5. B2B enterprise features
6. Global shipping partnerships
```

---

## Appendix: Key Design Patterns

### 1. Service Layer Pattern
All API interactions go through service files in `src/services/`:
- Centralized error handling
- Request/response transformation
- Retry logic
- Caching strategies

### 2. Custom Hooks Pattern
Reusable React hooks in `src/hooks/`:
- Encapsulate business logic
- Manage state and side effects
- Type-safe interfaces
- Easy testing

### 3. Edge Function Pattern
All Supabase functions follow:
- CORS headers
- Input validation
- Error handling with try/catch
- Structured logging
- Security checks
- Standard response format

### 4. Database Function Pattern
PostgreSQL functions for:
- Complex queries
- Atomic operations
- Security-sensitive operations
- Performance optimization

### 5. RLS Policy Pattern
Row Level Security for all tables:
- User-specific data isolation
- Role-based access
- Public vs private data
- Admin overrides

---

## Conclusion

This documentation provides comprehensive prompts to recreate the OpenTeknologies platform from scratch. Each module is designed to be:

- **Modular**: Can be implemented independently
- **Scalable**: Built for growth
- **Secure**: Security-first approach
- **Maintainable**: Clean code and patterns
- **Extensible**: Easy to add features

**Total Features Documented:** 100+  
**Edge Functions:** 48+  
**Database Tables:** 80+  
**React Components:** 200+  
**Custom Hooks:** 30+

For questions or contributions, refer to the individual sections or reach out to the development team.

---

**Last Updated:** 2025-10-29  
**Version:** 1.0.0  
**License:** Proprietary