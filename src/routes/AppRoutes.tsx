
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import CRMRoutes from "./CRMRoutes";
import CreatorRoutes from "./CreatorRoutes";
import ArtisanRoutes from "./ArtisanRoutes";
import ManufacturerRoutes from "./ManufacturerRoutes";

// Lazy load components
const Index = lazy(() => import("@/pages/Index"));
const Create = lazy(() => import("@/pages/Create"));
const Designs = lazy(() => import("@/pages/Designs"));
const DesignDetail = lazy(() => import("@/pages/DesignDetail"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Settings = lazy(() => import("@/pages/Settings"));
const Auth = lazy(() => import("@/pages/Auth"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Admin = lazy(() => import("@/pages/Admin"));
const Contact = lazy(() => import("@/pages/Contact"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Features = lazy(() => import("@/pages/Features"));
const Testimonials = lazy(() => import("@/pages/Testimonials"));
const JoinUs = lazy(() => import("@/pages/JoinUs"));
const JoinArtisan = lazy(() => import("@/pages/JoinArtisan"));
const JoinManufacturer = lazy(() => import("@/pages/JoinManufacturer"));
const ArtisanOnboarding = lazy(() => import("@/pages/ArtisanOnboarding"));
const ManufacturerOnboarding = lazy(() => import("@/pages/ManufacturerOnboarding"));
const CreatorOnboardingPage = lazy(() => import("@/pages/CreatorOnboardingPage"));
const CreatorDashboardPage = lazy(() => import("@/pages/CreatorDashboardPage"));
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
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/create" element={<Create />} />
        <Route path="/designs" element={<Designs />} />
        <Route path="/designs/:id" element={
          <ProtectedRoute>
            <DesignDetail />
          </ProtectedRoute>
        } />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/features" element={<Features />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/join" element={<JoinUs />} />
        <Route path="/join/artisan" element={<JoinArtisan />} />
        <Route path="/join/manufacturer" element={<JoinManufacturer />} />
        <Route path="/artisan/onboarding" element={<ArtisanOnboarding />} />
        <Route path="/manufacturer/onboarding" element={<ManufacturerOnboarding />} />
        <Route path="/creator/onboarding" element={<CreatorOnboardingPage />} />
        <Route path="/creator/dashboard" element={<CreatorDashboardPage />} />
        <Route path="/maker/:id" element={<MakerDetail />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/subscription/success" element={<Success />} />
        <Route path="/subscription/cancel" element={<Cancel />} />
        <Route path="/integrations" element={
          <ProtectedRoute>
            <Integrations />
          </ProtectedRoute>
        } />
        <Route path="/system-monitoring" element={
          <ProtectedRoute>
            <SystemMonitoring />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        
        {/* Nested routes */}
        <Route path="/crm/*" element={<CRMRoutes />} />
        <Route path="/creator/*" element={<CreatorRoutes />} />
        <Route path="/artisan/*" element={<ArtisanRoutes />}/>
        <Route path="/manufacturer/*" element={<ManufacturerRoutes />}/>
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
