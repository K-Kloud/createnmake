
import { BrowserRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from "react-error-boundary";

// Components
import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import { ErrorFallback } from "./components/ErrorFallback";
import { Toaster } from "./components/ui/toaster";
import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationProvider } from "@/context/NotificationContext";

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
            <NotificationProvider>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AppRoutes />
                <Toaster />
              </ErrorBoundary>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
