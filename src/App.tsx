
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider"
import Index from "@/pages/Index";
import Features from "@/pages/Features";
import Testimonials from "@/pages/Testimonials";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import Create from "@/pages/Create";
import Marketplace from "@/pages/Marketplace";
import Admin from "@/pages/Admin";
import Settings from "@/pages/Settings";
import CRMDashboard from "@/pages/CRMDashboard";
import CRMContacts from "@/pages/CRMContacts";
import CRMTasks from "@/pages/CRMTasks";
import CRMCalendar from "@/pages/CRMCalendar";
import CRMAnalytics from "@/pages/CRMAnalytics";
import CRMCommunications from "@/pages/CRMCommunications";
import Artisan from "@/pages/Artisan";
import ArtisanOnboarding from "@/pages/ArtisanOnboarding";
import Manufacturer from "@/pages/Manufacturer";
import ManufacturerOnboarding from "@/pages/ManufacturerOnboarding";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster"
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import CreatorOnboardingPage from "@/pages/CreatorOnboardingPage";
import CreatorDashboardPage from "@/pages/CreatorDashboardPage";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="app">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Toaster />
            <RouterProvider
              router={createBrowserRouter([
                {
                  path: "/",
                  element: <Index />,
                },
                {
                  path: "/features",
                  element: <Features />,
                },
                {
                  path: "/testimonials",
                  element: <Testimonials />,
                },
                {
                  path: "/faq",
                  element: <FAQ />,
                },
                {
                  path: "/contact",
                  element: <Contact />,
                },
                {
                  path: "/auth/callback",
                  element: <AuthCallback />,
                },
                {
                  path: "/dashboard",
                  element: <Dashboard />,
                },
                {
                  path: "/create",
                  element: <Create />,
                },
                {
                  path: "/marketplace",
                  element: <Marketplace />,
                },
                {
                  path: "/admin",
                  element: <Admin />,
                },
                {
                  path: "/settings",
                  element: <Settings />,
                },
                {
                  path: "/crm",
                  element: <CRMDashboard />,
                },
                {
                  path: "/crm/contacts",
                  element: <CRMContacts />,
                },
                {
                  path: "/crm/tasks",
                  element: <CRMTasks />,
                },
                {
                  path: "/crm/calendar",
                  element: <CRMCalendar />,
                },
                {
                  path: "/crm/analytics",
                  element: <CRMAnalytics />,
                },
                {
                  path: "/crm/communications",
                  element: <CRMCommunications />,
                },
                {
                  path: "/artisan",
                  element: <Artisan />,
                },
                {
                  path: "/artisan/onboarding",
                  element: <ArtisanOnboarding />,
                },
                {
                  path: "/manufacturer",
                  element: <Manufacturer />,
                },
                {
                  path: "/manufacturer/onboarding",
                  element: <ManufacturerOnboarding />,
                },
                {
                  path: "/creator/onboarding",
                  element: <CreatorOnboardingPage />,
                },
                {
                  path: "/creator/dashboard",
                  element: <CreatorDashboardPage />,
                },
              ])}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
