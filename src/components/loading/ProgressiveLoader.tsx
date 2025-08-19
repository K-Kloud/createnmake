// Phase 3: Progressive Loading Component with timeout and retry
import React, { Suspense, useState, useEffect, ReactNode } from 'react';
import { LoadingFallback } from '@/components/LoadingFallback';
import { UnifiedErrorBoundary } from '@/components/error/UnifiedErrorBoundary';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ProgressiveLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  timeout?: number; // in milliseconds
  retryAttempts?: number;
  preload?: boolean;
}

interface LoadingState {
  isLoading: boolean;
  hasTimedOut: boolean;
  attempts: number;
  error: Error | null;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  fallback,
  componentName = 'Component',
  timeout = 10000, // 10 seconds default
  retryAttempts = 3,
  preload = false
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    hasTimedOut: false,
    attempts: 0,
    error: null
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (loadingState.isLoading && !loadingState.hasTimedOut) {
      console.log(`⏱️ [PROGRESSIVE LOADER] Starting timeout for ${componentName}: ${timeout}ms`);
      
      timeoutId = setTimeout(() => {
        console.warn(`⏰ [PROGRESSIVE LOADER] Timeout reached for ${componentName}`);
        setLoadingState(prev => ({
          ...prev,
          hasTimedOut: true,
          isLoading: false
        }));
      }, timeout);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loadingState.isLoading, loadingState.hasTimedOut, componentName, timeout]);

  const handleRetry = () => {
    if (loadingState.attempts < retryAttempts) {
      console.log(`🔄 [PROGRESSIVE LOADER] Retry attempt ${loadingState.attempts + 1}/${retryAttempts} for ${componentName}`);
      setLoadingState(prev => ({
        isLoading: true,
        hasTimedOut: false,
        attempts: prev.attempts + 1,
        error: null
      }));
    } else {
      console.error(`❌ [PROGRESSIVE LOADER] Max retry attempts reached for ${componentName}`);
    }
  };

  const handleComponentLoaded = () => {
    console.log(`✅ [PROGRESSIVE LOADER] Component loaded successfully: ${componentName}`);
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      hasTimedOut: false
    }));
  };

  // Timeout fallback UI
  if (loadingState.hasTimedOut) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-medium text-sm">Loading Taking Longer Than Expected</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {componentName} is taking longer to load than usual.
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
              Try Again ({loadingState.attempts + 1}/{retryAttempts})
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground">
              Please refresh the page if the problem persists
            </div>
          )}
        </div>
      </div>
    );
  }

  const LoadingComponent = fallback || (
    <LoadingFallback 
      message={`Loading ${componentName}...`}
      className="flex min-h-[200px] items-center justify-center"
    />
  );

  return (
    <UnifiedErrorBoundary componentName={componentName} errorType="component">
      <Suspense 
        fallback={LoadingComponent}
      >
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
    // Call onLoad after component mounts and renders
    const timer = setTimeout(onLoad, 100);
    return () => clearTimeout(timer);
  }, [onLoad]);

  return <>{children}</>;
};