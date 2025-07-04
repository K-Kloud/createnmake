
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DynamicRouter } from "@/components/dynamic/DynamicRouter";
import CRMRoutes from "./CRMRoutes";
import CreatorRoutes from "./CreatorRoutes";
import ArtisanRoutes from "./ArtisanRoutes";
import ManufacturerRoutes from "./ManufacturerRoutes";
import { AdminRoutes } from "./AdminRoutes";

// Lazy load components
const Index = lazy(() => import("@/pages/Index"));
const Create = lazy(() => import("@/pages/Create"));
const Design = lazy(() => import("@/pages/Design"));
const Designs = lazy(() => import("@/pages/Designs"));
const Products = lazy(() => import("@/pages/Products"));
const Earnings = lazy(() => import("@/pages/Earnings"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Settings = lazy(() => import("@/pages/Settings"));
const Auth = lazy(() => import("@/pages/Auth"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Contact = lazy(() => import("@/pages/Contact"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Features = lazy(() => import("@/pages/Features"));
const Testimonials = lazy(() => import("@/pages/Testimonials"));
const JoinUs = lazy(() => import("@/pages/JoinUs"));
const JoinArtisan = lazy(() => import("@/pages/JoinArtisan"));
const JoinManufacturer = lazy(() => import("@/pages/JoinManufacturer"));
const ArtisanOnboarding = lazy(() => import("@/pages/ArtisanOnboarding"));
const ManufacturerOnboarding = lazy(() => import("@/pages/ManufacturerOnboarding"));
const MakerDetail = lazy(() => import("@/pages/MakerDetail"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const Success = lazy(() => import("@/pages/subscription/Success"));
const Cancel = lazy(() => import("@/pages/subscription/Cancel"));
const Integrations = lazy(() => import("@/pages/Integrations"));
const SystemMonitoring = lazy(() => import("@/pages/SystemMonitoring"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Orders = lazy(() => import("@/pages/Orders"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {/* Use Dynamic Router for database-driven routing */}
      <DynamicRouter />
      
      {/* Keep specialized nested routes */}
      <Routes>
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminRoutes />
          </ProtectedRoute>
        } />
        <Route path="/crm/*" element={<CRMRoutes />} />
        <Route path="/creator/*" element={<CreatorRoutes />} />
        <Route path="/artisan/*" element={<ArtisanRoutes />}/>
        <Route path="/manufacturer/*" element={<ManufacturerRoutes />}/>
      </Routes>
    </Suspense>
  );
};
