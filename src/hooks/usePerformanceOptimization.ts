import { useCallback, useMemo, useRef, useState } from 'react';

export const usePerformanceOptimization = () => {
  // Debounce function for input handling
  const useDebounce = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ) => {
    const debounceRef = useRef<NodeJS.Timeout>();
    
    return useCallback((...args: Parameters<T>) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }, [callback, delay]);
  };

  // Throttle function for frequent events
  const useThrottle = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ) => {
    const throttleRef = useRef<NodeJS.Timeout | null>(null);
    const lastExecuted = useRef<number>(0);
    
    return useCallback((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastExecuted.current > delay) {
        callback(...args);
        lastExecuted.current = now;
      } else if (!throttleRef.current) {
        throttleRef.current = setTimeout(() => {
          callback(...args);
          lastExecuted.current = Date.now();
          throttleRef.current = null;
        }, delay - (now - lastExecuted.current));
      }
    }, [callback, delay]);
  };

  // Memoized image processing
  const useImageMemo = (imageFile: File | null) => {
    return useMemo(() => {
      if (!imageFile) return null;
      
      return {
        url: URL.createObjectURL(imageFile),
        size: imageFile.size,
        type: imageFile.type,
        name: imageFile.name,
      };
    }, [imageFile?.name, imageFile?.size, imageFile?.type]);
  };

  // Cleanup URLs to prevent memory leaks
  const useCleanupImageUrls = () => {
    const urlsRef = useRef<Set<string>>(new Set());
    
    const createImageUrl = useCallback((file: File) => {
      const url = URL.createObjectURL(file);
      urlsRef.current.add(url);
      return url;
    }, []);
    
    const cleanupUrl = useCallback((url: string) => {
      if (urlsRef.current.has(url)) {
        URL.revokeObjectURL(url);
        urlsRef.current.delete(url);
      }
    }, []);
    
    const cleanupAllUrls = useCallback(() => {
      urlsRef.current.forEach(url => URL.revokeObjectURL(url));
      urlsRef.current.clear();
    }, []);
    
    return { createImageUrl, cleanupUrl, cleanupAllUrls };
  };

  // Lazy image loading optimization
  const useLazyImage = (src: string, options: number | { width?: number; quality?: number; threshold?: number } = 0.1) => {
    const threshold = typeof options === 'number' ? options : (options.threshold || 0.1);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    
    useCallback(() => {
      if (!imgRef.current) return;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setIsLoading(true);
            observer.disconnect();
          }
        },
        { threshold }
      );
      
      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }, [threshold]);
    
    const handleLoad = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };

    // Generate optimized src if options include sizing
    const optimizedSrc = typeof options === 'object' && options.width 
      ? getOptimizedImageSrc(src, { width: options.width, quality: options.quality })
      : src;
    
    return { 
      src: isInView ? optimizedSrc : undefined,
      isLoaded, 
      isInView, 
      isLoading,
      imgRef, 
      setIsLoaded,
      onLoad: handleLoad
    };
  };

  // Optimized image source generation - support both old and new signatures
  const getOptimizedImageSrc = (src: string, widthOrSettings?: number | { width?: number; height?: number; quality?: number }, quality?: number) => {
    let settings: { width?: number; height?: number; quality?: number };
    
    // Handle legacy 3-argument call: getOptimizedImageSrc(src, width, quality)
    if (typeof widthOrSettings === 'number' && typeof quality === 'number') {
      settings = { width: widthOrSettings, quality };
    } 
    // Handle new object-based call: getOptimizedImageSrc(src, { width, height, quality })
    else if (typeof widthOrSettings === 'object') {
      settings = widthOrSettings;
    }
    // Handle single argument call: getOptimizedImageSrc(src)
    else {
      settings = { quality: 80 };
    }
    
    const { width, height, quality: finalQuality = 80 } = settings;
    
    // For development, return original src
    if (process.env.NODE_ENV === 'development') {
      return src;
    }
    
    // Add query parameters for optimization
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', finalQuality.toString());
    
    return params.toString() ? `${src}?${params.toString()}` : src;
  };

  return {
    useDebounce,
    useThrottle,
    useImageMemo,
    useCleanupImageUrls,
    useLazyImage,
    getOptimizedImageSrc,
    settings: { 
      threshold: 0.1,
      imageQuality: 80,
      reducedMotion: false,
      maxWidth: 1920,
      maxHeight: 1920
    },
  };
};