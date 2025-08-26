
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Artisan from "@/pages/Artisan";
import ArtisanOnboarding from "@/pages/ArtisanOnboarding";
import ArtisanOrders from "@/pages/ArtisanOrders";

const ArtisanRoutes = () => {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<Artisan />} />
        <Route path="/onboarding" element={<ArtisanOnboarding />} />
        <Route path="/orders" element={<ArtisanOrders />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default ArtisanRoutes;
