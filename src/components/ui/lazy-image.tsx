import React, { memo, useCallback, useMemo } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholder?: React.ReactNode;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

export const LazyImage = memo(({
  src,
  alt,
  fallbackSrc,
  placeholder,
  className,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: LazyImageProps) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  });

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const imageSrc = useMemo(() => {
    if (!isIntersecting) return undefined;
    if (hasError && fallbackSrc) return fallbackSrc;
    return src;
  }, [isIntersecting, hasError, fallbackSrc, src]);

  const showPlaceholder = !isIntersecting || (!isLoaded && isIntersecting);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      {showPlaceholder && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          {placeholder}
        </div>
      )}
      
      {imageSrc && (
        <img
          {...props}
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          loading="lazy"
        />
      )}
    </div>
  );
});