
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// CRM Pages
import CRMDashboard from "@/pages/CRMDashboard";
import CRMContacts from "@/pages/CRMContacts";
import CRMTasks from "@/pages/CRMTasks";
import CRMAnalytics from "@/pages/CRMAnalytics";
import CRMCalendar from "@/pages/CRMCalendar";
import CRMCommunications from "@/pages/CRMCommunications";

// Creator Pages
import CreatorDashboardPage from "@/pages/CreatorDashboardPage";
import CreatorOnboardingPage from "@/pages/CreatorOnboardingPage";

// Artisan Pages
import Artisan from "@/pages/Artisan";
import ArtisanOnboarding from "@/pages/ArtisanOnboarding";

// Manufacturer Pages
import Manufacturer from "@/pages/Manufacturer";
import ManufacturerOnboarding from "@/pages/ManufacturerOnboarding";

export const CRMRoutes = () => {
  return (
    <Route path="/crm/*" element={
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
    } />
  );
};

export const CreatorRoutes = () => {
  return (
    <Route path="/creator/*" element={
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<CreatorDashboardPage />} />
          <Route path="/onboarding" element={<CreatorOnboardingPage />} />
        </Routes>
      </ProtectedRoute>
    } />
  );
};

export const ArtisanRoutes = () => {
  return (
    <Route path="/artisan/*" element={
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<Artisan />} />
          <Route path="/onboarding" element={<ArtisanOnboarding />} />
        </Routes>
      </ProtectedRoute>
    } />
  );
};

export const ManufacturerRoutes = () => {
  return (
    <Route path="/manufacturer/*" element={
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<Manufacturer />} />
          <Route path="/onboarding" element={<ManufacturerOnboarding />} />
        </Routes>
      </ProtectedRoute>
    } />
  );
};
