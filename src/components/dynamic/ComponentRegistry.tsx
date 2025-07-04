import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Component registry mapping component names to actual components
const componentMap = {
  // Pages
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
  
  // Custom components for dynamic content
  'DynamicContent': lazy(() => import('./DynamicContent')),
  'LandingPage': lazy(() => import('./templates/LandingPage')),
  'ContentPage': lazy(() => import('./templates/ContentPage')),
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
  const Component = componentMap[componentName as keyof typeof componentMap];

  if (!Component) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Component Not Found</h2>
          <p className="text-muted-foreground mt-2">
            Component "{componentName}" is not registered in the component registry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className={className}>
        <Component {...config} />
      </div>
    </Suspense>
  );
};