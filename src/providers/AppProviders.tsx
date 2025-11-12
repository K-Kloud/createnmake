
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from "@/components/ErrorFallback"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { AnalyticsProvider } from "@/providers/AnalyticsProvider"
import { CartProvider } from "@/providers/CartProvider"
import { RealtimeNotificationProvider } from "@/components/notifications/RealtimeNotificationProvider"
import { EnhancementStatusPanel, PWAInstallPrompt } from "@/components/enhancement/ProgressiveEnhancement"
import { OnboardingTracker } from "@/components/onboarding/OnboardingTracker"
import { AuthProvider } from "@/hooks/useAuth"

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
          <AuthProvider>
            <OnboardingTracker />
            <CartProvider>
              <RealtimeNotificationProvider>
              <AnalyticsProvider>
                <ErrorBoundary
                  FallbackComponent={ErrorFallback}
                  onError={(error, errorInfo) => {
                    console.error('Error caught by boundary:', error, errorInfo);
                  }}
                >
                  <div className="relative">
                    {children}
                    
                    {/* Progressive enhancement components */}
                    <div className="fixed bottom-4 right-4 space-y-2 z-50">
                      <PWAInstallPrompt />
                    </div>
                    
                    {/* Development status panel - only show in dev mode */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="fixed bottom-4 left-4 z-50">
                        <EnhancementStatusPanel />
                      </div>
                    )}
                  </div>
                </ErrorBoundary>
              </AnalyticsProvider>
            </RealtimeNotificationProvider>
          </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
