// Production utilities for optimizing the application in production builds

// Remove all console.log statements in production
export const createProductionLogger = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    log: isProduction ? () => {} : console.log.bind(console),
    warn: isProduction ? () => {} : console.warn.bind(console),
    error: console.error.bind(console), // Always keep errors
    debug: isProduction ? () => {} : console.debug.bind(console),
    info: isProduction ? () => {} : console.info.bind(console),
  };
};

// Global production logger
export const logger = createProductionLogger();

// Code splitting utility
export const lazyImport = <T extends Record<string, any>>(
  factory: () => Promise<T>
) => {
  return new Promise<T>((resolve) => {
    factory().then(resolve);
  });
};

// Image optimization utilities
export const optimizeImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
} = {}): string => {
  // Only apply optimizations in production
  if (process.env.NODE_ENV !== 'production') {
    return url;
  }

  const { width, height, quality = 80, format = 'webp' } = options;
  
  // If it's a Supabase storage URL, we can add transformation parameters
  if (url.includes('supabase.co/storage')) {
    const urlObj = new URL(url);
    const params = new URLSearchParams();
    
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('quality', quality.toString());
    params.set('format', format);
    
    urlObj.search = params.toString();
    return urlObj.toString();
  }
  
  return url;
};

// Bundle analysis helper
export const reportBundleInfo = () => {
  if (process.env.NODE_ENV !== 'production') return;

  // Report bundle size and performance metrics
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const bundleInfo = {
        transferSize: navigation.transferSize,
        encodedBodySize: navigation.encodedBodySize,
        decodedBodySize: navigation.decodedBodySize,
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart
      };

      // Send to analytics service
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/bundle', JSON.stringify(bundleInfo));
      }
    }
  });
};

// Memory leak detection
export const detectMemoryLeaks = () => {
  if (process.env.NODE_ENV !== 'production') return;

  let lastMemoryUsage = 0;
  
  setInterval(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const currentUsage = memInfo.usedJSHeapSize;
      
      // Check for significant memory increase
      if (currentUsage > lastMemoryUsage * 1.5 && currentUsage > 50 * 1024 * 1024) {
        // Memory usage increased by 50% and is over 50MB
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/monitoring/memory-leak', JSON.stringify({
            currentUsage,
            lastUsage: lastMemoryUsage,
            increase: currentUsage - lastMemoryUsage,
            url: window.location.href,
            timestamp: Date.now()
          }));
        }
      }
      
      lastMemoryUsage = currentUsage;
    }
  }, 30000); // Check every 30 seconds
};

// Performance budget monitoring
export const monitorPerformanceBudget = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const budgets = {
    firstContentfulPaint: 1500, // 1.5s
    largestContentfulPaint: 2500, // 2.5s
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1 // 0.1
  };

  // Monitor FCP
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint' && entry.startTime > budgets.firstContentfulPaint) {
        reportBudgetViolation('FCP', entry.startTime, budgets.firstContentfulPaint);
      }
    }
  }).observe({ entryTypes: ['paint'] });

  // Monitor LCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry.startTime > budgets.largestContentfulPaint) {
      reportBudgetViolation('LCP', lastEntry.startTime, budgets.largestContentfulPaint);
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Monitor CLS
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    if (clsValue > budgets.cumulativeLayoutShift) {
      reportBudgetViolation('CLS', clsValue, budgets.cumulativeLayoutShift);
    }
  }).observe({ entryTypes: ['layout-shift'] });
};

const reportBudgetViolation = (metric: string, actual: number, budget: number) => {
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/monitoring/budget-violation', JSON.stringify({
      metric,
      actual,
      budget,
      violation: actual - budget,
      url: window.location.href,
      timestamp: Date.now()
    }));
  }
};

// Resource loading optimization
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fonts = [
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
    'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap'
  ];

  fonts.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = fontUrl;
    document.head.appendChild(link);
  });

  // Preload critical images
  const criticalImages = [
    '/placeholder.svg'
  ];

  criticalImages.forEach(imageSrc => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageSrc;
    document.head.appendChild(link);
  });
};

// Initialize production optimizations
export const initializeProductionOptimizations = () => {
  if (process.env.NODE_ENV !== 'production') return;

  // Start monitoring
  reportBundleInfo();
  detectMemoryLeaks();
  monitorPerformanceBudget();
  preloadCriticalResources();

  // Service worker registration for caching
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .catch(() => {
          // Silent fail - service worker is optional
        });
    });
  }
};