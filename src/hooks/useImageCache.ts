
import { useState, useEffect, useCallback } from 'react';

interface CacheItem {
  url: string;
  blob: Blob;
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

class ImageCache {
  private cache: Map<string, CacheItem> = new Map();
  private totalSize = 0;

  async get(url: string): Promise<string | null> {
    const item = this.cache.get(url);
    
    if (item && Date.now() - item.timestamp < CACHE_DURATION) {
      return URL.createObjectURL(item.blob);
    }
    
    if (item) {
      this.remove(url);
    }
    
    return null;
  }

  async set(url: string, blob: Blob): Promise<void> {
    // Check if we need to clear space
    while (this.totalSize + blob.size > MAX_CACHE_SIZE && this.cache.size > 0) {
      this.removeOldest();
    }

    const item: CacheItem = {
      url,
      blob,
      timestamp: Date.now(),
    };

    this.cache.set(url, item);
    this.totalSize += blob.size;
  }

  private remove(url: string): void {
    const item = this.cache.get(url);
    if (item) {
      this.cache.delete(url);
      this.totalSize -= item.blob.size;
    }
  }

  private removeOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.remove(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }
}

const imageCache = new ImageCache();

export const useImageCache = () => {
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const getCachedImage = useCallback(async (url: string): Promise<string> => {
    // Check cache first
    let cachedUrl = await imageCache.get(url);
    if (cachedUrl) {
      return cachedUrl;
    }

    // If not in cache, fetch and cache
    setLoading(prev => new Set(prev).add(url));
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      await imageCache.set(url, blob);
      
      cachedUrl = URL.createObjectURL(blob);
      return cachedUrl;
    } catch (error) {
      console.error('Failed to cache image:', error);
      return url; // Fallback to original URL
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
    }
  }, []);

  const preloadImage = useCallback(async (url: string): Promise<void> => {
    const cachedUrl = await imageCache.get(url);
    if (!cachedUrl) {
      await getCachedImage(url);
    }
  }, [getCachedImage]);

  const preloadImages = useCallback(async (urls: string[]): Promise<void> => {
    const promises = urls.map(url => preloadImage(url));
    await Promise.allSettled(promises);
  }, [preloadImage]);

  const clearCache = useCallback(() => {
    imageCache.clear();
  }, []);

  const isLoading = useCallback((url: string) => {
    return loading.has(url);
  }, [loading]);

  return {
    getCachedImage,
    preloadImage,
    preloadImages,
    clearCache,
    isLoading,
  };
};
