
import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';

// Component registry mapping component names to actual components
const componentMap = {
  // Main Pages - Direct imports to avoid dynamic loading issues
  'Index': lazy(() => import('@/pages/Index')),
  'Create': lazy(() => import('@/pages/Create')),
  'Design': lazy(() => import('@/pages/Design')),
  'Designs': lazy(() => import('@/pages/Designs')),
  'Products': lazy(() => import('@/pages/Products')),
  'Earnings': lazy(() => import('@/pages/Earnings')),
  'Marketplace': lazy(() => import('@/pages/Marketplace')),
  'Cart': lazy(() => import('@/pages/Cart')),
  'Checkout': lazy(() => import('@/pages/Checkout')),
  'Dashboard': lazy(() => import('@/pages/Dashboard')),
  'Settings': lazy(() => import('@/pages/Settings')),
  'Contact': lazy(() => import('@/pages/Contact')),
  'FAQ': lazy(() => import('@/pages/FAQ')),
  'Features': lazy(() => import('@/pages/Features')),
  'Testimonials': lazy(() => import('@/pages/Testimonials')),
  'JoinUs': lazy(() => import('@/pages/JoinUs')),
  'JoinArtisan': lazy(() => import('@/pages/JoinArtisan')),
  'JoinManufacturer': lazy(() => import('@/pages/JoinManufacturer')),
  'Subscription': lazy(() => import('@/pages/Subscription')),
  'Integrations': lazy(() => import('@/pages/Integrations')),
  'SystemMonitoring': lazy(() => import('@/pages/SystemMonitoring')),
  'Notifications': lazy(() => import('@/pages/Notifications')),
  'Orders': lazy(() => import('@/pages/Orders')),
  
  // Admin Pages
  'Admin': lazy(() => import('@/pages/Admin')),
  
  // Role-specific Pages
  'Artisan': lazy(() => import('@/pages/Artisan')),
  'Manufacturer': lazy(() => import('@/pages/Manufacturer')),
  
  // Onboarding Pages
  'ArtisanOnboarding': lazy(() => import('@/pages/ArtisanOnboarding')),
  'ManufacturerOnboarding': lazy(() => import('@/pages/ManufacturerOnboarding')),
  
  // Maker Pages
  'MakerDetail': lazy(() => import('@/pages/MakerDetail')),
  
  // Subscription Pages
  'Success': lazy(() => import('@/pages/subscription/Success')),
  'Cancel': lazy(() => import('@/pages/subscription/Cancel')),
  
  // Auth Pages (for dynamic routing if needed)
  'Auth': lazy(() => import('@/pages/Auth')),
  'AuthCallback': lazy(() => import('@/pages/AuthCallback')),
  'ResetPassword': lazy(() => import('@/pages/ResetPassword')),
  
  // Role-specific Dashboard Pages
  'CreatorDashboardPage': lazy(() => import('@/pages/CreatorDashboardPage')),
  'CreatorOnboardingPage': lazy(() => import('@/pages/CreatorOnboardingPage')),
  
  // Custom components for dynamic content
  'DynamicContent': lazy(() => import('./DynamicContent')),
  'LandingPage': lazy(() => import('./templates/LandingPage')),
  'ContentPage': lazy(() => import('./templates/ContentPage')),
  
  // Dashboard and Analytics Pages
  'RealtimeDashboard': lazy(() => import('@/pages/Dashboard')),
  'AdvancedAI': lazy(() => import('@/pages/Create')),
  'UserInsights': lazy(() => import('@/pages/Dashboard')),
  'APIDocumentation': lazy(() => import('@/pages/Integrations')),
  
  // Additional navigation pages
  'About': lazy(() => import('@/pages/About')),
  'Terms': lazy(() => import('@/pages/Terms')),
  'Privacy': lazy(() => import('@/pages/Privacy')),
  'Support': lazy(() => import('@/pages/Support')),
  'Documentation': lazy(() => import('@/pages/Documentation'))
};

interface ComponentRegistryProps {
  componentName: string;
  config?: any;
  className?: string;
}

export const ComponentRegistry: React.FC<ComponentRegistryProps> = ({
  componentName,
  config = {},
  className = ''
}) => {
  console.log('ComponentRegistry - Loading component:', componentName);
  const Component = componentMap[componentName as keyof typeof componentMap];

  if (!Component) {
    console.error(`Component "${componentName}" not found in registry. Available components:`, Object.keys(componentMap));
    return (
      <EnhancedErrorBoundary>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive">Component Not Found</h2>
            <p className="text-muted-foreground mt-2">
              Component "{componentName}" is not registered in the component registry.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Available components: {Object.keys(componentMap).join(', ')}
            </p>
          </div>
        </div>
      </EnhancedErrorBoundary>
    );
  }

  return (
    <EnhancedErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive">Component Error</h2>
            <p className="text-muted-foreground mt-2">
              Failed to load component "{componentName}". Please try refreshing the page.
            </p>
          </div>
        </div>
      }
    >
      <Suspense fallback={<LoadingSpinner />}>
        <div className={className}>
          <Component {...config} />
        </div>
      </Suspense>
    </EnhancedErrorBoundary>
  );
};
