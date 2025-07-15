import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AnalyticsEvent {
  type: string;
  data: any;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

// Real-time analytics processing and alerting system
export const useRealTimeAnalytics = () => {
  const { user } = useAuth();
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);
  const processingIntervalRef = useRef<NodeJS.Timeout>();
  const thresholdCheckIntervalRef = useRef<NodeJS.Timeout>();

  // Performance thresholds for alerting
  const PERFORMANCE_THRESHOLDS = {
    page_load: 3000, // 3 seconds
    lcp: 2500, // 2.5 seconds
    fid: 100, // 100ms
    cls: 0.1, // Cumulative Layout Shift
    error_rate: 0.05, // 5% error rate
    bounce_rate: 0.8 // 80% bounce rate
  };

  // Queue analytics events for batch processing
  const queueEvent = useCallback((type: string, data: any) => {
    const event: AnalyticsEvent = {
      type,
      data,
      timestamp: Date.now(),
      sessionId: sessionStorage.getItem('analytics_session_id') || '',
      userId: user?.id
    };

    eventQueueRef.current.push(event);
  }, [user?.id]);

  // Process events in batches for better performance
  const processEventQueue = useCallback(async () => {
    if (eventQueueRef.current.length === 0) return;

    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];

    try {
      // Group events by type for efficient processing
      const groupedEvents = events.reduce((groups, event) => {
        if (!groups[event.type]) groups[event.type] = [];
        groups[event.type].push(event);
        return groups;
      }, {} as Record<string, AnalyticsEvent[]>);

      // Process different event types
      for (const [type, typeEvents] of Object.entries(groupedEvents)) {
        await processEventType(type, typeEvents);
      }
    } catch (error) {
      console.error('Error processing analytics events:', error);
      // Re-queue failed events
      eventQueueRef.current.unshift(...events);
    }
  }, []);

  // Process specific event types with specialized logic
  const processEventType = useCallback(async (type: string, events: AnalyticsEvent[]) => {
    switch (type) {
      case 'performance':
        await processPerformanceEvents(events);
        break;
      case 'user_interaction':
        await processInteractionEvents(events);
        break;
      case 'error':
        await processErrorEvents(events);
        break;
      case 'conversion':
        await processConversionEvents(events);
        break;
      default:
        await processGenericEvents(events);
    }
  }, []);

  // Performance event processing with alerting
  const processPerformanceEvents = useCallback(async (events: AnalyticsEvent[]) => {
    const performanceData = events.map(event => ({
      user_id: event.userId,
      session_id: event.sessionId,
      metric_type: event.data.metricType,
      metric_name: event.data.metricName,
      duration_ms: event.data.duration,
      success: event.data.success ?? true,
      error_message: event.data.errorMessage,
      metadata: event.data.metadata || {},
      timestamp: new Date(event.timestamp).toISOString()
    }));

    // Batch insert performance metrics
    const { error } = await supabase
      .from('performance_metrics')
      .insert(performanceData);

    if (error) {
      console.error('Error inserting performance metrics:', error);
      return;
    }

    // Check for performance threshold violations
    for (const event of events) {
      const { metricName, duration } = event.data;
      const threshold = PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS];
      
      if (threshold && duration > threshold) {
        await triggerPerformanceAlert(metricName, duration, threshold, event);
      }
    }
  }, []);

  // User interaction event processing
  const processInteractionEvents = useCallback(async (events: AnalyticsEvent[]) => {
    const interactionData = events.map(event => ({
      user_id: event.userId,
      session_id: event.sessionId,
      element_type: event.data.elementType,
      element_id: event.data.elementId,
      element_text: event.data.elementText,
      page_path: window.location.pathname,
      metadata: event.data.metadata || {},
      timestamp: new Date(event.timestamp).toISOString()
    }));

    const { error } = await supabase
      .from('ui_interactions')
      .insert(interactionData);

    if (error) {
      console.error('Error inserting UI interactions:', error);
    }
  }, []);

  // Error event processing with immediate alerting
  const processErrorEvents = useCallback(async (events: AnalyticsEvent[]) => {
    const errorData = events.map(event => ({
      user_id: event.userId,
      error_type: event.data.errorType || 'javascript',
      error_message: event.data.message,
      error_details: event.data.metadata || {},
      occurred_at: new Date(event.timestamp).toISOString()
    }));

    const { error } = await supabase
      .from('error_logs')
      .insert(errorData);

    if (error) {
      console.error('Error inserting error logs:', error);
    }

    // Trigger immediate alerts for critical errors
    for (const event of events) {
      await triggerErrorAlert(event);
    }
  }, []);

  // Conversion event processing with funnel automation
  const processConversionEvents = useCallback(async (events: AnalyticsEvent[]) => {
    const conversionData = events.map(event => ({
      user_id: event.userId,
      session_id: event.sessionId,
      funnel_name: event.data.funnelName,
      funnel_step: event.data.funnelStep,
      step_order: event.data.stepOrder,
      completed: event.data.completed ?? true,
      metadata: event.data.metadata || {},
      timestamp: new Date(event.timestamp).toISOString()
    }));

    const { error } = await supabase
      .from('conversion_events')
      .insert(conversionData);

    if (error) {
      console.error('Error inserting conversion events:', error);
    }
  }, []);

  // Generic event processing
  const processGenericEvents = useCallback(async (events: AnalyticsEvent[]) => {
    // Process other types of events as needed
    console.log('Processing generic events:', events.length);
  }, []);

  // Trigger performance alerts
  const triggerPerformanceAlert = useCallback(async (
    metricName: string, 
    actualValue: number, 
    threshold: number, 
    event: AnalyticsEvent
  ) => {
    try {
      await supabase.functions.invoke('realtime-notification-processor', {
        body: {
          type: 'performance_alert',
          data: {
            metricName,
            actualValue,
            threshold,
            userId: event.userId,
            sessionId: event.sessionId,
            severity: actualValue > threshold * 2 ? 'critical' : 'warning'
          }
        }
      });
    } catch (error) {
      console.error('Error triggering performance alert:', error);
    }
  }, []);

  // Trigger error alerts
  const triggerErrorAlert = useCallback(async (event: AnalyticsEvent) => {
    try {
      await supabase.functions.invoke('realtime-notification-processor', {
        body: {
          type: 'error_alert',
          data: {
            errorMessage: event.data.message,
            errorType: event.data.errorType,
            userId: event.userId,
            sessionId: event.sessionId,
            timestamp: event.timestamp
          }
        }
      });
    } catch (error) {
      console.error('Error triggering error alert:', error);
    }
  }, []);

  // Monitor real-time thresholds
  const checkThresholds = useCallback(async () => {
    try {
      // Check recent error rates
      const { data: recentErrors } = await supabase
        .from('error_logs')
        .select('id')
        .gte('occurred_at', new Date(Date.now() - 300000).toISOString()); // Last 5 minutes

      const { data: recentSessions } = await supabase
        .from('user_sessions')
        .select('session_id')
        .gte('created_at', new Date(Date.now() - 300000).toISOString());

      if (recentErrors && recentSessions) {
        const errorRate = recentErrors.length / Math.max(recentSessions.length, 1);
        if (errorRate > PERFORMANCE_THRESHOLDS.error_rate) {
          await triggerSystemAlert('high_error_rate', { errorRate, threshold: PERFORMANCE_THRESHOLDS.error_rate });
        }
      }
    } catch (error) {
      console.error('Error checking thresholds:', error);
    }
  }, []);

  // Trigger system-wide alerts
  const triggerSystemAlert = useCallback(async (alertType: string, data: any) => {
    try {
      await supabase.functions.invoke('realtime-notification-processor', {
        body: {
          type: 'system_alert',
          data: {
            alertType,
            ...data,
            timestamp: Date.now()
          }
        }
      });
    } catch (error) {
      console.error('Error triggering system alert:', error);
    }
  }, []);

  // Initialize real-time processing
  useEffect(() => {
    // Process events every 5 seconds
    processingIntervalRef.current = setInterval(processEventQueue, 5000);
    
    // Check thresholds every minute
    thresholdCheckIntervalRef.current = setInterval(checkThresholds, 60000);

    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
      if (thresholdCheckIntervalRef.current) {
        clearInterval(thresholdCheckIntervalRef.current);
      }
    };
  }, [processEventQueue, checkThresholds]);

  return {
    queueEvent,
    processNow: processEventQueue
  };
};