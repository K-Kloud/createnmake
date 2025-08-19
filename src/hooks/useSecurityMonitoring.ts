/**
 * Security Monitoring Hook
 * Provides real-time security monitoring and threat detection
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SecurityMetrics {
  failedLogins: number;
  suspiciousRequests: number;
  dataExfiltrationAttempts: number;
  lastThreatDetected: Date | null;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityAlert {
  id: string;
  type: 'authentication' | 'data_access' | 'rate_limit' | 'injection' | 'xss';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  details: Record<string, any>;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const metricsRef = useRef<SecurityMetrics>({
    failedLogins: 0,
    suspiciousRequests: 0,
    dataExfiltrationAttempts: 0,
    lastThreatDetected: null,
    riskLevel: 'low'
  });

  // Monitor authentication events
  const monitorAuthEvents = useCallback(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await logSecurityEvent('user_login', {
            user_id: session.user.id,
            login_method: session.user.app_metadata.provider || 'email',
            ip_address: 'client-detected'
          });
        } else if (event === 'SIGNED_OUT') {
          await logSecurityEvent('user_logout', {
            timestamp: new Date().toISOString()
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Monitor suspicious activity patterns
  const detectSuspiciousActivity = useCallback(() => {
    let requestCount = 0;
    let lastRequestTime = Date.now();
    
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const now = Date.now();
      requestCount++;
      
      // Rate limiting detection
      if (now - lastRequestTime < 100 && requestCount > 10) {
        await logSecurityEvent('rapid_requests_detected', {
          request_count: requestCount,
          time_window: now - lastRequestTime,
          url: args[0]?.toString()
        });
        
        metricsRef.current.suspiciousRequests++;
        updateRiskLevel();
      }
      
      lastRequestTime = now;
      
      try {
        const response = await originalFetch(...args);
        
        // Monitor for data exfiltration attempts
        if (args[0]?.toString().includes('/api/') && response.status === 403) {
          metricsRef.current.dataExfiltrationAttempts++;
          await logSecurityEvent('unauthorized_api_access', {
            url: args[0]?.toString(),
            status: response.status,
            user_id: user?.id
          });
        }
        
        return response;
      } catch (error) {
        await logSecurityEvent('network_error', {
          url: args[0]?.toString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    };

    // Cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, [user?.id]);

  // Monitor DOM manipulation attempts
  const monitorDOMSecurity = useCallback(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for script injection
              if (element.tagName === 'SCRIPT') {
                logSecurityEvent('script_injection_attempt', {
                  script_content: element.textContent?.substring(0, 200),
                  source: 'dom_mutation'
                });
                element.remove();
              }
              
              // Check for suspicious attributes
              const suspiciousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover'];
              suspiciousAttrs.forEach(attr => {
                if (element.hasAttribute(attr)) {
                  logSecurityEvent('suspicious_attribute_detected', {
                    attribute: attr,
                    value: element.getAttribute(attr)?.substring(0, 100),
                    tag: element.tagName
                  });
                  element.removeAttribute(attr);
                }
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'onerror', 'onload', 'onmouseover']
    });

    return () => observer.disconnect();
  }, []);

  // Log security events
  const logSecurityEvent = useCallback(async (
    eventType: string, 
    details: Record<string, any>
  ) => {
    try {
      await supabase.from('security_events').insert({
        event_type: eventType,
        user_id: user?.id,
        details,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip_address: 'client-side',
        severity: calculateSeverity(eventType)
      });
      
      metricsRef.current.lastThreatDetected = new Date();
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user?.id]);

  // Calculate event severity
  const calculateSeverity = (eventType: string): 'low' | 'medium' | 'high' | 'critical' => {
    const criticalEvents = ['script_injection_attempt', 'sql_injection_attempt'];
    const highEvents = ['unauthorized_api_access', 'rapid_requests_detected'];
    const mediumEvents = ['suspicious_attribute_detected', 'data_access_violation'];
    
    if (criticalEvents.includes(eventType)) return 'critical';
    if (highEvents.includes(eventType)) return 'high';
    if (mediumEvents.includes(eventType)) return 'medium';
    return 'low';
  };

  // Update risk level based on metrics
  const updateRiskLevel = useCallback(() => {
    const metrics = metricsRef.current;
    let riskScore = 0;
    
    riskScore += metrics.failedLogins * 2;
    riskScore += metrics.suspiciousRequests * 1;
    riskScore += metrics.dataExfiltrationAttempts * 5;
    
    if (riskScore >= 20) metrics.riskLevel = 'critical';
    else if (riskScore >= 10) metrics.riskLevel = 'high';
    else if (riskScore >= 5) metrics.riskLevel = 'medium';
    else metrics.riskLevel = 'low';
  }, []);

  // Get current security metrics
  const getMetrics = useCallback((): SecurityMetrics => {
    return { ...metricsRef.current };
  }, []);

  // Initialize monitoring
  useEffect(() => {
    const cleanupAuth = monitorAuthEvents();
    const cleanupActivity = detectSuspiciousActivity();
    const cleanupDOM = monitorDOMSecurity();
    
    return () => {
      cleanupAuth();
      cleanupActivity();
      cleanupDOM();
    };
  }, [monitorAuthEvents, detectSuspiciousActivity, monitorDOMSecurity]);

  // Monitor console for potential debug leaks
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };

    // Override console methods in production
    if (import.meta.env.PROD) {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
    }

    return () => {
      // Restore original console methods
      Object.assign(console, originalConsole);
    };
  }, []);

  return {
    getMetrics,
    logSecurityEvent,
    updateRiskLevel
  };
};