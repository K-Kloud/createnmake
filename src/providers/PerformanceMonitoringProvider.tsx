import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useIntegratedPerformanceMonitor } from '@/hooks/useIntegratedPerformanceMonitor';
import { PerformanceTracker } from '@/components/analytics/PerformanceTracker';

interface PerformanceMetrics {
  appLoadTime: number | null;
  criticalResourcesLoaded: number;
  componentMountTimes: Record<string, number>;
  errorBoundaryTriggers: number;
  lastUpdateTime: number;
}

interface PerformanceMonitoringContextType {
  metrics: PerformanceMetrics;
  isMonitoring: boolean;
  trackComponentMount: (componentName: string, mountTime: number) => void;
  trackErrorBoundary: (componentName: string) => void;
  trackCriticalResource: (resourceName: string, loadTime: number) => void;
  createLoadingTimer: (phaseName: string) => { complete: (success?: boolean, error?: string) => Promise<number> };
}

const PerformanceMonitoringContext = createContext<PerformanceMonitoringContextType | undefined>(undefined);

export const usePerformanceMonitoringContext = () => {
  const context = useContext(PerformanceMonitoringContext);
  if (!context) {
    throw new Error('usePerformanceMonitoringContext must be used within a PerformanceMonitoringProvider');
  }
  return context;
};

interface PerformanceMonitoringProviderProps {
  children: React.ReactNode;
}

export const PerformanceMonitoringProvider: React.FC<PerformanceMonitoringProviderProps> = ({ children }) => {
  const {
    trackLoadingPhase,
    createPhaseTimer,
    trackCriticalResourceLoading,
    trackComponentLoadingPerformance
  } = useIntegratedPerformanceMonitor();

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    appLoadTime: null,
    criticalResourcesLoaded: 0,
    componentMountTimes: {},
    errorBoundaryTriggers: 0,
    lastUpdateTime: Date.now()
  });

  const [isMonitoring] = useState(true);

  const trackComponentMount = useCallback(async (componentName: string, mountTime: number) => {
    setMetrics(prev => ({
      ...prev,
      componentMountTimes: {
        ...prev.componentMountTimes,
        [componentName]: mountTime
      },
      lastUpdateTime: Date.now()
    }));

    await trackComponentLoadingPerformance(componentName, {
      mountTime,
      renderTime: mountTime // Simplified for now
    });
  }, [trackComponentLoadingPerformance]);

  const trackErrorBoundary = useCallback((componentName: string) => {
    setMetrics(prev => ({
      ...prev,
      errorBoundaryTriggers: prev.errorBoundaryTriggers + 1,
      lastUpdateTime: Date.now()
    }));

    trackComponentLoadingPerformance(componentName, {
      mountTime: 0,
      renderTime: 0,
      errorBoundaryTriggered: true
    });
  }, [trackComponentLoadingPerformance]);

  const trackCriticalResource = useCallback(async (resourceName: string, loadTime: number) => {
    setMetrics(prev => ({
      ...prev,
      criticalResourcesLoaded: prev.criticalResourcesLoaded + 1,
      lastUpdateTime: Date.now()
    }));

    await trackCriticalResourceLoading('critical', resourceName, loadTime);
  }, [trackCriticalResourceLoading]);

  const createLoadingTimer = useCallback((phaseName: string) => {
    return createPhaseTimer(phaseName);
  }, [createPhaseTimer]);

  // Track initial app load time
  useEffect(() => {
    const measureAppLoadTime = () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        setMetrics(prev => ({
          ...prev,
          appLoadTime: loadTime,
          lastUpdateTime: Date.now()
        }));

        trackLoadingPhase({
          name: 'complete_app_load',
          startTime: timing.navigationStart,
          endTime: timing.loadEventEnd,
          duration: loadTime,
          success: true
        });
      }
    };

    if (document.readyState === 'complete') {
      measureAppLoadTime();
    } else {
      window.addEventListener('load', measureAppLoadTime);
      return () => window.removeEventListener('load', measureAppLoadTime);
    }
  }, [trackLoadingPhase]);

  const value: PerformanceMonitoringContextType = {
    metrics,
    isMonitoring,
    trackComponentMount,
    trackErrorBoundary,
    trackCriticalResource,
    createLoadingTimer
  };

  return (
    <PerformanceMonitoringContext.Provider value={value}>
      <PerformanceTracker />
      {children}
    </PerformanceMonitoringContext.Provider>
  );
};