
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public Pages
import Index from "@/pages/Index";
import Features from "@/pages/Features";
import Testimonials from "@/pages/Testimonials";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import AuthCallback from "@/pages/AuthCallback";
import Marketplace from "@/pages/Marketplace";
import NotFound from "@/pages/NotFound";
import JoinManufacturer from "@/pages/JoinManufacturer";
import JoinArtisan from "@/pages/JoinArtisan";

// Protected Pages
import Create from "@/pages/Create";
import Design from "@/pages/Design";
import Dashboard from "@/pages/Dashboard";
import Designs from "@/pages/Designs";
import Orders from "@/pages/Orders";
import MakerDetail from "@/pages/MakerDetail";
import Admin from "@/pages/Admin";
import Settings from "@/pages/Settings";
import Subscription from "@/pages/Subscription";
import SubscriptionSuccess from "@/pages/subscription/Success";
import SubscriptionCancel from "@/pages/subscription/Cancel";
import Notifications from "@/pages/Notifications";

// Role-specific Pages
import CRMRoutes from "./CRMRoutes";
import CreatorRoutes from "./CreatorRoutes";
import ArtisanRoutes from "./ArtisanRoutes";
import ManufacturerRoutes from "./ManufacturerRoutes";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/features" element={<Features />} />
      <Route path="/testimonials" element={<Testimonials />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/join/manufacturer" element={<JoinManufacturer />} />
      <Route path="/join/artisan" element={<JoinArtisan />} />

      {/* Protected Routes */}
      <Route path="/create" element={
        <ProtectedRoute>
          <Create />
        </ProtectedRoute>
      } />
      <Route path="/design/:id" element={
        <ProtectedRoute>
          <Design />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/designs" element={
        <ProtectedRoute>
          <Designs />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/maker/:id" element={
        <ProtectedRoute>
          <MakerDetail />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/subscription" element={
        <ProtectedRoute>
          <Subscription />
        </ProtectedRoute>
      } />
      <Route path="/subscription/success" element={
        <ProtectedRoute>
          <SubscriptionSuccess />
        </ProtectedRoute>
      } />
      <Route path="/subscription/cancel" element={
        <ProtectedRoute>
          <SubscriptionCancel />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      } />

      {/* Role-specific Route Groups */}
      <Route path="/crm/*" element={<CRMRoutes />} />
      <Route path="/creator/*" element={<CreatorRoutes />} />
      <Route path="/artisan/*" element={<ArtisanRoutes />} />
      <Route path="/manufacturer/*" element={<ManufacturerRoutes />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
