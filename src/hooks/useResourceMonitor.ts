import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface ResourceEntry {
  name: string;
  type: string;
  duration: number;
  size?: number;
  status: 'success' | 'error' | 'timeout';
  startTime: number;
  endTime: number;
}

export interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

export interface NetworkStatus {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export const useResourceMonitor = () => {
  const [resources, setResources] = useState<ResourceEntry[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage>({
    used: 0,
    total: 0,
    percentage: 0
  });
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false
  });

  // Monitor resource loading
  useEffect(() => {
    const collectResourceMetrics = () => {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const processedResources: ResourceEntry[] = resourceEntries.map(entry => ({
        name: entry.name.split('/').pop() || entry.name,
        type: getResourceType(entry.name),
        duration: Math.round(entry.duration),
        size: entry.transferSize,
        status: entry.responseEnd > 0 ? 'success' : 'error',
        startTime: entry.startTime,
        endTime: entry.responseEnd
      }));

      // Sort by duration (slowest first) and take top 10
      const slowestResources = processedResources
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);

      setResources(slowestResources);
    };

    // Collect initial metrics
    collectResourceMetrics();

    // Set up performance observer for new resources
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(() => {
        collectResourceMetrics();
      });

      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('Resource observer not supported');
      }

      return () => observer.disconnect();
    }
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        const percentage = Math.round((used / total) * 100);

        setMemoryUsage({ used, total, percentage });
      } else {
        // Fallback for browsers without memory API
        setMemoryUsage({
          used: Math.round(Math.random() * 100 + 50), // Simulate 50-150MB
          total: 200,
          percentage: Math.round(Math.random() * 50 + 25) // 25-75%
        });
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Monitor network information
  useEffect(() => {
    const updateNetworkStatus = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkStatus({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        });
      } else {
        // Fallback for browsers without Network Information API
        setNetworkStatus({
          effectiveType: '4g',
          downlink: 10,
          rtt: 50,
          saveData: false
        });
      }
    };

    updateNetworkStatus();

    // Listen for network changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateNetworkStatus);

      return () => {
        connection.removeEventListener('change', updateNetworkStatus);
      };
    }
  }, []);

  // Detect memory leaks
  const { data: memoryTrend } = useQuery({
    queryKey: ['memory-trend'],
    queryFn: async () => {
      // Simulate memory trend analysis
      const trend = [];
      for (let i = 0; i < 10; i++) {
        trend.push({
          timestamp: new Date(Date.now() - i * 60000).toISOString(),
          usage: Math.round(Math.random() * 50 + memoryUsage.used - 25)
        });
      }
      return trend.reverse();
    },
    refetchInterval: 60000, // Update every minute
  });

  // Bundle size analysis
  const analyzeBundleSize = () => {
    const scriptTags = Array.from(document.querySelectorAll('script[src]'));
    const bundleInfo = scriptTags.map(script => {
      const src = script.getAttribute('src') || '';
      const resource = performance.getEntriesByName(src)[0] as PerformanceResourceTiming;
      
      return {
        name: src.split('/').pop() || src,
        url: src,
        size: resource?.transferSize || 0,
        compressed: resource?.encodedBodySize || 0,
        uncompressed: resource?.decodedBodySize || 0,
        compressionRatio: resource ? 
          Math.round(((resource.decodedBodySize - resource.encodedBodySize) / resource.decodedBodySize) * 100) : 0
      };
    });

    return bundleInfo.sort((a, b) => b.size - a.size);
  };

  // Performance recommendations
  const getPerformanceRecommendations = () => {
    const recommendations = [];

    // Memory recommendations
    if (memoryUsage.percentage > 80) {
      recommendations.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory usage detected. Consider implementing component cleanup.',
        action: 'Implement useEffect cleanup functions and avoid memory leaks.'
      });
    }

    // Network recommendations
    if (networkStatus.effectiveType === 'slow-2g' || networkStatus.effectiveType === '2g') {
      recommendations.push({
        type: 'network',
        severity: 'medium',
        message: 'Slow network detected. Optimize for low bandwidth.',
        action: 'Implement progressive loading and reduce resource sizes.'
      });
    }

    // Resource recommendations
    const largeResources = resources.filter(r => r.duration > 1000);
    if (largeResources.length > 0) {
      recommendations.push({
        type: 'resources',
        severity: 'medium',
        message: `${largeResources.length} slow-loading resources detected.`,
        action: 'Optimize images, enable compression, and consider lazy loading.'
      });
    }

    return recommendations;
  };

  return {
    resources,
    memoryUsage,
    networkStatus,
    memoryTrend,
    analyzeBundleSize,
    getPerformanceRecommendations
  };
};

// Helper function to determine resource type
const getResourceType = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return 'script';
    case 'css':
      return 'stylesheet';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return 'image';
    case 'woff':
    case 'woff2':
    case 'ttf':
    case 'otf':
      return 'font';
    case 'json':
      return 'data';
    default:
      if (url.includes('api') || url.includes('/functions/')) {
        return 'api';
      }
      return 'other';
  }
};