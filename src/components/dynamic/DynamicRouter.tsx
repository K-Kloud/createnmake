import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDynamicPages } from '@/hooks/useDynamicPages';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import NotFound from '@/pages/NotFound';
import { ComponentRegistry } from './ComponentRegistry';

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

  if (isLoading) {
    return <LoadingSpinner />;
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
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Static routes */}
        {staticRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        
        {/* Dynamic routes from database (excluding nested routes) */}
        {pages?.filter(page => page.is_active && !excludedPaths.some(excluded => page.route_path.startsWith(excluded))).map((page) => {
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
                  <ProtectedRoute>
                    {hasAccess(page) ? (
                      <ComponentToRender />
                    ) : (
                      <Navigate to="/auth" replace />
                    )}
                  </ProtectedRoute>
                }
              />
            );
          }

          return (
            <Route
              key={page.id}
              path={page.route_path}
              element={<ComponentToRender />}
            />
          );
        })}
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};