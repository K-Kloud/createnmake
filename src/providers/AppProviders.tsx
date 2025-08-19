
import { ThemeProvider } from "@/components/theme-provider"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { AnalyticsProvider } from "@/providers/AnalyticsProvider"
import { CartProvider } from "@/providers/CartProvider"
import { RealtimeNotificationProvider } from "@/components/notifications/RealtimeNotificationProvider"
import { EnhancementStatusPanel, PWAInstallPrompt } from "@/components/enhancement/ProgressiveEnhancement"
import { RouteDebugger } from "@/components/routing/RouteDebugger";
import { SystemHealthMonitor } from "@/components/monitoring/SystemHealthMonitor";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
// Phase 3: Use unified error boundary instead of multiple boundaries
import { UnifiedErrorBoundary } from "@/components/error/UnifiedErrorBoundary";
// Phase 4: Add asset loading provider
import { AssetLoadingProvider } from "@/providers/AssetLoadingProvider";
// Phase 5: Add performance monitoring provider  
import { PerformanceMonitoringProvider } from "@/providers/PerformanceMonitoringProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  console.log('🔧 [PROVIDERS] AppProviders initializing...');
  
  return (
    <QueryClientProvider client={queryClient}>
      {/* Phase 5: Add performance monitoring provider */}
      <PerformanceMonitoringProvider>
        {/* Phase 4: Wrap with asset loading provider to handle CSS and asset loading */}
        <AssetLoadingProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <BrowserRouter>
            <CartProvider>
              <RealtimeNotificationProvider>
                <AnalyticsProvider>
                {/* Phase 3: Use unified error boundary for better error handling */}
                <UnifiedErrorBoundary 
                  componentName="AppProviders"
                  errorType="critical"
                >
                  <div className="relative">
                    {children}
                    
                    {/* System monitoring components */}
                    <SystemHealthMonitor />
                    <RouteDebugger />
                    
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
                    
                    {/* Toast notifications */}
                    <Toaster />
                    <Sonner />
                  </div>
                </UnifiedErrorBoundary>
              </AnalyticsProvider>
            </RealtimeNotificationProvider>
          </CartProvider>
        </BrowserRouter>
      </ThemeProvider>
        </AssetLoadingProvider>
      </PerformanceMonitoringProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
