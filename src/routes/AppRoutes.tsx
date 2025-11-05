
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
const CollectionsPage = lazy(() => import("@/pages/CollectionsPage"));
const CollectionDetailPage = lazy(() => import("@/pages/CollectionDetailPage"));
const ManageCollectionPage = lazy(() => import("@/pages/ManageCollectionPage"));
const TryOnHistoryPage = lazy(() => import("@/pages/TryOnHistoryPage").then(module => ({ default: module.TryOnHistoryPage })));
const OnboardingDashboard = lazy(() => import("@/pages/OnboardingDashboard"));

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
          <Route path="/collections" element={
            <EnhancedErrorBoundary>
              <CollectionsPage />
            </EnhancedErrorBoundary>
          } />
          <Route path="/my-collections" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <CollectionsPage />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          <Route path="/collections/:id" element={
            <EnhancedErrorBoundary>
              <CollectionDetailPage />
            </EnhancedErrorBoundary>
          } />
          <Route path="/my-collections/:id" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <ManageCollectionPage />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          <Route path="/try-on-history" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <TryOnHistoryPage />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          <Route path="/onboarding/progress" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <OnboardingDashboard />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          
          {/* Dynamic Router handles all other routes */}
          <Route path="*" element={<DynamicRouter />} />
        </Routes>
      </Suspense>
    </EnhancedErrorBoundary>
  );
};
