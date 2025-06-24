
// Bundle optimization utilities
export const createDynamicImport = (
  importFn: () => Promise<any>,
  delay: number = 0
) => {
  return () => {
    if (delay > 0) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(importFn());
        }, delay);
      });
    }
    return importFn();
  };
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload important fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  fontLink.href = '/fonts/inter-var.woff2';
  document.head.appendChild(fontLink);

  // Preload critical CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'preload';
  cssLink.as = 'style';
  cssLink.href = '/src/index.css';
  document.head.appendChild(cssLink);
};

// Monitor bundle performance
export const trackBundlePerformance = () => {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        const metrics = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        };

        console.log('Bundle Performance Metrics:', metrics);
        
        // You could send these metrics to an analytics service
        // analytics.track('bundle_performance', metrics);
      }, 0);
    });
  }
};
