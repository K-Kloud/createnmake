import React, { useEffect, useState } from 'react';
import { useLoadingManager } from '@/providers/LoadingManagerProvider';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AdaptiveLoadingIndicatorProps {
  type?: 'minimal' | 'detailed' | 'progress' | 'smart';
  showProgress?: boolean;
  showMessages?: boolean;
  className?: string;
  position?: 'inline' | 'overlay' | 'fixed';
}

export const AdaptiveLoadingIndicator: React.FC<AdaptiveLoadingIndicatorProps> = ({
  type = 'smart',
  showProgress = true,
  showMessages = true,
  className,
  position = 'inline'
}) => {
  const { 
    loadingStates, 
    isLoading, 
    criticalLoading, 
    getTotalProgress 
  } = useLoadingManager();
  
  const [displayMessage, setDisplayMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      
      // Smart message selection based on loading states
      const criticalState = loadingStates.find(s => s.priority === 'critical');
      const highPriorityState = loadingStates.find(s => s.priority === 'high');
      const latestState = loadingStates[loadingStates.length - 1];
      
      const messageState = criticalState || highPriorityState || latestState;
      setDisplayMessage(messageState?.message || 'Loading...');
    } else {
      // Delayed hide for smoother UX
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, loadingStates]);

  if (!isVisible && !isLoading) return null;

  const totalProgress = getTotalProgress();
  const hasMultipleLoaders = loadingStates.length > 1;

  // Position classes
  const positionClasses = {
    inline: '',
    overlay: 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center',
    fixed: 'fixed bottom-4 right-4 z-50'
  };

  // Type-specific rendering
  const renderByType = () => {
    switch (type) {
      case 'minimal':
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {showMessages && <span className="text-sm">{displayMessage}</span>}
          </div>
        );

      case 'detailed':
        return (
          <div className="space-y-3 p-4 bg-card border rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">{displayMessage}</span>
            </div>
            
            {showProgress && (
              <Progress value={totalProgress} className="h-2" />
            )}
            
            {hasMultipleLoaders && (
              <div className="text-xs text-muted-foreground">
                {loadingStates.length} operations in progress
              </div>
            )}
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-2 w-full max-w-md">
            {showMessages && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">{displayMessage}</span>
              </div>
            )}
            <Progress value={totalProgress} className="h-3" />
            <div className="text-xs text-muted-foreground text-center">
              {Math.round(totalProgress)}% complete
            </div>
          </div>
        );

      case 'smart':
      default:
        // Smart mode adapts based on context
        if (criticalLoading || hasMultipleLoaders) {
          return renderByType(); // Falls back to detailed
        } else if (totalProgress > 0 && totalProgress < 100) {
          // Show progress when available
          return (
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              <div className="flex-1 space-y-1">
                {showMessages && (
                  <div className="text-sm">{displayMessage}</div>
                )}
                {showProgress && (
                  <Progress value={totalProgress} className="h-1.5" />
                )}
              </div>
            </div>
          );
        } else {
          // Simple loading for quick operations
          return (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {showMessages && <span className="text-sm">{displayMessage}</span>}
            </div>
          );
        }
    }
  };

  return (
    <div className={cn(positionClasses[position], className)}>
      {renderByType()}
    </div>
  );
};

// Specialized loading components
export const CriticalLoadingOverlay: React.FC<{ message?: string }> = ({ message }) => (
  <AdaptiveLoadingIndicator
    type="detailed"
    position="overlay"
    className="flex-col gap-4"
  />
);

export const ProgressLoadingBar: React.FC<{ 
  progress?: number;
  message?: string;
  className?: string;
}> = ({ progress, message, className }) => {
  const { updateProgress, startLoading, finishLoading } = useLoadingManager();
  const loadingId = 'progress-bar';

  useEffect(() => {
    if (progress !== undefined) {
      if (progress === 0) {
        startLoading(loadingId, 'background', message);
      } else if (progress >= 100) {
        finishLoading(loadingId);
      } else {
        updateProgress(loadingId, progress);
      }
    }
  }, [progress, message, startLoading, updateProgress, finishLoading]);

  if (progress === undefined || progress >= 100) return null;

  return (
    <div className={cn('w-full', className)}>
      <AdaptiveLoadingIndicator
        type="progress"
        showMessages={!!message}
      />
    </div>
  );
};

export const SmartLoadingStates: React.FC<{
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
}> = ({
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  isLoading,
  error,
  isEmpty
}) => {
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {errorComponent || (
          <div className="text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">
              {error.message || 'Something went wrong'}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {loadingComponent || <AdaptiveLoadingIndicator type="detailed" />}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {emptyComponent || (
          <div className="text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};