
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Generate a unique session ID for this browser session
const generateSessionId = () => {
  const existing = sessionStorage.getItem('analytics_session_id');
  if (existing) return existing;
  
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('analytics_session_id', sessionId);
  return sessionId;
};

export const useAnalytics = () => {
  const { user } = useAuth();
  const sessionId = generateSessionId();
  const pageStartTime = useRef<number>(Date.now());
  const currentPath = useRef<string>('');

  // Track page view
  const trackPageView = useCallback(async (path: string, title?: string) => {
    try {
      currentPath.current = path;
      pageStartTime.current = Date.now();
      
      await supabase.from('page_analytics').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        page_path: path,
        page_title: title || document.title,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, [user?.id, sessionId]);

  // Track time spent on page when leaving
  const trackPageExit = useCallback(async (path: string) => {
    try {
      const timeSpent = Math.floor((Date.now() - pageStartTime.current) / 1000);
      
      await supabase.from('page_analytics').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        page_path: path,
        time_spent_seconds: timeSpent,
        exit_page: true,
      });
    } catch (error) {
      console.error('Error tracking page exit:', error);
    }
  }, [user?.id, sessionId]);

  // Track UI interactions (button clicks, menu interactions, etc.)
  const trackInteraction = useCallback(async (
    elementType: string,
    elementId?: string,
    elementText?: string,
    metadata?: any
  ) => {
    try {
      await supabase.from('ui_interactions').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        element_type: elementType,
        element_id: elementId || null,
        element_text: elementText || null,
        page_path: window.location.pathname,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [user?.id, sessionId]);

  // Track e-commerce events
  const trackEcommerceEvent = useCallback(async (
    eventType: string,
    productId?: string,
    productName?: string,
    productCategory?: string,
    quantity?: number,
    price?: number,
    metadata?: any
  ) => {
    try {
      await supabase.from('ecommerce_events').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        event_type: eventType,
        product_id: productId || null,
        product_name: productName || null,
        product_category: productCategory || null,
        quantity: quantity || 1,
        price: price || null,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error tracking ecommerce event:', error);
    }
  }, [user?.id, sessionId]);

  // Track performance metrics
  const trackPerformance = useCallback(async (
    metricType: string,
    metricName: string,
    durationMs: number,
    success: boolean = true,
    errorMessage?: string,
    metadata?: any
  ) => {
    try {
      await supabase.from('performance_metrics').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        metric_type: metricType,
        metric_name: metricName,
        duration_ms: durationMs,
        success,
        error_message: errorMessage || null,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }, [user?.id, sessionId]);

  // Track feature usage
  const trackFeatureUsage = useCallback(async (
    featureName: string,
    featureCategory: string,
    usageData?: any
  ) => {
    try {
      await supabase.from('feature_usage').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        feature_name: featureName,
        feature_category: featureCategory,
        usage_data: usageData || {},
      });
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  }, [user?.id, sessionId]);

  // Track search queries
  const trackSearch = useCallback(async (
    searchQuery: string,
    searchType: string,
    resultsCount: number = 0,
    clickedPosition?: number
  ) => {
    try {
      await supabase.from('search_analytics').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        search_query: searchQuery,
        search_type: searchType,
        results_count: resultsCount,
        clicked_result_position: clickedPosition || null,
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }, [user?.id, sessionId]);

  // Track conversion funnel events
  const trackConversionEvent = useCallback(async (
    funnelName: string,
    funnelStep: string,
    stepOrder: number,
    completed: boolean = true,
    metadata?: any
  ) => {
    try {
      await supabase.from('conversion_events').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        funnel_name: funnelName,
        funnel_step: funnelStep,
        step_order: stepOrder,
        completed,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error tracking conversion event:', error);
    }
  }, [user?.id, sessionId]);

  // Track A/B test events
  const trackABTestEvent = useCallback(async (
    testName: string,
    variant: string,
    eventType: string,
    metadata?: any
  ) => {
    try {
      await supabase.from('ab_test_events').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        test_name: testName,
        variant,
        event_type: eventType,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error tracking AB test event:', error);
    }
  }, [user?.id, sessionId]);

  // Initialize session tracking
  useEffect(() => {
    const initSession = async () => {
      try {
        await supabase.from('user_sessions').upsert({
          user_id: user?.id || null,
          session_id: sessionId,
          device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser: navigator.userAgent.split(' ').pop() || 'unknown',
        });
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };

    initSession();
  }, [user?.id, sessionId]);

  // Track page visibility changes and exit
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && currentPath.current) {
        trackPageExit(currentPath.current);
      }
    };

    const handleBeforeUnload = () => {
      if (currentPath.current) {
        navigator.sendBeacon('/api/analytics/page-exit', JSON.stringify({
          path: currentPath.current,
          timeSpent: Math.floor((Date.now() - pageStartTime.current) / 1000),
          sessionId,
          userId: user?.id,
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackPageExit, user?.id, sessionId]);

  return {
    sessionId,
    trackPageView,
    trackPageExit,
    trackInteraction,
    trackEcommerceEvent,
    trackPerformance,
    trackFeatureUsage,
    trackSearch,
    trackConversionEvent,
    trackABTestEvent,
  };
};
