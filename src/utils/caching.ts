// Production caching utilities

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100; // Maximum number of cache entries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Clean up expired entries and enforce size limit
    this.cleanup();
    
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
export const memoryCache = new MemoryCache();

// SessionStorage cache with TTL
export class SessionCache {
  private static prefix = 'app_cache_';

  static set<T>(key: string, data: T, ttl: number = 30 * 60 * 1000): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttl
      };
      
      sessionStorage.setItem(
        this.prefix + key,
        JSON.stringify(entry)
      );
    } catch (error) {
      // Storage quota exceeded or other error - fail silently
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(this.prefix + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      
      if (Date.now() > entry.expiry) {
        sessionStorage.removeItem(this.prefix + key);
        return null;
      }

      return entry.data;
    } catch (error) {
      return null;
    }
  }

  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  static delete(key: string): void {
    sessionStorage.removeItem(this.prefix + key);
  }

  static clear(): void {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    keys.forEach(key => sessionStorage.removeItem(key));
  }

  static cleanup(): void {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key);
      }
    }

    keys.forEach(key => {
      try {
        const item = sessionStorage.getItem(key);
        if (item) {
          const entry = JSON.parse(item);
          if (Date.now() > entry.expiry) {
            sessionStorage.removeItem(key);
          }
        }
      } catch {
        sessionStorage.removeItem(key);
      }
    });
  }
}

// Initialize cache cleanup on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    SessionCache.cleanup();
  });

  // Cleanup expired entries periodically
  setInterval(() => {
    SessionCache.cleanup();
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Higher-order function for caching API responses
export const withCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  getCacheKey: (...args: Parameters<T>) => string,
  ttl: number = 5 * 60 * 1000
): T => {
  return (async (...args: Parameters<T>) => {
    const cacheKey = getCacheKey(...args);
    
    // Try memory cache first (fastest)
    let cached = memoryCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Try session storage cache
    cached = SessionCache.get(cacheKey);
    if (cached) {
      // Also store in memory cache for faster access
      memoryCache.set(cacheKey, cached, ttl);
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    
    // Store in both caches
    memoryCache.set(cacheKey, result, ttl);
    SessionCache.set(cacheKey, result, ttl);
    
    return result;
  }) as T;
};