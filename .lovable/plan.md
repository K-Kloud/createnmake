## Goal

Tighten the site into a simple, sleek, modern product: cleaner hero, quieter chrome, consistent components, and real interactions (search, filters, loading states) that feel responsive. Keep the existing "Void & Acid" technical aesthetic but reduce visual noise and standardize patterns across pages.

## 1. Global shell & chrome

- **Header**: Replace the gradient-text "open|teknologies" logo with a single, confident wordmark paired with a small acid-lime glyph. Tighten height to `h-14`, add a subtle underline on active nav route, and a keyboard-accessible command palette button (`⌘K`) that opens global search (routes + marketplace).
- **Footer**: Keep the 4-column structure, add social icons row (lucide icons only, no brand gradients), newsletter email capture (no backend wiring — submits to existing edge function if present, otherwise toast "Subscribed"), and a small build/version tag in mono for the technical feel.
- **MainLayout**: Drop the forced `space-y-8` between sections (causes uneven rhythm with section-level padding). Sections own their own vertical spacing.

## 2. Homepage refinement

- **HeroSection**: Keep the typography system but:
  - Remove four corner markers (too busy at this scale); keep one top-left marker + status dot.
  - Add a thin animated scanline across the headline block (reuse `.scanline`).
  - Replace hard-coded metrics with a `<LiveMetrics/>` component that reads counts from Supabase (`designs`, `artisans`, with graceful fallback to current static numbers).
  - Add a secondary "See how it works" ghost link that opens a short lightbox with 3 steps.
- **TrustSignals**: Convert to a quiet single-row marquee of partner/press names in mono caps, auto-pausing on hover.
- **Featured Artisans / Marketplace preview**: Unify card styling (sharp corners, hairline border, hover = acid border + subtle lift). Add skeleton loaders.
- **SocialProof**: Reduce to 3 testimonials in a peek-carousel with snap scrolling.
- **CTASection**: Single full-bleed band, left-aligned copy, right-aligned primary + ghost CTAs. Remove nested gradients.
- Remove `OnboardingChecklist` from the homepage for signed-out users (it's empty noise); show only when authenticated and incomplete.

## 3. Shared components standardization

- **Buttons**: Audit `src/components/ui/button.tsx` — ensure one canonical set: `default` (acid), `outline` (hairline), `ghost`, `destructive`. Remove any one-off classnames in pages and route through variants.
- **Cards**: `Card` currently has `rounded-lg` + shadow hover — override with `rounded-none`, hairline border, and `hover:border-primary/40` to match the aesthetic. Shadow removed.
- **Inputs / Select / Textarea**: Sharp corners, hairline border, focus ring in acid. Add consistent left-icon slot.
- **Loading**: Replace scattered spinners with a single `PageSkeleton` + `CardSkeleton` pair; use across Create, Marketplace, Designs, Dashboard.
- **Empty states**: One `EmptyState` component (icon, title, description, CTA) used on Orders, Designs, Messages, Notifications.

## 4. Key page upgrades

- **Create page**: Two-column layout (prompt/controls left, live preview right) that collapses to stacked on mobile. Add prompt presets chip row sourced from the project-knowledge prompt library (Tops, Bottoms, Dresses, Outerwear, Nigerian Contemporary, Global Styles, Accessories). Clicking a chip fills the prompt. Add "recent generations" strip below preview.
- **Marketplace**: Sticky filter bar (category, price range, artisan, sort). URL-synced filters via `useSearchParams`. Grid→list toggle. Skeleton cards while loading.
- **Designs (My Designs)**: Tabs for `All / Drafts / Published`, bulk select + delete, share link button.
- **Dashboard**: Replace any debug-looking widgets with 4 KPI cards (Designs, Orders, Revenue, Messages) + a recent activity list. Mono numerics, hairline dividers.
- **Auth**: Tidy spacing, single-column, add social sign-in row (only if providers already configured — detect and conditionally render), real-time validation.
- **Legal/Privacy/Terms**: Long-form readable typography (`prose prose-invert`), sticky TOC on desktop.
- **NotFound**: Redesign as a terminal-style 404 with quick links back to key routes.

## 5. Functional upgrades

- **Global command palette (`⌘K`)**: Using `cmdk` (already common in shadcn). Routes + search designs/artisans. Keyboard shortcut registered in `App.tsx`.
- **Toasts**: Standardize on the existing `useToast`; remove any `alert()` usage. Add success/error/info variants with acid accent for success.
- **Route transitions**: Add a 150ms fade on route change via a small wrapper in `AppRoutes`.
- **Image handling**: Add `<SmartImage/>` wrapper with blur-up placeholder, lazy loading, and error fallback. Use in marketplace and designs grids.
- **SEO**: Ensure every top-level page passes `seo` to `MainLayout`; fill gaps found in audit.
- **Accessibility pass**: Focus rings on all interactive elements, `aria-label` on icon-only buttons, color contrast check on muted text (bump `--muted-foreground` to 70% if needed).
- **Performance**: Keep lazy-loading on Index; add `react-query` `staleTime` defaults in `AppProviders` to reduce refetch flicker.

## 6. Out of scope (for this pass)

- New backend tables, auth providers, or payment changes.
- Mobile app (Capacitor) changes.
- i18n string additions beyond existing keys.

## Technical notes

- Files likely touched: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/layouts/MainLayout.tsx`, `src/components/home/*`, `src/components/ui/{button,card,input,select,textarea}.tsx`, `src/pages/{Index,Create,Marketplace,Designs,Dashboard,Auth,Legal,Privacy,Terms,NotFound}.tsx`, `src/routes/AppRoutes.tsx`, `src/providers/AppProviders.tsx`.
- New files: `src/components/common/{EmptyState,PageSkeleton,CardSkeleton,SmartImage,LiveMetrics}.tsx`, `src/components/common/CommandPalette.tsx`, `src/components/home/PromptPresets.tsx`.
- No schema changes. `LiveMetrics` uses `select('*', { count: 'exact', head: true })` on existing tables with fallbacks.

## Deliverable order

1. Shared primitives (button, card, input, skeletons, empty state).
2. Header + Footer + MainLayout.
3. Homepage sections.
4. Create, Marketplace, Designs, Dashboard.
5. Auth, Legal, NotFound.
6. Command palette + route transitions + SmartImage + accessibility pass.
