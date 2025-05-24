
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from "react-router-dom";
import { Helmet } from "react-helmet";

import { ThemeProvider } from "@/components/theme-provider";
import { ErrorFallback } from "@/components/ErrorFallback";
import { Toaster } from "@/components/ui/toaster";
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

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
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
                {children}
                <Toaster />
              </ErrorBoundary>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
