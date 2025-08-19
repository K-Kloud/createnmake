import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface NavigationErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const NavigationErrorFallback: React.FC<NavigationErrorFallbackProps> = ({
  error,
  resetErrorBoundary
}) => {
  return (
    <div className="flex items-center justify-center p-4 border border-destructive/20 rounded-lg bg-destructive/5">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">Navigation Error</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs">
          Failed to load navigation menu. Please try again.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={resetErrorBoundary}
          className="h-8 px-3"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      </div>
    </div>
  );
};

interface NavigationErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<NavigationErrorFallbackProps>;
}

export const NavigationErrorBoundary: React.FC<NavigationErrorBoundaryProps> = ({
  children,
  fallback
}) => {
  const { handleError } = useErrorHandler();

  const FallbackComponent = fallback || NavigationErrorFallback;

  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={(error, errorInfo) => {
        handleError(error, 'Navigation component error');
      }}
      onReset={() => {
        // Optionally reload the page or reset specific state
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};