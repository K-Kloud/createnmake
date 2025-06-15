
import { useEffect } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

export const PerformanceTracker: React.FC = () => {
  const { trackPerformance } = useAnalyticsContext();

  useEffect(() => {
    // Track Core Web Vitals
    const trackWebVitals = () => {
      // Track First Contentful Paint (FCP)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            trackPerformance('web_vital', 'first_contentful_paint', entry.startTime);
          }
          if (entry.name === 'largest-contentful-paint') {
            trackPerformance('web_vital', 'largest_contentful_paint', entry.startTime);
          }
        }
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

      // Track Cumulative Layout Shift (CLS)
      let cumulativeLayoutShift = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          cumulativeLayoutShift += (entry as any).value;
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Report CLS on page visibility change
      const reportCLS = () => {
        trackPerformance('web_vital', 'cumulative_layout_shift', cumulativeLayoutShift * 1000); // Convert to ms equivalent
      };

      document.addEventListener('visibilitychange', reportCLS);

      return () => {
        observer.disconnect();
        clsObserver.disconnect();
        document.removeEventListener('visibilitychange', reportCLS);
      };
    };

    // Track API response times by intercepting fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        
        trackPerformance('api_response', url, Math.round(duration), response.ok, 
          response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`);
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        
        trackPerformance('api_response', url, Math.round(duration), false, 
          error instanceof Error ? error.message : 'Network error');
        
        throw error;
      }
    };

    const cleanup = trackWebVitals();

    return () => {
      window.fetch = originalFetch;
      if (cleanup) cleanup();
    };
  }, [trackPerformance]);

  return null; // This component doesn't render anything
};
