
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from "@/components/ErrorFallback"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { AnalyticsProvider } from "@/providers/AnalyticsProvider"
import { NotificationProvider } from "@/providers/NotificationProvider"
import { CartProvider } from "@/providers/CartProvider"
import { RealtimeNotificationProvider } from "@/components/notifications/RealtimeNotificationProvider"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <BrowserRouter>
          <CartProvider>
            <RealtimeNotificationProvider>
              <NotificationProvider>
                <AnalyticsProvider>
                  <ErrorBoundary
                    FallbackComponent={ErrorFallback}
                    onError={(error, errorInfo) => {
                      console.error('Error caught by boundary:', error, errorInfo);
                    }}
                  >
                    {children}
                  </ErrorBoundary>
                </AnalyticsProvider>
              </NotificationProvider>
            </RealtimeNotificationProvider>
          </CartProvider>
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
