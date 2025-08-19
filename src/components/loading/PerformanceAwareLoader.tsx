// Phase 5: Performance-aware component loader that integrates monitoring
import React, { Suspense, useState, useEffect, ReactNode } from 'react';
import { LoadingFallback } from '@/components/LoadingFallback';
import { UnifiedErrorBoundary } from '@/components/error/UnifiedErrorBoundary';
import { usePerformanceMonitoringContext } from '@/providers/PerformanceMonitoringProvider';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Activity } from 'lucide-react';

interface PerformanceAwareLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  timeout?: number;
  retryAttempts?: number;
  performanceThreshold?: number; // in milliseconds
  showPerformanceWarning?: boolean;
}

interface LoadingState {
  isLoading: boolean;
  hasTimedOut: boolean;
  attempts: number;
  error: Error | null;
  startTime: number;
  isSlowLoading: boolean;
}

export const PerformanceAwareLoader: React.FC<PerformanceAwareLoaderProps> = ({
  children,
  fallback,
  componentName = 'Component',
  timeout = 10000,
  retryAttempts = 3,
  performanceThreshold = 3000, // 3 seconds
  showPerformanceWarning = true
}) => {
  const { trackComponentMount, createLoadingTimer } = usePerformanceMonitoringContext();
  
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    hasTimedOut: false,
    attempts: 0,
    error: null,
    startTime: performance.now(),
    isSlowLoading: false
  });

  useEffect(() => {
    const timer = createLoadingTimer(`performance_aware_${componentName}`);
    let timeoutId: NodeJS.Timeout;
    let slowLoadingId: NodeJS.Timeout;

    if (loadingState.isLoading && !loadingState.hasTimedOut) {
      // Set timeout for loading
      timeoutId = setTimeout(() => {
        setLoadingState(prev => ({
          ...prev,
          hasTimedOut: true,
          isLoading: false
        }));
        timer.complete(false, 'Loading timeout');
      }, timeout);

      // Set warning for slow loading
      if (showPerformanceWarning) {
        slowLoadingId = setTimeout(() => {
          setLoadingState(prev => ({
            ...prev,
            isSlowLoading: true
          }));
        }, performanceThreshold);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (slowLoadingId) clearTimeout(slowLoadingId);
    };
  }, [loadingState.isLoading, loadingState.hasTimedOut, componentName, timeout, performanceThreshold, showPerformanceWarning, createLoadingTimer]);

  const handleRetry = () => {
    if (loadingState.attempts < retryAttempts) {
      setLoadingState({
        isLoading: true,
        hasTimedOut: false,
        attempts: loadingState.attempts + 1,
        error: null,
        startTime: performance.now(),
        isSlowLoading: false
      });
    }
  };

  const handleComponentLoaded = async () => {
    const loadTime = performance.now() - loadingState.startTime;
    
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      hasTimedOut: false
    }));

    // Track performance
    await trackComponentMount(componentName, loadTime);
    
    // Log performance warning if needed
    if (loadTime > performanceThreshold) {
      console.warn(`🐌 [PERFORMANCE] ${componentName} took ${loadTime.toFixed(2)}ms to load (threshold: ${performanceThreshold}ms)`);
    } else {
      console.log(`⚡ [PERFORMANCE] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    }
  };

  // Timeout fallback UI
  if (loadingState.hasTimedOut) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <div>
            <h3 className="font-medium text-sm">Component Failed to Load</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {componentName} timed out after {timeout / 1000} seconds.
            </p>
          </div>
          {loadingState.attempts < retryAttempts ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRetry}
              className="mt-3"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry ({loadingState.attempts + 1}/{retryAttempts})
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground">
              Maximum retry attempts reached. Please refresh the page.
            </div>
          )}
        </div>
      </div>
    );
  }

  const LoadingComponent = fallback || (
    <div className="flex min-h-[200px] items-center justify-center flex-col space-y-2">
      <LoadingFallback 
        message={`Loading ${componentName}...`}
      />
      {loadingState.isSlowLoading && showPerformanceWarning && (
        <div className="flex items-center text-xs text-muted-foreground space-x-1">
          <Activity className="w-3 h-3" />
          <span>This component is loading slower than expected</span>
        </div>
      )}
      {loadingState.attempts > 0 && (
        <div className="text-xs text-muted-foreground">
          Retry attempt {loadingState.attempts + 1}
        </div>
      )}
    </div>
  );

  return (
    <UnifiedErrorBoundary componentName={componentName} errorType="component">
      <Suspense fallback={LoadingComponent}>
        <ComponentWrapper onLoad={handleComponentLoaded}>
          {children}
        </ComponentWrapper>
      </Suspense>
    </UnifiedErrorBoundary>
  );
};

// Helper component to detect when children have loaded
interface ComponentWrapperProps {
  children: ReactNode;
  onLoad: () => void;
}

const ComponentWrapper: React.FC<ComponentWrapperProps> = ({ children, onLoad }) => {
  useEffect(() => {
    const timer = setTimeout(onLoad, 50);
    return () => clearTimeout(timer);
  }, [onLoad]);

  return <>{children}</>;
};