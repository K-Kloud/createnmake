
import React from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export interface LoadingStateProps {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
  loadingComponent?: React.ReactNode;
  showErrorDetails?: boolean;
}

export const LoadingState = ({
  isLoading,
  error,
  children,
  loadingMessage = "Loading...",
  errorMessage = "Something went wrong",
  onRetry,
  className,
  loadingComponent,
  showErrorDetails = false
}: LoadingStateProps) => {
  const { handleError } = useErrorHandler();

  React.useEffect(() => {
    if (error) {
      handleError(error, 'LoadingState component');
    }
  }, [error, handleError]);

  if (isLoading) {
    return loadingComponent || (
      <div className={cn("flex flex-col items-center justify-center py-8 space-y-4", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{errorMessage}</h3>
            {showErrorDetails && (
              <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                {error.message}
              </p>
            )}
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return <>{children}</>;
};
