
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load Artisan pages
const Artisan = lazy(() => import("@/pages/Artisan"));
const ArtisanOnboarding = lazy(() => import("@/pages/ArtisanOnboarding"));
const ArtisanOrders = lazy(() => import("@/pages/ArtisanOrders"));
const ArtisanProfile = lazy(() => import("@/components/artisan/ArtisanProfile").then(module => ({ default: module.ArtisanProfile })));

const ArtisanRoutes = () => {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Artisan />} />
          <Route path="/dashboard" element={<Artisan />} />
          <Route path="/onboarding" element={<ArtisanOnboarding />} />
          <Route path="/orders" element={<ArtisanOrders />} />
          <Route path="/profile" element={<ArtisanProfile />} />
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
};

export default ArtisanRoutes;
