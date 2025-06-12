import React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export interface LoadingStateProps {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
  loadingComponent?: React.ReactNode;
}
export const LoadingState = ({
  isLoading,
  error,
  children,
  loadingMessage = "Loading...",
  errorMessage = "Something went wrong",
  onRetry,
  className,
  loadingComponent
}: LoadingStateProps) => {
  if (isLoading) {
    return loadingComponent || <div className={cn("flex flex-col items-center justify-center py-8 space-y-4", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{loadingMessage}</p>
      </div>;
  }
  if (error) {
    return;
  }
  return <>{children}</>;
};