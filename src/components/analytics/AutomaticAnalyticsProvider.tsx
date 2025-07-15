import React, { useEffect } from 'react';
import { useAutoAnalytics } from '@/hooks/useAutoAnalytics';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { useAnalyticsContext } from '@/providers/AnalyticsProvider';

interface AutomaticAnalyticsProviderProps {
  children: React.ReactNode;
  enableAutoTracking?: boolean;
  enableRealTimeProcessing?: boolean;
  enableFunnelAutomation?: boolean;
}

// Enhanced provider that enables 100% automated analytics capture
export const AutomaticAnalyticsProvider: React.FC<AutomaticAnalyticsProviderProps> = ({
  children,
  enableAutoTracking = true,
  enableRealTimeProcessing = true,
  enableFunnelAutomation = true
}) => {
  const { trackConversionEvent, trackFeatureUsage } = useAnalyticsContext();
  const { queueEvent } = useRealTimeAnalytics();

  // Initialize automatic tracking
  useAutoAnalytics();

  // Setup automatic funnel tracking
  useEffect(() => {
    if (!enableFunnelAutomation) return;

    const setupFunnelAutomation = () => {
      // Define automatic funnel steps based on user actions
      const funnelSteps = {
        'user_registration': {
          funnel: 'user_onboarding',
          steps: [
            { action: 'visit_signup', step: 'landing', order: 1 },
            { action: 'start_form', step: 'form_start', order: 2 },
            { action: 'complete_form', step: 'form_complete', order: 3 },
            { action: 'email_verify', step: 'verification', order: 4 },
            { action: 'profile_setup', step: 'profile_complete', order: 5 }
          ]
        },
        'image_generation': {
          funnel: 'image_creation',
          steps: [
            { action: 'visit_generator', step: 'generator_visit', order: 1 },
            { action: 'enter_prompt', step: 'prompt_entry', order: 2 },
            { action: 'generate_image', step: 'generation_start', order: 3 },
            { action: 'view_result', step: 'result_view', order: 4 },
            { action: 'save_image', step: 'image_saved', order: 5 }
          ]
        },
        'subscription': {
          funnel: 'subscription_conversion',
          steps: [
            { action: 'view_pricing', step: 'pricing_page', order: 1 },
            { action: 'select_plan', step: 'plan_selection', order: 2 },
            { action: 'start_checkout', step: 'checkout_start', order: 3 },
            { action: 'payment_info', step: 'payment_entry', order: 4 },
            { action: 'complete_payment', step: 'payment_complete', order: 5 }
          ]
        }
      };

      // Track URL-based funnel progression
      const trackUrlFunnels = () => {
        const currentPath = window.location.pathname;
        
        // Registration funnel
        if (currentPath.includes('/auth') || currentPath.includes('/signup')) {
          trackConversionEvent('user_onboarding', 'landing', 1);
        }
        if (currentPath.includes('/verify')) {
          trackConversionEvent('user_onboarding', 'verification', 4);
        }
        if (currentPath.includes('/profile') || currentPath.includes('/onboarding')) {
          trackConversionEvent('user_onboarding', 'profile_complete', 5);
        }

        // Image generation funnel
        if (currentPath.includes('/generate') || currentPath.includes('/create')) {
          trackConversionEvent('image_creation', 'generator_visit', 1);
        }
        if (currentPath.includes('/gallery') || currentPath.includes('/my-images')) {
          trackConversionEvent('image_creation', 'result_view', 4);
        }

        // Subscription funnel
        if (currentPath.includes('/pricing')) {
          trackConversionEvent('subscription_conversion', 'pricing_page', 1);
        }
        if (currentPath.includes('/checkout') || currentPath.includes('/subscribe')) {
          trackConversionEvent('subscription_conversion', 'checkout_start', 3);
        }
        if (currentPath.includes('/success') || currentPath.includes('/welcome')) {
          trackConversionEvent('subscription_conversion', 'payment_complete', 5);
        }
      };

      // Track form-based funnel progression
      const setupFormTracking = () => {
        // Monitor form interactions
        document.addEventListener('input', (event) => {
          const target = event.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            const form = target.closest('form');
            if (form) {
              const formType = form.getAttribute('data-funnel') || 'unknown';
              trackConversionEvent(formType, 'form_interaction', 2);
            }
          }
        });

        document.addEventListener('submit', (event) => {
          const form = event.target as HTMLFormElement;
          const formType = form.getAttribute('data-funnel') || 'unknown';
          trackConversionEvent(formType, 'form_submit', 3);
        });
      };

      // Setup A/B test automation
      const setupABTestAutomation = () => {
        // Automatically assign users to A/B test variants
        const activeTests = [
          { name: 'pricing_page_layout', variants: ['control', 'variant_a', 'variant_b'] },
          { name: 'cta_button_color', variants: ['blue', 'green', 'orange'] },
          { name: 'onboarding_flow', variants: ['short', 'detailed'] }
        ];

        activeTests.forEach(test => {
          const userId = sessionStorage.getItem('user_id');
          if (userId) {
            // Use consistent hash-based assignment
            const hash = userId.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0);
            
            const variantIndex = Math.abs(hash) % test.variants.length;
            const variant = test.variants[variantIndex];
            
            // Store variant assignment
            sessionStorage.setItem(`ab_test_${test.name}`, variant);
            
            // Track assignment
            trackFeatureUsage('ab_test', test.name, { variant, userId });
          }
        });
      };

      trackUrlFunnels();
      setupFormTracking();
      setupABTestAutomation();

      // Re-check funnels on navigation
      window.addEventListener('popstate', trackUrlFunnels);
      
      return () => {
        window.removeEventListener('popstate', trackUrlFunnels);
      };
    };

    const cleanup = setupFunnelAutomation();
    return cleanup;
  }, [enableFunnelAutomation, trackConversionEvent, trackFeatureUsage]);

  // Setup cross-session user journey tracking
  useEffect(() => {
    const setupUserJourneyTracking = () => {
      // Generate or retrieve user fingerprint for cross-session tracking
      const generateFingerprint = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillText('Browser fingerprint', 2, 2);
        }
        
        const fingerprint = {
          screen: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          platform: navigator.platform,
          canvas: canvas.toDataURL(),
          userAgent: navigator.userAgent.slice(0, 100) // Truncated for privacy
        };

        return btoa(JSON.stringify(fingerprint)).slice(0, 32);
      };

      const fingerprint = generateFingerprint();
      sessionStorage.setItem('user_fingerprint', fingerprint);

      // Track user journey across sessions
      const journeyData = {
        fingerprint,
        sessionId: sessionStorage.getItem('analytics_session_id'),
        timestamp: Date.now(),
        currentPath: window.location.pathname,
        referrer: document.referrer
      };

      trackFeatureUsage('user_journey', 'session_start', journeyData);
    };

    setupUserJourneyTracking();
  }, [trackFeatureUsage]);

  return <>{children}</>;
};