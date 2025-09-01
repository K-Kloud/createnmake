
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { DynamicRouter } from "@/components/dynamic/DynamicRouter";

// Lazy load route modules
const CRMRoutes = lazy(() => import("./CRMRoutes"));
const CreatorRoutes = lazy(() => import("./CreatorRoutes"));
const ArtisanRoutes = lazy(() => import("./ArtisanRoutes"));
const ManufacturerRoutes = lazy(() => import("./ManufacturerRoutes"));
const AdminRoutes = lazy(() => import("./AdminRoutes").then(module => ({ default: module.AdminRoutes })));

const CreatorProfile = lazy(() => import("@/pages/CreatorProfile"));
const ImageDetail = lazy(() => import("@/pages/ImageDetail"));
const OrderTracking = lazy(() => import("@/pages/OrderTracking"));
const MakerDetail = lazy(() => import("@/pages/MakerDetail"));

export const AppRoutes = () => {
  return (
    <EnhancedErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Nested routes that should override dynamic routes */}
          <Route path="/admin/*" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <AdminRoutes />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          <Route path="/crm/*" element={
            <EnhancedErrorBoundary>
              <CRMRoutes />
            </EnhancedErrorBoundary>
          } />
          <Route path="/creator/*" element={
            <EnhancedErrorBoundary>
              <CreatorRoutes />
            </EnhancedErrorBoundary>
          } />
          <Route path="/artisan/*" element={
            <EnhancedErrorBoundary>
              <ArtisanRoutes />
            </EnhancedErrorBoundary>
          }/>
          <Route path="/manufacturer/*" element={
            <EnhancedErrorBoundary>
              <ManufacturerRoutes />
            </EnhancedErrorBoundary>
          }/>
          
          {/* Deep linking routes */}
          <Route path="/creator/:id" element={
            <EnhancedErrorBoundary>
              <CreatorProfile />
            </EnhancedErrorBoundary>
          } />
          <Route path="/image/:id" element={
            <EnhancedErrorBoundary>
              <ImageDetail />
            </EnhancedErrorBoundary>
          } />
          <Route path="/order/:id" element={
            <EnhancedErrorBoundary>
              <OrderTracking />
            </EnhancedErrorBoundary>
          } />
          <Route path="/maker/:id" element={
            <EnhancedErrorBoundary>
              <MakerDetail />
            </EnhancedErrorBoundary>
          } />
          
          {/* Dynamic Router handles all other routes */}
          <Route path="*" element={<DynamicRouter />} />
        </Routes>
      </Suspense>
    </EnhancedErrorBoundary>
  );
};
