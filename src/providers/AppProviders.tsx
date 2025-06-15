
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { PerformanceTracker } from "@/components/analytics/PerformanceTracker";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <CartProvider>
            <NotificationProvider>
              <AnalyticsProvider>
                <PerformanceTracker />
                {children}
                <Toaster />
                <Sonner />
              </AnalyticsProvider>
            </NotificationProvider>
          </CartProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};
