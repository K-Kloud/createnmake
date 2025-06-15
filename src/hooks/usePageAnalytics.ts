
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from './useAnalytics';

export const usePageAnalytics = () => {
  const location = useLocation();
  const { trackPageView, trackPerformance } = useAnalytics();

  useEffect(() => {
    const startTime = performance.now();
    
    // Track page view
    trackPageView(location.pathname, document.title);

    // Track page load performance
    const trackPageLoad = () => {
      const loadTime = performance.now() - startTime;
      trackPerformance('page_load', location.pathname, Math.round(loadTime));
    };

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
      return () => window.removeEventListener('load', trackPageLoad);
    }
  }, [location.pathname, trackPageView, trackPerformance]);
};
