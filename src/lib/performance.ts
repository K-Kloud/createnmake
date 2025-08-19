// Production Performance Utilities
// This module provides performance monitoring and optimization tools

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceEntry {
  type: 'navigation' | 'resource' | 'paint' | 'measure' | 'custom';
  name: string;
  duration: number;
  startTime: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isProduction = process.env.NODE_ENV === 'production';
  private enabledInDev = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Enable monitoring in development for testing
  enableInDev(): void {
    this.enabledInDev = true;
  }

  private shouldLog(): boolean {
    return this.isProduction || this.enabledInDev;
  }

  // Start timing a performance metric
  startTiming(name: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog()) return;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };
    this.metrics.set(name, metric);
  }

  // End timing and record the metric
  endTiming(name: string): number | null {
    if (!this.shouldLog()) return null;

    const metric = this.metrics.get(name);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;

    // Only log significant performance issues in production
    if (this.isProduction && duration > 100) {
      this.logPerformanceIssue(name, duration, metric.metadata);
    }

    return duration;
  }

  // Measure a function's execution time
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTiming(name, metadata);
    try {
      const result = await fn();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  // Measure synchronous function execution
  measure<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startTiming(name, metadata);
    try {
      const result = fn();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  // Get Core Web Vitals
  getCoreWebVitals(): Promise<PerformanceEntry[]> {
    return new Promise((resolve) => {
      const vitals: PerformanceEntry[] = [];

      // First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            vitals.push({
              type: 'paint',
              name: 'FCP',
              duration: entry.startTime,
              startTime: entry.startTime
            });
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.push({
          type: 'paint',
          name: 'LCP',
          duration: lastEntry.startTime,
          startTime: lastEntry.startTime
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        vitals.push({
          type: 'measure',
          name: 'CLS',
          duration: clsValue,
          startTime: 0
        });
      }).observe({ entryTypes: ['layout-shift'] });

      // Return collected vitals after a delay
      setTimeout(() => resolve(vitals), 1000);
    });
  }

  // Log performance issues (only in production)
  private logPerformanceIssue(
    name: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    if (!this.isProduction) return;

    // In production, send to analytics/monitoring service
    // For now, we'll use a minimal logging approach
    const issue = {
      type: 'performance_issue',
      metric: name,
      duration,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata
    };

    // Send to monitoring service (implement based on your monitoring solution)
    this.sendToMonitoring(issue);
  }

  // Send performance data to monitoring service
  private sendToMonitoring(data: any): void {
    // In a real application, this would send to your monitoring service
    // Examples: Sentry, DataDog, New Relic, custom analytics endpoint
    
    // For now, use a beacon for minimal impact
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon('/api/monitoring/performance', blob);
    }
  }

  // Get memory usage information
  getMemoryUsage(): any {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  // Report bundle size impact
  reportBundleMetrics(): void {
    if (!this.shouldLog()) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const metrics = {
        loadEventEnd: navigation.loadEventEnd,
        domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
        transferSize: navigation.transferSize,
        encodedBodySize: navigation.encodedBodySize,
        decodedBodySize: navigation.decodedBodySize
      };

      if (this.isProduction) {
        this.sendToMonitoring({
          type: 'bundle_metrics',
          ...metrics,
          timestamp: Date.now(),
          url: window.location.href
        });
      }
    }
  }
}

// Production-safe logger that removes console.log in production
export class ProductionLogger {
  private static isProduction = process.env.NODE_ENV === 'production';

  static log(...args: any[]): void {
    if (!ProductionLogger.isProduction) {
      console.log(...args);
    }
  }

  static warn(...args: any[]): void {
    if (!ProductionLogger.isProduction) {
      console.warn(...args);
    }
  }

  static error(...args: any[]): void {
    // Always log errors, but format them properly for production
    if (ProductionLogger.isProduction) {
      // Send errors to monitoring service instead of console
      const errorData = {
        type: 'client_error',
        message: args.join(' '),
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      // Send to monitoring service
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(errorData)], { type: 'application/json' });
        navigator.sendBeacon('/api/monitoring/error', blob);
      }
    } else {
      console.error(...args);
    }
  }

  static debug(...args: any[]): void {
    if (!ProductionLogger.isProduction) {
      console.debug(...args);
    }
  }

  static info(...args: any[]): void {
    if (!ProductionLogger.isProduction) {
      console.info(...args);
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility functions for common performance patterns
export const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    return performanceMonitor.measure(name, () => fn(...args));
  }) as T;
};

export const withAsyncPerformanceMonitoring = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    return performanceMonitor.measureAsync(name, () => fn(...args));
  }) as T;
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Report initial bundle metrics after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.reportBundleMetrics();
    }, 1000);
  });

  // Monitor Core Web Vitals
  performanceMonitor.getCoreWebVitals().then((vitals) => {
    if (process.env.NODE_ENV === 'production') {
      vitals.forEach((vital) => {
        (performanceMonitor as any).sendToMonitoring({
          type: 'core_web_vital',
          ...vital,
          timestamp: Date.now(),
          url: window.location.href
        });
      });
    }
  });
}