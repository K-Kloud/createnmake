// Production optimizations and utilities
interface CacheConfig {
  ttl: number;
  maxSize: number;
}

interface PerformanceBudget {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
}

class ProductionOptimizer {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxCacheSize = 1000;
  private performanceBudget: PerformanceBudget = {
    fcp: 1800,
    lcp: 2500,
    cls: 0.1,
    fid: 100,
  };

  // Memory-efficient caching
  setCache<T>(key: string, data: T, config: Partial<CacheConfig> = {}): void {
    const ttl = config.ttl || 300000; // 5 minutes default
    
    // Clean old entries if cache is full
    if (this.cache.size >= (config.maxSize || this.maxCacheSize)) {
      this.cleanCache();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private cleanCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });

    // If still too many, remove oldest entries
    if (this.cache.size >= this.maxCacheSize) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, Math.floor(this.maxCacheSize * 0.3));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  // Resource preloading
  preloadCriticalResources(): void {
    const criticalResources = [
      '/fonts/inter-var.woff2',
      '/images/logo.svg',
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = this.getResourceType(resource);
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  private getResourceType(url: string): string {
    if (url.includes('.woff2') || url.includes('.woff')) return 'font';
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.svg')) return 'image';
    if (url.includes('.css')) return 'style';
    if (url.includes('.js')) return 'script';
    return 'fetch';
  }

  // Performance monitoring
  monitorPerformanceBudget(): void {
    if (!('PerformanceObserver' in window)) return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        this.checkPerformanceBudget(entry);
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Monitor FCP
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.checkPerformanceBudget(entry);
        }
      });
    }).observe({ entryTypes: ['paint'] });
  }

  private checkPerformanceBudget(entry: PerformanceEntry): void {
    const violations: string[] = [];

    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint' && entry.startTime > this.performanceBudget.fcp) {
          violations.push(`FCP exceeded budget: ${entry.startTime}ms > ${this.performanceBudget.fcp}ms`);
        }
        break;
      case 'largest-contentful-paint':
        if (entry.startTime > this.performanceBudget.lcp) {
          violations.push(`LCP exceeded budget: ${entry.startTime}ms > ${this.performanceBudget.lcp}ms`);
        }
        break;
      case 'first-input':
        const fid = (entry as any).processingStart - entry.startTime;
        if (fid > this.performanceBudget.fid) {
          violations.push(`FID exceeded budget: ${fid}ms > ${this.performanceBudget.fid}ms`);
        }
        break;
      case 'layout-shift':
        const cls = (entry as any).value;
        if (cls > this.performanceBudget.cls) {
          violations.push(`CLS exceeded budget: ${cls} > ${this.performanceBudget.cls}`);
        }
        break;
    }

    if (violations.length > 0) {
      this.reportPerformanceViolations(violations);
    }
  }

  private reportPerformanceViolations(violations: string[]): void {
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
      fetch('/api/performance-violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violations,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(console.error);
    } else {
      console.warn('Performance budget violations:', violations);
    }
  }

  // Memory leak detection
  detectMemoryLeaks(): void {
    if (!('performance' in window && 'memory' in performance)) return;

    let baseline = (performance as any).memory.usedJSHeapSize;
    
    const checkInterval = setInterval(() => {
      const current = (performance as any).memory.usedJSHeapSize;
      const growth = current - baseline;
      const growthPercentage = (growth / baseline) * 100;

      if (growthPercentage > 50) { // 50% growth threshold
        console.warn('Potential memory leak detected:', {
          baseline: this.formatBytes(baseline),
          current: this.formatBytes(current),
          growth: this.formatBytes(growth),
          growthPercentage: `${growthPercentage.toFixed(2)}%`,
        });

        if (process.env.NODE_ENV === 'production') {
          fetch('/api/memory-leak-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              baseline,
              current,
              growth,
              growthPercentage,
              timestamp: Date.now(),
              url: window.location.href,
            }),
          }).catch(console.error);
        }
      }

      baseline = current;
    }, 30000); // Check every 30 seconds

    // Clean up after 10 minutes
    setTimeout(() => clearInterval(checkInterval), 600000);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Bundle analysis
  analyzeBundleSize(): void {
    if (process.env.NODE_ENV !== 'production') return;

    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    Promise.all([
      ...scripts.map(script => this.getResourceSize((script as HTMLScriptElement).src)),
      ...stylesheets.map(link => this.getResourceSize((link as HTMLLinkElement).href)),
    ]).then(sizes => {
      const totalSize = sizes.reduce((sum, size) => sum + size, 0);
      
      if (totalSize > 2 * 1024 * 1024) { // 2MB threshold
        console.warn('Large bundle size detected:', this.formatBytes(totalSize));
      }
    });
  }

  private async getResourceSize(url: string): Promise<number> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch {
      return 0;
    }
  }

  // Service Worker registration
  registerServiceWorker(): void {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }

  // Initialize all optimizations
  initialize(): void {
    this.preloadCriticalResources();
    this.monitorPerformanceBudget();
    this.detectMemoryLeaks();
    this.analyzeBundleSize();
    this.registerServiceWorker();
  }
}

// Singleton instance
export const productionOptimizer = new ProductionOptimizer();

// Auto-initialize in production
if (process.env.NODE_ENV === 'production') {
  productionOptimizer.initialize();
}

// Utility functions
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};