
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load Creator pages
const CreatorDashboardPage = lazy(() => import("@/pages/CreatorDashboardPage"));
const CreatorOnboardingPage = lazy(() => import("@/pages/CreatorOnboardingPage"));

const CreatorRoutes = () => {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<CreatorDashboardPage />} />
          <Route path="/dashboard" element={<CreatorDashboardPage />} />
          <Route path="/onboarding" element={<CreatorOnboardingPage />} />
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
};

export default CreatorRoutes;
