import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>We encountered an error while processing your request:</p>
            <code className="block text-xs bg-muted/50 p-2 rounded border font-mono">
              {error.message}
            </code>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetErrorBoundary}
                className="gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Try Again
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback: FallbackComponent = ErrorFallback 
}) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={(error, errorInfo) => {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};