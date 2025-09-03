import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface PerformanceSettings {
  imageQuality: 'low' | 'medium' | 'high';
  autoPlayVideos: boolean;
  preloadImages: boolean;
  reducedMotion: boolean;
}

export const usePerformanceOptimization = () => {
  const [settings, setSettings] = useState<PerformanceSettings>({
    imageQuality: 'high',
    autoPlayVideos: true,
    preloadImages: true,
    reducedMotion: false
  });

  // Check if user prefers reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSettings(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));

    const handleChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Optimized image loading based on device capabilities
  const getOptimizedImageSrc = useCallback((originalSrc: string, width?: number, quality?: number) => {
    if (!originalSrc) return '';
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    const isHighDPI = devicePixelRatio > 1;
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');

    let targetQuality = quality || (settings.imageQuality === 'high' ? 90 : settings.imageQuality === 'medium' ? 70 : 50);
    let targetWidth = width;

    // Adjust for slow connections
    if (isSlowConnection) {
      targetQuality = Math.min(targetQuality, 60);
      targetWidth = targetWidth ? Math.min(targetWidth, 800) : 800;
    }

    // Adjust for high DPI displays
    if (isHighDPI && targetWidth) {
      targetWidth = Math.floor(targetWidth * devicePixelRatio);
    }

    // For Supabase storage URLs, add transformation parameters
    if (originalSrc.includes('supabase.co/storage')) {
      const url = new URL(originalSrc);
      if (targetWidth) url.searchParams.set('width', targetWidth.toString());
      url.searchParams.set('quality', targetQuality.toString());
      url.searchParams.set('format', 'webp');
      return url.toString();
    }

    return originalSrc;
  }, [settings.imageQuality]);

  // Lazy loading with intersection observer
  const useLazyImage = (src: string, options?: { width?: number; quality?: number }) => {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { ref, isIntersecting } = useIntersectionObserver({
      threshold: 0.1,
      rootMargin: '50px'
    });

    useEffect(() => {
      if (isIntersecting && src && !imageSrc) {
        const optimizedSrc = getOptimizedImageSrc(src, options?.width, options?.quality);
        
        const img = new Image();
        img.onload = () => {
          setImageSrc(optimizedSrc);
          setIsLoading(false);
        };
        img.onerror = () => {
          setError('Failed to load image');
          setIsLoading(false);
        };
        img.src = optimizedSrc;
      }
    }, [isIntersecting, src, imageSrc, getOptimizedImageSrc, options?.width, options?.quality]);

    return { ref, src: imageSrc, isLoading, error };
  };

  // Debounced search
  const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Virtual scrolling for large lists
  const useVirtualScrolling = <T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan: number = 3
  ) => {
    const [scrollTop, setScrollTop] = useState(0);

    const visibleRange = useMemo(() => {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
      );
      return { startIndex, endIndex };
    }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

    const visibleItems = useMemo(() => {
      return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    }, [items, visibleRange.startIndex, visibleRange.endIndex]);

    const totalHeight = items.length * itemHeight;
    const offsetY = visibleRange.startIndex * itemHeight;

    return {
      visibleItems,
      totalHeight,
      offsetY,
      onScroll: (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
      }
    };
  };

  // Memory-efficient image cache
  const imageCache = useMemo(() => new Map<string, HTMLImageElement>(), []);

  const preloadImage = useCallback((src: string) => {
    if (imageCache.has(src) || !settings.preloadImages) return;

    const img = new Image();
    img.src = getOptimizedImageSrc(src);
    imageCache.set(src, img);

    // Cleanup old entries to prevent memory leaks
    if (imageCache.size > 50) {
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }
  }, [imageCache, settings.preloadImages, getOptimizedImageSrc]);

  return {
    settings,
    setSettings,
    getOptimizedImageSrc,
    useLazyImage,
    useDebounce,
    useVirtualScrolling,
    preloadImage
  };
};