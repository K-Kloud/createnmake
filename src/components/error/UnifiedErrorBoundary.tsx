// Phase 3: Unified Error Boundary with different recovery strategies
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type ErrorType = 'component' | 'network' | 'translation' | 'critical';

interface UnifiedErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  errorType?: ErrorType;
  componentName?: string;
}

const getErrorTypeFromError = (error: Error): ErrorType => {
  if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
    return 'network';
  }
  if (error.message.includes('translation') || error.message.includes('i18n')) {
    return 'translation';
  }
  if (error.message.includes('Cannot read property') || error.message.includes('TypeError')) {
    return 'component';
  }
  return 'critical';
};

const getErrorConfig = (errorType: ErrorType, componentName?: string) => {
  switch (errorType) {
    case 'network':
      return {
        title: 'Network Error',
        description: 'Failed to load application resources. This might be due to a slow network connection.',
        actions: [
          { label: 'Retry Loading', action: 'retry', variant: 'default' as const },
          { label: 'Go Home', action: 'home', variant: 'outline' as const }
        ]
      };
    case 'translation':
      return {
        title: 'Translation Error',
        description: 'Failed to load language resources. The app will continue with default text.',
        actions: [
          { label: 'Continue Anyway', action: 'retry', variant: 'default' as const },
          { label: 'Reload Page', action: 'reload', variant: 'outline' as const }
        ]
      };
    case 'component':
      return {
        title: `Component Error${componentName ? ` in ${componentName}` : ''}`,
        description: 'A component failed to load properly. You can try refreshing or continue with other features.',
        actions: [
          { label: 'Try Again', action: 'retry', variant: 'default' as const },
          { label: 'Continue', action: 'home', variant: 'outline' as const }
        ]
      };
    default:
      return {
        title: 'Critical Error',
        description: 'A serious error occurred. Please refresh the page or contact support if the problem persists.',
        actions: [
          { label: 'Reload Page', action: 'reload', variant: 'default' as const },
          { label: 'Go Home', action: 'home', variant: 'outline' as const }
        ]
      };
  }
};

const UnifiedErrorFallback: React.FC<UnifiedErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary,
  errorType,
  componentName 
}) => {
  const detectedType = errorType || getErrorTypeFromError(error);
  const config = getErrorConfig(detectedType, componentName);

  const handleAction = (action: string) => {
    switch (action) {
      case 'retry':
        resetErrorBoundary();
        break;
      case 'reload':
        window.location.reload();
        break;
      case 'home':
        window.location.href = '/';
        break;
    }
  };

  console.error(`🚨 [ERROR BOUNDARY] ${detectedType} error in ${componentName || 'unknown component'}:`, error);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <CardTitle className="text-destructive">{config.title}</CardTitle>
          </div>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-sm text-muted-foreground cursor-pointer">Error Details</summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {error.message}
                {error.stack && `\n\nStack:\n${error.stack}`}
              </pre>
            </details>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 justify-end">
          {config.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={() => handleAction(action.action)}
              size="sm"
            >
              {action.action === 'retry' && <RefreshCw className="w-4 h-4 mr-1" />}
              {action.action === 'home' && <Home className="w-4 h-4 mr-1" />}
              {action.label}
            </Button>
          ))}
        </CardFooter>
      </Card>
    </div>
  );
};

interface UnifiedErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  errorType?: ErrorType;
  fallback?: React.ComponentType<UnifiedErrorFallbackProps>;
}

export const UnifiedErrorBoundary: React.FC<UnifiedErrorBoundaryProps> = ({
  children,
  componentName,
  errorType,
  fallback
}) => {
  const FallbackComponent = fallback || UnifiedErrorFallback;

  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <FallbackComponent 
          {...props} 
          componentName={componentName}
          errorType={errorType}
        />
      )}
      onError={(error, errorInfo) => {
        console.error(`🚨 [UNIFIED ERROR BOUNDARY] Error in ${componentName || 'unknown'}:`, {
          error,
          errorInfo,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        });
        
        // Here you could send error to analytics service
        // trackError(error, { componentName, errorInfo });
      }}
      onReset={() => {
        console.log(`🔄 [UNIFIED ERROR BOUNDARY] Resetting error boundary for ${componentName || 'unknown'}`);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};