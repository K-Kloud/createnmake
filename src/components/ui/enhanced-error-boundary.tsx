import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }> | React.ReactElement;
}

export const EnhancedErrorBoundary: React.FC<EnhancedErrorBoundaryProps> = ({ 
  children, 
  fallback 
}) => {
  const FallbackComponent = fallback || ErrorFallback;
  
  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent as React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>}
      onError={(error, errorInfo) => {
        console.error('Error boundary caught an error:', error, errorInfo);
      }}
      onReset={() => {
        // Optionally clear any state here
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};