
import { useCallback } from 'react';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

export const useEcommerceTracking = () => {
  const { trackEcommerceEvent } = useAnalyticsContext();

  const trackProductView = useCallback((productId: string, productName: string, category?: string) => {
    trackEcommerceEvent('product_view', productId, productName, category);
  }, [trackEcommerceEvent]);

  const trackAddToCart = useCallback((productId: string, productName: string, price: number, quantity: number = 1) => {
    trackEcommerceEvent('cart_add', productId, productName, undefined, quantity, price);
  }, [trackEcommerceEvent]);

  const trackRemoveFromCart = useCallback((productId: string, productName: string, quantity: number = 1) => {
    trackEcommerceEvent('cart_remove', productId, productName, undefined, quantity);
  }, [trackEcommerceEvent]);

  const trackPurchaseStart = useCallback((totalValue: number, itemCount: number) => {
    trackEcommerceEvent('purchase_start', undefined, undefined, undefined, itemCount, totalValue);
  }, [trackEcommerceEvent]);

  const trackPurchaseComplete = useCallback((
    orderId: string, 
    totalValue: number, 
    itemCount: number,
    items: Array<{id: string, name: string, price: number, quantity: number}>
  ) => {
    trackEcommerceEvent('purchase_complete', orderId, `Order with ${itemCount} items`, undefined, itemCount, totalValue, { items });
  }, [trackEcommerceEvent]);

  return {
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackPurchaseStart,
    trackPurchaseComplete,
  };
};
