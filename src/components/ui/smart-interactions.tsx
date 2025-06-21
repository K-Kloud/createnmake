
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Smart loading with progressive enhancement
export const SmartLoader: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  timeout?: number;
}> = ({ children, fallback, timeout = 5000 }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    const fallbackTimer = setTimeout(() => {
      if (!isLoaded) {
        setShowFallback(true);
      }
    }, timeout);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, [isLoaded, timeout]);

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={`transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
};

// Adaptive button with smart retry logic
export const SmartButton: React.FC<{
  onClick: () => Promise<void>;
  children: React.ReactNode;
  maxRetries?: number;
  retryDelay?: number;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}> = ({ onClick, children, maxRetries = 3, retryDelay = 1000, variant = 'default', className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const handleClick = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onClick();
      setRetryCount(0);
    } catch (error) {
      console.error('Smart button error:', error);
      
      if (retryCount < maxRetries) {
        toast({
          title: "Operation failed",
          description: `Retrying... (${retryCount + 1}/${maxRetries})`,
        });
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setIsLoading(false);
          handleClick();
        }, retryDelay);
      } else {
        toast({
          title: "Operation failed",
          description: "Maximum retries reached. Please try again later.",
          variant: "destructive",
        });
        setRetryCount(0);
      }
    } finally {
      if (retryCount >= maxRetries || retryCount === 0) {
        setIsLoading(false);
      }
    }
  }, [onClick, isLoading, retryCount, maxRetries, retryDelay, toast]);

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          {retryCount > 0 ? `Retrying... (${retryCount}/${maxRetries})` : 'Loading...'}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

// Lazy loading with intersection observer
export const LazyComponent: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}> = ({ children, fallback, rootMargin = '50px', threshold = 0.1 }) => {
  const { ref, inView, entry } = useInView({
    triggerOnce: true,
    rootMargin,
    threshold,
  });

  return (
    <div ref={ref}>
      {inView ? children : (fallback || <div className="h-32 bg-muted animate-pulse rounded" />)}
    </div>
  );
};

// Progressive image loading
export const ProgressiveImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
}> = ({ src, alt, className, placeholderSrc }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsError(true);
    img.src = src;
  }, [src]);

  if (isError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <div className={`absolute inset-0 bg-muted animate-pulse ${className}`} />
      )}
      <img
        ref={imgRef}
        src={isLoaded ? src : placeholderSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
      />
    </div>
  );
};

// Smart form with auto-save
export const SmartForm: React.FC<{
  children: React.ReactNode;
  onAutoSave?: (data: FormData) => Promise<void>;
  autoSaveDelay?: number;
}> = ({ children, onAutoSave, autoSaveDelay = 2000 }) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleChange = useCallback(() => {
    if (!onAutoSave || !formRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      const formData = new FormData(formRef.current!);
      try {
        await onAutoSave(formData);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, autoSaveDelay);
  }, [onAutoSave, autoSaveDelay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <form ref={formRef} onChange={handleChange} className="space-y-4">
      {children}
      {lastSaved && (
        <div className="text-xs text-muted-foreground">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </form>
  );
};
