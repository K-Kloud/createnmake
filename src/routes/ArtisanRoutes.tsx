
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Artisan from "@/pages/Artisan";
import ArtisanOnboarding from "@/pages/ArtisanOnboarding";
import ArtisanOrders from "@/pages/ArtisanOrders";
import { ArtisanProfile } from "@/components/artisan/ArtisanProfile";

const ArtisanRoutes = () => {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<Artisan />} />
        <Route path="/onboarding" element={<ArtisanOnboarding />} />
        <Route path="/orders" element={<ArtisanOrders />} />
        <Route path="/profile" element={<ArtisanProfile />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default ArtisanRoutes;
