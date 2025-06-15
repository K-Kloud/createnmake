
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from "@/context/NotificationContext";
import { CartProvider } from "@/contexts/CartContext";
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 404s or auth errors
        if (error?.status === 404 || error?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <NotificationProvider>
              <CartProvider>
                {children}
                <Toaster />
              </CartProvider>
            </NotificationProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
};
