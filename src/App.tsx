
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from "react-error-boundary";

// Pages
import Index from "@/pages/Index";
import Features from "@/pages/Features";
import Testimonials from "@/pages/Testimonials";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Create from "@/pages/Create";
import Design from "@/pages/Design";
import Dashboard from "@/pages/Dashboard";
import Designs from "@/pages/Designs";
import Marketplace from "@/pages/Marketplace";
import Orders from "@/pages/Orders";
import MakerDetail from "@/pages/MakerDetail";
import Admin from "@/pages/Admin";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import AuthCallback from "@/pages/AuthCallback";
import Auth from "@/pages/Auth";
import Subscription from "@/pages/Subscription";
import SubscriptionSuccess from "@/pages/subscription/Success";
import SubscriptionCancel from "@/pages/subscription/Cancel";

// Components
import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import { ErrorFallback } from "./components/ErrorFallback";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Helmet>
          <title>Fashionify - AI Fashion & Furniture Design Generator</title>
          <meta
            name="description"
            content="Create stunning fashion designs, furniture concepts, and more with AI. Turn your ideas into beautiful renderings instantly."
          />
        </Helmet>
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/features" element={<Features />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/marketplace" element={<Marketplace />} />

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
                
                {/* Admin Routes with extra protection */}
                <Route path="/admin/*" element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } />

                {/* CRM Routes */}
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

                {/* Creator Routes */}
                <Route path="/creator/*" element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="/" element={<CreatorDashboardPage />} />
                      <Route path="/onboarding" element={<CreatorOnboardingPage />} />
                    </Routes>
                  </ProtectedRoute>
                } />

                {/* Artisan Routes */}
                <Route path="/artisan/*" element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="/" element={<Artisan />} />
                      <Route path="/onboarding" element={<ArtisanOnboarding />} />
                    </Routes>
                  </ProtectedRoute>
                } />

                {/* Manufacturer Routes */}
                <Route path="/manufacturer/*" element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="/" element={<Manufacturer />} />
                      <Route path="/onboarding" element={<ManufacturerOnboarding />} />
                    </Routes>
                  </ProtectedRoute>
                } />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Import these components after the App function to avoid hoisting issues
import CRMDashboard from "./pages/CRMDashboard";
import CRMContacts from "./pages/CRMContacts";
import CRMTasks from "./pages/CRMTasks";
import CRMAnalytics from "./pages/CRMAnalytics";
import CRMCalendar from "./pages/CRMCalendar";
import CRMCommunications from "./pages/CRMCommunications";
import CreatorDashboardPage from "./pages/CreatorDashboardPage";
import CreatorOnboardingPage from "./pages/CreatorOnboardingPage";
import Artisan from "./pages/Artisan";
import ArtisanOnboarding from "./pages/ArtisanOnboarding";
import Manufacturer from "./pages/Manufacturer";
import ManufacturerOnboarding from "./pages/ManufacturerOnboarding";

export default App;
