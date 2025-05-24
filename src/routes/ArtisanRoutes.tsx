
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Artisan from "@/pages/Artisan";
import ArtisanOnboarding from "@/pages/ArtisanOnboarding";

const ArtisanRoutes = () => {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<Artisan />} />
        <Route path="/onboarding" element={<ArtisanOnboarding />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default ArtisanRoutes;
