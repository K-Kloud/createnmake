import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Designs from "./pages/Designs";
import DesignDetail from "./pages/DesignDetail";
import Generator from "./pages/Generator";
import Auth from "./pages/Auth";
import Marketplace from "./pages/Marketplace";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <EnhancedErrorBoundary>
            <Toaster />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/designs" element={<Designs />} />
              <Route path="/designs/:id" element={<DesignDetail />} />
              <Route path="/create" element={<Generator />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/marketplace" element={<Marketplace />} />
            </Routes>
          </EnhancedErrorBoundary>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
