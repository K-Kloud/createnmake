
import { useCallback } from 'react';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

export const useConversionTracking = () => {
  const { trackConversionEvent } = useAnalyticsContext();

  const trackVisitorToUser = useCallback(() => {
    trackConversionEvent('visitor_to_user', 'account_created', 1);
  }, [trackConversionEvent]);

  const trackUserToCreator = useCallback(() => {
    trackConversionEvent('user_to_creator', 'creator_onboarding_complete', 1);
  }, [trackConversionEvent]);

  const trackCreatorToSubscriber = useCallback((planName: string) => {
    trackConversionEvent('creator_to_subscriber', 'subscription_activated', 1, true, { plan: planName });
  }, [trackConversionEvent]);

  const trackImageGenerationFunnel = useCallback((step: 'started' | 'completed' | 'failed', metadata?: any) => {
    const stepOrder = step === 'started' ? 1 : step === 'completed' ? 2 : 0;
    trackConversionEvent('image_generation', step, stepOrder, step !== 'failed', metadata);
  }, [trackConversionEvent]);

  const trackMarketplacePurchaseFunnel = useCallback((
    step: 'product_viewed' | 'add_to_cart' | 'checkout_started' | 'purchase_completed',
    productId?: string
  ) => {
    const stepMap = {
      'product_viewed': 1,
      'add_to_cart': 2,
      'checkout_started': 3,
      'purchase_completed': 4
    };
    
    trackConversionEvent('marketplace_purchase', step, stepMap[step], true, { productId });
  }, [trackConversionEvent]);

  return {
    trackVisitorToUser,
    trackUserToCreator,
    trackCreatorToSubscriber,
    trackImageGenerationFunnel,
    trackMarketplacePurchaseFunnel,
  };
};
