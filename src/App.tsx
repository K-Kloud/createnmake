
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";

import Index from "@/pages/Index";
import Marketplace from "@/pages/Marketplace";
import Create from "@/pages/Create";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Features from "@/pages/Features";
import Testimonials from "@/pages/Testimonials";
import Manufacturer from "@/pages/Manufacturer";
import Artisan from "@/pages/Artisan";
import Admin from "@/pages/Admin";
import CRMDashboard from "@/pages/CRMDashboard";
import ArtisanOnboarding from "@/pages/ArtisanOnboarding";
import ManufacturerOnboarding from "@/pages/ManufacturerOnboarding";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/create" element={<Create />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/features" element={<Features />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/manufacturer" element={<Manufacturer />} />
            <Route path="/artisan" element={<Artisan />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/crm" element={<CRMDashboard />} />
            <Route path="/artisan-onboarding" element={<ArtisanOnboarding />} />
            <Route path="/manufacturer-onboarding" element={<ManufacturerOnboarding />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
