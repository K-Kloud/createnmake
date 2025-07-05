
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DynamicRouter } from "@/components/dynamic/DynamicRouter";
import CRMRoutes from "./CRMRoutes";
import CreatorRoutes from "./CreatorRoutes";
import ArtisanRoutes from "./ArtisanRoutes";
import ManufacturerRoutes from "./ManufacturerRoutes";
import { AdminRoutes } from "./AdminRoutes";

const CreatorProfile = lazy(() => import("@/pages/CreatorProfile"));
const ImageDetail = lazy(() => import("@/pages/ImageDetail"));
const OrderTracking = lazy(() => import("@/pages/OrderTracking"));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Nested routes that should override dynamic routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminRoutes />
          </ProtectedRoute>
        } />
        <Route path="/crm/*" element={<CRMRoutes />} />
        <Route path="/creator/*" element={<CreatorRoutes />} />
        <Route path="/artisan/*" element={<ArtisanRoutes />}/>
        <Route path="/manufacturer/*" element={<ManufacturerRoutes />}/>
        
        {/* Deep linking routes */}
        <Route path="/creator/:id" element={<CreatorProfile />} />
        <Route path="/image/:id" element={<ImageDetail />} />
        <Route path="/order/:id" element={<OrderTracking />} />
        
        {/* Dynamic Router handles all other routes */}
        <Route path="*" element={<DynamicRouter />} />
      </Routes>
    </Suspense>
  );
};
