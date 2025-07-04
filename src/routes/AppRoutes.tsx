
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DynamicRouter } from "@/components/dynamic/DynamicRouter";
import CRMRoutes from "./CRMRoutes";
import CreatorRoutes from "./CreatorRoutes";
import ArtisanRoutes from "./ArtisanRoutes";
import ManufacturerRoutes from "./ManufacturerRoutes";
import { AdminRoutes } from "./AdminRoutes";

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
        
        {/* Dynamic Router handles all other routes */}
        <Route path="*" element={<DynamicRouter />} />
      </Routes>
    </Suspense>
  );
};
