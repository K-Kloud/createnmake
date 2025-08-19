import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { DynamicRouter } from "@/components/dynamic/DynamicRouter";
import CRMRoutes from "./CRMRoutes";
import CreatorRoutes from "./CreatorRoutes";
import ArtisanRoutes from "./ArtisanRoutes";
import ManufacturerRoutes from "./ManufacturerRoutes";
import { AdminRoutes } from "./AdminRoutes";

// Lazy load components for better performance
const CreatorProfile = lazy(() => import("@/pages/CreatorProfile"));
const ImageDetail = lazy(() => import("@/pages/ImageDetail"));
const OrderTracking = lazy(() => import("@/pages/OrderTracking"));
const MakerDetail = lazy(() => import("@/pages/MakerDetail"));

// Commonly accessed pages that should be preloaded
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Products = lazy(() => import("@/pages/Products"));
const Earnings = lazy(() => import("@/pages/Earnings"));
const SystemMonitoring = lazy(() => import("@/pages/SystemMonitoring"));
const UserActivity = lazy(() => import("@/pages/UserActivity"));
const Performance = lazy(() => import("@/pages/Performance"));
const AdvancedAnalytics = lazy(() => import("@/pages/AdvancedAnalytics"));
const PerformanceDashboard = lazy(() => import("@/pages/PerformanceDashboard"));

export const AppRoutes = () => {
  return (
    <EnhancedErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* High-priority routes - most commonly accessed */}
          <Route path="/dashboard" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          
          <Route path="/products" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          
          <Route path="/earnings" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <Earnings />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />

          {/* Admin routes */}
          <Route path="/admin/*" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <AdminRoutes />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          
          <Route path="/system-monitoring" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <SystemMonitoring />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          
          <Route path="/user-activity" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <UserActivity />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          
          <Route path="/performance" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <Performance />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          
          <Route path="/performance-dashboard" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <PerformanceDashboard />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />
          
          <Route path="/advanced-analytics" element={
            <EnhancedErrorBoundary>
              <ProtectedRoute>
                <AdvancedAnalytics />
              </ProtectedRoute>
            </EnhancedErrorBoundary>
          } />

          {/* Nested role-specific routes */}
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
          
          {/* Deep linking routes for specific resources */}
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
          
          {/* Dynamic Router handles all other routes including:
              - Public pages (/marketplace, /features, /faq, etc.)
              - Authentication pages (/auth, /reset-password)
              - Dynamic content pages from database
              - 404 Not Found fallback
          */}
          <Route path="*" element={<DynamicRouter />} />
        </Routes>
      </Suspense>
    </EnhancedErrorBoundary>
  );
};