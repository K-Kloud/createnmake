
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Helmet } from "react-helmet";

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
import Subscription from "@/pages/Subscription";
import SubscriptionSuccess from "@/pages/subscription/Success";
import SubscriptionCancel from "@/pages/subscription/Cancel";

// Components
import "./App.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider";
import { ErrorBoundary } from "./components/ErrorBoundary";

// CRM Pages
import CRMDashboard from "./pages/CRMDashboard";
import CRMContacts from "./pages/CRMContacts";
import CRMTasks from "./pages/CRMTasks";
import CRMAnalytics from "./pages/CRMAnalytics";
import CRMCalendar from "./pages/CRMCalendar";
import CRMCommunications from "./pages/CRMCommunications";

// Creator Pages
import CreatorDashboardPage from "./pages/CreatorDashboardPage";
import CreatorOnboardingPage from "./pages/CreatorOnboardingPage";

// Artisan Pages
import Artisan from "./pages/Artisan";
import ArtisanOnboarding from "./pages/ArtisanOnboarding";

// Manufacturer Pages
import Manufacturer from "./pages/Manufacturer";
import ManufacturerOnboarding from "./pages/ManufacturerOnboarding";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Helmet>
        <title>Fashionify - AI Fashion & Furniture Design Generator</title>
        <meta
          name="description"
          content="Create stunning fashion designs, furniture concepts, and more with AI. Turn your ideas into beautiful renderings instantly."
        />
      </Helmet>
      <BrowserRouter>
        <ErrorBoundary>
          <div className="flex flex-col min-h-[100dvh]">
            <Header />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/features" element={<Features />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/create" element={<Create />} />
                <Route path="/design/:id" element={<Design />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/designs" element={<Designs />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/maker/:id" element={<MakerDetail />} />
                <Route path="/admin/*" element={<Admin />} />
                <Route path="/settings" element={<Settings />} />

                {/* New Subscription Routes */}
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/subscription/success" element={<SubscriptionSuccess />} />
                <Route path="/subscription/cancel" element={<SubscriptionCancel />} />

                {/* Auth Callback */}
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* CRM Routes */}
                <Route path="/crm" element={<CRMDashboard />} />
                <Route path="/crm/contacts" element={<CRMContacts />} />
                <Route path="/crm/tasks" element={<CRMTasks />} />
                <Route path="/crm/analytics" element={<CRMAnalytics />} />
                <Route path="/crm/calendar" element={<CRMCalendar />} />
                <Route path="/crm/communications" element={<CRMCommunications />} />

                {/* Creator Routes */}
                <Route path="/creator" element={<CreatorDashboardPage />} />
                <Route path="/creator/onboarding" element={<CreatorOnboardingPage />} />

                {/* Artisan Routes */}
                <Route path="/artisan" element={<Artisan />} />
                <Route path="/artisan/onboarding" element={<ArtisanOnboarding />} />

                {/* Manufacturer Routes */}
                <Route path="/manufacturer" element={<Manufacturer />} />
                <Route path="/manufacturer/onboarding" element={<ManufacturerOnboarding />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
            <Toaster />
          </div>
        </ErrorBoundary>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </ThemeProvider>
  );
}

export default App;
