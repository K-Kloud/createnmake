import { useEffect, useRef, useCallback } from 'react';
import { useAnalyticsContext } from '@/providers/AnalyticsProvider';
import { useAuth } from './useAuth';

// Enhanced automatic UI tracking with comprehensive event capture
export const useAutoAnalytics = () => {
  const { trackInteraction, trackPerformance, trackFeatureUsage } = useAnalyticsContext();
  const { user } = useAuth();
  const performanceObserverRef = useRef<PerformanceObserver>();
  const mutationObserverRef = useRef<MutationObserver>();
  
  // Generate unique element identifier with null safety
  const getElementIdentifier = useCallback((element: Element): string => {
    if (!element) return 'unknown';
    if (element.id) return element.id;
    if (element.className && typeof element.className === 'string') {
      return `.${element.className.split(' ').filter(Boolean).join('.')}`;
    }
    return element.tagName?.toLowerCase() || 'unknown';
  }, []);

  // Track all user interactions automatically
  const setupGlobalEventTracking = useCallback(() => {
    const trackEvent = (event: Event) => {
      try {
        const target = event.target as Element;
        if (!target || !target.tagName) return;

        const elementId = getElementIdentifier(target);
        const elementText = target.textContent?.slice(0, 100) || '';
        
        const metadata = {
          eventType: event.type,
          timestamp: Date.now(),
          elementTag: target.tagName || 'unknown',
          elementClasses: typeof target.className === 'string' ? target.className : '',
          pageX: (event as MouseEvent).pageX || 0,
          pageY: (event as MouseEvent).pageY || 0,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };

        // Track different types of interactions
        switch (event.type) {
          case 'click':
            trackInteraction('click', elementId, elementText, metadata);
            break;
          case 'input':
            trackInteraction('input', elementId, '', { ...metadata, inputType: (target as HTMLInputElement).type });
            break;
          case 'submit':
            trackInteraction('form_submit', elementId, '', metadata);
            break;
          case 'focus':
            trackInteraction('focus', elementId, '', metadata);
            break;
          case 'blur':
            trackInteraction('blur', elementId, '', metadata);
            break;
          case 'scroll':
            const scrollPercentage = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            trackInteraction('scroll', 'window', '', { ...metadata, scrollPercentage });
            break;
        }
      } catch (error) {
        console.error('Error in trackEvent:', error);
      }
    };

    // Add comprehensive event listeners
    const events = ['click', 'input', 'submit', 'focus', 'blur', 'scroll', 'keydown'];
    events.forEach(eventType => {
      document.addEventListener(eventType, trackEvent, true);
    });

    return () => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, trackEvent, true);
      });
    };
  }, [trackInteraction, getElementIdentifier]);

  // Setup performance monitoring
  const setupPerformanceTracking = useCallback(() => {
    if (!window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          trackPerformance('navigation', 'page_load', navEntry.loadEventEnd - navEntry.fetchStart);
          trackPerformance('navigation', 'dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
          trackPerformance('navigation', 'first_byte', navEntry.responseStart - navEntry.fetchStart);
        }
        
        if (entry.entryType === 'paint') {
          trackPerformance('paint', entry.name, entry.startTime);
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          trackPerformance('lcp', 'largest_contentful_paint', entry.startTime);
        }
        
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming;
          trackPerformance('fid', 'first_input_delay', fidEntry.processingStart - fidEntry.startTime);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input'] });
    performanceObserverRef.current = observer;

    return () => observer.disconnect();
  }, [trackPerformance]);

  // Setup DOM mutation tracking for dynamic content
  const setupMutationTracking = useCallback(() => {
    if (!window.MutationObserver) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          trackFeatureUsage('dom_mutation', 'content_added', {
            addedNodes: mutation.addedNodes.length,
            targetElement: getElementIdentifier(mutation.target as Element)
          });
        }
      });
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-*']
    });
    
    mutationObserverRef.current = observer;

    return () => observer.disconnect();
  }, [trackFeatureUsage, getElementIdentifier]);

  // Setup error tracking
  const setupErrorTracking = useCallback(() => {
    const handleError = (event: ErrorEvent) => {
      trackPerformance('error', 'javascript_error', 0, false, event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackPerformance('error', 'unhandled_promise_rejection', 0, false, String(event.reason), {
        reason: event.reason
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackPerformance]);

  // Setup visibility and engagement tracking
  const setupVisibilityTracking = useCallback(() => {
    let startTime = Date.now();
    let isVisible = !document.hidden;

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden) {
        if (isVisible) {
          trackFeatureUsage('engagement', 'page_visible_time', {
            duration: now - startTime,
            userId: user?.id
          });
        }
        isVisible = false;
      } else {
        isVisible = true;
        startTime = now;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [trackFeatureUsage, user?.id]);

  // Initialize all tracking systems
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    cleanupFunctions.push(setupGlobalEventTracking());
    cleanupFunctions.push(setupPerformanceTracking());
    cleanupFunctions.push(setupMutationTracking());
    cleanupFunctions.push(setupErrorTracking());
    cleanupFunctions.push(setupVisibilityTracking());

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup?.());
      performanceObserverRef.current?.disconnect();
      mutationObserverRef.current?.disconnect();
    };
  }, [
    setupGlobalEventTracking,
    setupPerformanceTracking,
    setupMutationTracking,
    setupErrorTracking,
    setupVisibilityTracking
  ]);

  return {
    // Expose manual tracking methods for specific use cases
    trackCustomEvent: trackInteraction,
    trackCustomPerformance: trackPerformance,
    trackCustomFeature: trackFeatureUsage
  };
};