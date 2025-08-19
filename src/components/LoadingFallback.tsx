// Phase 2: Reusable loading fallback component
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  className?: string;
}

export const LoadingFallback = ({ 
  message = "Loading...", 
  className = "flex min-h-[200px] items-center justify-center" 
}: LoadingFallbackProps) => {
  return (
    <div className={className}>
      <div className="text-center space-y-3">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

// Phase 2: Translation-aware loading component
export const TranslationLoadingFallback = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading translations...</p>
        <p className="text-xs text-muted-foreground/70">
          Please wait while we prepare the interface
        </p>
      </div>
    </div>
  );
};