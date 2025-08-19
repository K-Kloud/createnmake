import { useEffect, useCallback } from 'react';
import { usePerformanceMetrics } from './usePerformanceMetrics';
import { useRealTimeAnalytics } from './useRealTimeAnalytics';
import { useResourceMonitor } from './useResourceMonitor';
import { performanceMonitor } from '@/lib/performance';

interface LoadingPhase {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success?: boolean;
  error?: string;
}

export const useIntegratedPerformanceMonitor = () => {
  const { recordCustomMetric, startPerformanceTimer } = usePerformanceMetrics();
  const { queueEvent } = useRealTimeAnalytics();
  const { resources, memoryUsage } = useResourceMonitor();

  const trackLoadingPhase = useCallback(async (phase: LoadingPhase) => {
    // Record to performance metrics
    if (phase.duration) {
      await recordCustomMetric('loading_phase', phase.name, phase.duration, {
        success: phase.success,
        error: phase.error,
        timestamp: Date.now()
      });
    }

    // Queue for real-time analytics
    queueEvent('performance', {
      type: 'loading_phase',
      phase: phase.name,
      duration: phase.duration,
      success: phase.success,
      error: phase.error,
      memory: memoryUsage,
      resourceCount: resources.length
    });

    // Use centralized performance monitor
    if (phase.success === false && phase.error) {
      performanceMonitor.measure(`loading_error_${phase.name}`, () => {
        throw new Error(phase.error);
      });
    } else if (phase.duration) {
      performanceMonitor.measure(`loading_phase_${phase.name}`, () => phase.duration);
    }
  }, [recordCustomMetric, queueEvent, memoryUsage, resources.length]);

  const createPhaseTimer = useCallback((phaseName: string) => {
    const startTime = performance.now();
    const timer = startPerformanceTimer(`loading_phase_${phaseName}`);

    return {
      complete: async (success: boolean = true, error?: string) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        timer.end();
        
        await trackLoadingPhase({
          name: phaseName,
          startTime,
          endTime,
          duration,
          success,
          error
        });

        return duration;
      }
    };
  }, [startPerformanceTimer, trackLoadingPhase]);

  const trackCriticalResourceLoading = useCallback(async (resourceType: string, resourceName: string, loadTime: number) => {
    await recordCustomMetric('critical_resource', `${resourceType}_${resourceName}`, loadTime, {
      resourceType,
      resourceName,
      timestamp: Date.now()
    });

    queueEvent('performance', {
      type: 'critical_resource',
      resourceType,
      resourceName,
      loadTime,
      timestamp: Date.now()
    });
  }, [recordCustomMetric, queueEvent]);

  const trackComponentLoadingPerformance = useCallback(async (componentName: string, metrics: {
    mountTime: number;
    renderTime: number;
    propsProcessingTime?: number;
    errorBoundaryTriggered?: boolean;
  }) => {
    await recordCustomMetric('component_performance', componentName, metrics.mountTime, {
      renderTime: metrics.renderTime,
      propsProcessingTime: metrics.propsProcessingTime,
      errorBoundaryTriggered: metrics.errorBoundaryTriggered,
      timestamp: Date.now()
    });

    queueEvent('performance', {
      type: 'component_performance',
      componentName,
      ...metrics,
      timestamp: Date.now()
    });
  }, [recordCustomMetric, queueEvent]);

  // Monitor overall app loading performance
  useEffect(() => {
    const timer = createPhaseTimer('app_initialization');
    
    const checkAppReady = () => {
      if (document.readyState === 'complete' && window.performance) {
        timer.complete(true);
      }
    };

    if (document.readyState === 'complete') {
      checkAppReady();
    } else {
      window.addEventListener('load', checkAppReady);
      return () => window.removeEventListener('load', checkAppReady);
    }
  }, [createPhaseTimer]);

  return {
    trackLoadingPhase,
    createPhaseTimer,
    trackCriticalResourceLoading,
    trackComponentLoadingPerformance
  };
};