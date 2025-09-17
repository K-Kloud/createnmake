
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDynamicPages } from '@/hooks/useDynamicPages';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import NotFound from '@/pages/NotFound';
import { ComponentRegistry } from './ComponentRegistry';

// Direct import for Index to avoid dynamic loading issues
const IndexPage = lazy(() => import('@/pages/Index'));

// Static routes that should always be available (excluding nested routes handled by AppRoutes)
const staticRoutes = [
  { path: '/auth', component: lazy(() => import('@/pages/Auth')) },
  { path: '/auth/callback', component: lazy(() => import('@/pages/AuthCallback')) },
  { path: '/reset-password', component: lazy(() => import('@/pages/ResetPassword')) },
];

// Routes that should be excluded from dynamic routing (handled by nested routers)
const excludedPaths = ['/admin', '/crm', '/creator', '/artisan', '/manufacturer'];

export const DynamicRouter = () => {
  const { pages, isLoading } = useDynamicPages();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  // Debug logging
  console.log('DynamicRouter - Pages:', pages);
  console.log('DynamicRouter - isLoading:', isLoading);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!pages) {
    console.warn('DynamicRouter - No pages loaded, falling back to static route');
    return (
      <EnhancedErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            {staticRoutes.map(({ path, component: Component }) => (
              <Route 
                key={path} 
                path={path} 
                element={
                  <EnhancedErrorBoundary>
                    <Component />
                  </EnhancedErrorBoundary>
                } 
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </EnhancedErrorBoundary>
    );
  }

  const hasAccess = (page: any) => {
    if (!page.requires_auth) return true;
    if (!user) return false;
    
    if (page.allowed_roles?.length > 0) {
      return page.allowed_roles.some((role: string) => {
        switch (role) {
          case 'admin': return profile?.is_admin;
          case 'creator': return profile?.is_creator;
          case 'artisan': return profile?.is_artisan;
          case 'manufacturer': return profile?.is_manufacturer;
          default: return true;
        }
      });
    }
    
    return true;
  };

  return (
    <EnhancedErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Static routes */}
          {staticRoutes.map(({ path, component: Component }) => (
            <Route 
              key={path} 
              path={path} 
              element={
                <EnhancedErrorBoundary>
                  <Component />
                </EnhancedErrorBoundary>
              } 
            />
          ))}
          
          {/* Dynamic routes from database (excluding nested routes) */}
          {pages?.filter(page => page.is_active && !excludedPaths.some(excluded => page.route_path.startsWith(excluded))).map((page) => {
            console.log('DynamicRouter - Processing page:', page.route_path, page.component_name);
            
            // Special handling for home route to avoid dynamic loading issues
            if (page.route_path === '/') {
              console.log('DynamicRouter - Rendering home page with IndexPage component');
              return (
                <Route
                  key={page.id}
                  path={page.route_path}
                  element={
                    <EnhancedErrorBoundary>
                      <Suspense fallback={<LoadingSpinner />}>
                        <IndexPage />
                      </Suspense>
                    </EnhancedErrorBoundary>
                  }
                />
              );
            }

            const ComponentToRender = () => (
              <ComponentRegistry 
                componentName={page.component_name}
                config={page.layout_config}
              />
            );

            if (page.requires_auth) {
              return (
                <Route
                  key={page.id}
                  path={page.route_path}
                  element={
                    <EnhancedErrorBoundary>
                      <ProtectedRoute>
                        {hasAccess(page) ? (
                          <ComponentToRender />
                        ) : (
                          <Navigate to="/auth" replace />
                        )}
                      </ProtectedRoute>
                    </EnhancedErrorBoundary>
                  }
                />
              );
            }

            return (
              <Route
                key={page.id}
                path={page.route_path}
                element={
                  <EnhancedErrorBoundary>
                    <ComponentToRender />
                  </EnhancedErrorBoundary>
                }
              />
            );
          })}
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <EnhancedErrorBoundary>
                <NotFound />
              </EnhancedErrorBoundary>
            } 
          />
        </Routes>
      </Suspense>
    </EnhancedErrorBoundary>
  );
};
