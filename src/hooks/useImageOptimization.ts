import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OptimizationOptions {
  enableLazyLoading: boolean;
  enableCaching: boolean;
  enablePreloading: boolean;
  cacheExpirationTime: number; // in milliseconds
  preloadDistance: number; // in pixels
  quality: 'low' | 'medium' | 'high';
}

interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  hits: number;
}

interface ImageMetrics {
  totalImages: number;
  cachedImages: number;
  cacheHitRate: number;
  averageLoadTime: number;
  memoryUsage: number;
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  enableLazyLoading: true,
  enableCaching: true,
  enablePreloading: true,
  cacheExpirationTime: 30 * 60 * 1000, // 30 minutes
  preloadDistance: 200,
  quality: 'medium'
};

export const useImageOptimization = (options: Partial<OptimizationOptions> = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const [imageCache, setImageCache] = useState<Map<string, CachedImage>>(new Map());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [metrics, setMetrics] = useState<ImageMetrics>({
    totalImages: 0,
    cachedImages: 0,
    cacheHitRate: 0,
    averageLoadTime: 0,
    memoryUsage: 0
  });
  
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const loadTimes = useRef<number[]>([]);
  const totalRequests = useRef<number>(0);
  const cacheHits = useRef<number>(0);

  // Initialize intersection observer for lazy loading
  useEffect(() => {
    if (!config.enableLazyLoading) return;

    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              loadImage(src).then((optimizedSrc) => {
                img.src = optimizedSrc;
                img.classList.remove('lazy-loading');
                img.classList.add('lazy-loaded');
              });
              intersectionObserver.current?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: `${config.preloadDistance}px`
      }
    );

    return () => {
      intersectionObserver.current?.disconnect();
    };
  }, [config.enableLazyLoading, config.preloadDistance]);

  // Cache cleanup effect
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      const newCache = new Map(imageCache);
      
      for (const [url, cachedImage] of newCache.entries()) {
        if (now - cachedImage.timestamp > config.cacheExpirationTime) {
          // Revoke object URL to free memory
          URL.revokeObjectURL(url);
          newCache.delete(url);
        }
      }
      
      setImageCache(newCache);
      updateMetrics(newCache);
    };

    const interval = setInterval(cleanup, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, [imageCache, config.cacheExpirationTime]);

  const updateMetrics = useCallback((cache: Map<string, CachedImage>) => {
    const memoryUsage = Array.from(cache.values())
      .reduce((total, cached) => total + cached.blob.size, 0);
    
    const avgLoadTime = loadTimes.current.length > 0
      ? loadTimes.current.reduce((sum, time) => sum + time, 0) / loadTimes.current.length
      : 0;

    setMetrics({
      totalImages: totalRequests.current,
      cachedImages: cache.size,
      cacheHitRate: totalRequests.current > 0 ? cacheHits.current / totalRequests.current : 0,
      averageLoadTime: avgLoadTime,
      memoryUsage
    });
  }, []);

  const optimizeImageUrl = useCallback((url: string): string => {
    if (!url) return url;

    // Add quality and format parameters for Supabase storage URLs
    if (url.includes('supabase.co/storage')) {
      const urlObj = new URL(url);
      
      // Add quality parameter based on config
      const qualityMap = { low: 60, medium: 80, high: 95 };
      urlObj.searchParams.set('quality', qualityMap[config.quality].toString());
      
      // Prefer WebP format if supported
      if (supportsWebP()) {
        urlObj.searchParams.set('format', 'webp');
      }
      
      return urlObj.toString();
    }

    return url;
  }, [config.quality]);

  const loadImage = useCallback(async (url: string): Promise<string> => {
    const startTime = performance.now();
    totalRequests.current++;

    // Check cache first
    if (config.enableCaching && imageCache.has(url)) {
      const cached = imageCache.get(url)!;
      cached.hits++;
      cacheHits.current++;
      
      const objectUrl = URL.createObjectURL(cached.blob);
      loadTimes.current.push(performance.now() - startTime);
      updateMetrics(imageCache);
      
      return objectUrl;
    }

    // Check if already loading
    if (loadingImages.has(url)) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (imageCache.has(url)) {
            const cached = imageCache.get(url)!;
            resolve(URL.createObjectURL(cached.blob));
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    setLoadingImages(prev => new Set(prev).add(url));

    try {
      const optimizedUrl = optimizeImageUrl(url);
      const response = await fetch(optimizedUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const loadTime = performance.now() - startTime;
      loadTimes.current.push(loadTime);

      // Cache the blob if caching is enabled
      if (config.enableCaching) {
        const newCache = new Map(imageCache);
        newCache.set(url, {
          url: optimizedUrl,
          blob,
          timestamp: Date.now(),
          hits: 1
        });
        setImageCache(newCache);
        updateMetrics(newCache);
      }

      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });

      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to load image:', error);
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
      return url; // Fallback to original URL
    }
  }, [imageCache, loadingImages, config.enableCaching, optimizeImageUrl, updateMetrics]);

  const preloadImage = useCallback(async (url: string): Promise<void> => {
    if (!config.enablePreloading) return;
    
    try {
      await loadImage(url);
    } catch (error) {
      console.warn('Failed to preload image:', url, error);
    }
  }, [loadImage, config.enablePreloading]);

  const preloadImages = useCallback(async (urls: string[]): Promise<void> => {
    if (!config.enablePreloading) return;

    // Limit concurrent preloads to avoid overwhelming the browser
    const concurrency = 3;
    const chunks = [];
    
    for (let i = 0; i < urls.length; i += concurrency) {
      chunks.push(urls.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(url => preloadImage(url)));
    }
  }, [preloadImage, config.enablePreloading]);

  const setupLazyLoading = useCallback((imgElement: HTMLImageElement, src: string) => {
    if (!config.enableLazyLoading || !intersectionObserver.current) {
      // If lazy loading is disabled, load immediately
      loadImage(src).then((optimizedSrc) => {
        imgElement.src = optimizedSrc;
      });
      return;
    }

    imgElement.dataset.src = src;
    imgElement.classList.add('lazy-loading');
    
    // Add loading placeholder
    imgElement.style.backgroundColor = '#f0f0f0';
    imgElement.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23d1d5db'%3E%3Cpath d='M20 30c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10zm0-18c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z'/%3E%3Cpath d='M20 26c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z'/%3E%3C/g%3E%3C/svg%3E")`;
    imgElement.style.backgroundRepeat = 'no-repeat';
    imgElement.style.backgroundPosition = 'center';

    intersectionObserver.current.observe(imgElement);
  }, [config.enableLazyLoading, loadImage]);

  const clearCache = useCallback(() => {
    // Revoke all object URLs to free memory
    imageCache.forEach((cached, url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    setImageCache(new Map());
    updateMetrics(new Map());
  }, [imageCache, updateMetrics]);

  const getCacheSize = useCallback((): number => {
    return Array.from(imageCache.values())
      .reduce((total, cached) => total + cached.blob.size, 0);
  }, [imageCache]);

  // Helper function to check WebP support
  const supportsWebP = (): boolean => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  return {
    loadImage,
    preloadImage,
    preloadImages,
    setupLazyLoading,
    clearCache,
    getCacheSize,
    metrics,
    isLoading: (url: string) => loadingImages.has(url),
    isCached: (url: string) => imageCache.has(url),
    cacheStats: {
      size: imageCache.size,
      memoryUsage: getCacheSize(),
      hitRate: metrics.cacheHitRate
    }
  };
};