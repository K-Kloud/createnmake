
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import CRMDashboard from "@/pages/CRMDashboard";
import CRMContacts from "@/pages/CRMContacts";
import CRMTasks from "@/pages/CRMTasks";
import CRMAnalytics from "@/pages/CRMAnalytics";
import CRMCalendar from "@/pages/CRMCalendar";
import CRMCommunications from "@/pages/CRMCommunications";

const CRMRoutes = () => {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<CRMDashboard />} />
        <Route path="/contacts" element={<CRMContacts />} />
        <Route path="/tasks" element={<CRMTasks />} />
        <Route path="/analytics" element={<CRMAnalytics />} />
        <Route path="/calendar" element={<CRMCalendar />} />
        <Route path="/communications" element={<CRMCommunications />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default CRMRoutes;
