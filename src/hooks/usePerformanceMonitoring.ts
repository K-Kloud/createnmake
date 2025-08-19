import { useEffect, useCallback, useRef } from 'react';
import { performanceMonitor, ProductionLogger } from '@/lib/performance';

interface UsePerformanceMonitoringOptions {
  enableMemoryTracking?: boolean;
  enableRenderTracking?: boolean;
  componentName?: string;
}

export const usePerformanceMonitoring = (options: UsePerformanceMonitoringOptions = {}) => {
  const {
    enableMemoryTracking = false,
    enableRenderTracking = false,
    componentName = 'Unknown'
  } = options;

  const renderCount = useRef(0);
  const mountTime = useRef<number>();

  // Track component mount/unmount
  useEffect(() => {
    mountTime.current = performance.now();
    performanceMonitor.startTiming(`${componentName}_mount`);

    return () => {
      performanceMonitor.endTiming(`${componentName}_mount`);
      const totalTime = performance.now() - (mountTime.current || 0);
      
      if (enableRenderTracking) {
        ProductionLogger.debug(`Component ${componentName} lifecycle:`, {
          totalMountTime: totalTime,
          renderCount: renderCount.current
        });
      }
    };
  }, [componentName, enableRenderTracking]);

  // Track renders
  useEffect(() => {
    renderCount.current += 1;
    
    if (enableRenderTracking && renderCount.current > 10) {
      ProductionLogger.warn(`Component ${componentName} has rendered ${renderCount.current} times`);
    }
  });

  // Track memory usage
  const trackMemoryUsage = useCallback(() => {
    if (!enableMemoryTracking) return null;

    const memoryInfo = performanceMonitor.getMemoryUsage();
    if (memoryInfo) {
      const memoryUsageMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
      
      if (memoryUsageMB > 50) {
        ProductionLogger.warn(`High memory usage detected: ${memoryUsageMB.toFixed(2)}MB`);
      }
      
      return memoryInfo;
    }
    return null;
  }, [enableMemoryTracking]);

  // Measure function performance
  const measureFunction = useCallback(<T>(
    name: string,
    fn: () => T
  ): T => {
    return performanceMonitor.measure(`${componentName}_${name}`, fn);
  }, [componentName]);

  // Measure async function performance
  const measureAsyncFunction = useCallback(<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    return performanceMonitor.measureAsync(`${componentName}_${name}`, fn);
  }, [componentName]);

  return {
    trackMemoryUsage,
    measureFunction,
    measureAsyncFunction,
    renderCount: renderCount.current
  };
};

// Hook for tracking expensive operations
export const useExpensiveOperation = <T>(
  operationName: string,
  operation: () => T,
  dependencies: any[] = []
) => {
  const result = useRef<T>();
  const isComputing = useRef(false);

  useEffect(() => {
    if (isComputing.current) return;

    isComputing.current = true;
    const startTime = performance.now();

    try {
      result.current = performanceMonitor.measure(operationName, operation);
    } finally {
      isComputing.current = false;
      const duration = performance.now() - startTime;
      
      if (duration > 100) {
        ProductionLogger.warn(`Expensive operation "${operationName}" took ${duration.toFixed(2)}ms`);
      }
    }
  }, dependencies);

  return result.current;
};

// Hook for tracking API call performance
export const useAPIPerformance = () => {
  const trackAPICall = useCallback(async <T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      // Log slow API calls
      if (duration > 1000) {
        ProductionLogger.warn(`Slow API call to ${endpoint}: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      ProductionLogger.error(`API call failed for ${endpoint} after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }, []);

  return { trackAPICall };
};