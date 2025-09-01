
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load CRM pages
const CRMDashboard = lazy(() => import("@/pages/CRMDashboard"));
const CRMContacts = lazy(() => import("@/pages/CRMContacts"));
const CRMTasks = lazy(() => import("@/pages/CRMTasks"));
const CRMAnalytics = lazy(() => import("@/pages/CRMAnalytics"));
const CRMCalendar = lazy(() => import("@/pages/CRMCalendar"));
const CRMCommunications = lazy(() => import("@/pages/CRMCommunications"));

const CRMRoutes = () => {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<CRMDashboard />} />
          <Route path="/contacts" element={<CRMContacts />} />
          <Route path="/tasks" element={<CRMTasks />} />
          <Route path="/analytics" element={<CRMAnalytics />} />
          <Route path="/calendar" element={<CRMCalendar />} />
          <Route path="/communications" element={<CRMCommunications />} />
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
};

export default CRMRoutes;
