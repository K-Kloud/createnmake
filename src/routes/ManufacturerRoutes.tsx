
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load Manufacturer pages
const Manufacturer = lazy(() => import("@/pages/Manufacturer"));
const ManufacturerOnboarding = lazy(() => import("@/pages/ManufacturerOnboarding"));
const ManufacturerOrders = lazy(() => import("@/pages/ManufacturerOrders"));
const ManufacturerProfilePage = lazy(() => import("@/pages/ManufacturerProfilePage"));
const ManufacturerDirectoryPage = lazy(() => import("@/pages/ManufacturerDirectory"));

const ManufacturerRoutes = () => {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Manufacturer />} />
          <Route path="/directory" element={<ManufacturerDirectoryPage />} />
          <Route path="/onboarding" element={<ManufacturerOnboarding />} />
          <Route path="/orders" element={<ManufacturerOrders />} />
          <Route path="/profile" element={<ManufacturerProfilePage />} />
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
};

export default ManufacturerRoutes;
