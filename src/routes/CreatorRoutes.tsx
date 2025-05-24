
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import CreatorDashboardPage from "@/pages/CreatorDashboardPage";
import CreatorOnboardingPage from "@/pages/CreatorOnboardingPage";

const CreatorRoutes = () => {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<CreatorDashboardPage />} />
        <Route path="/onboarding" element={<CreatorOnboardingPage />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default CreatorRoutes;
