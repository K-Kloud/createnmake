
import React, { createContext, useContext, ReactNode } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';

interface AnalyticsContextType {
  trackInteraction: (elementType: string, elementId?: string, elementText?: string, metadata?: any) => void;
  trackEcommerceEvent: (eventType: string, productId?: string, productName?: string, productCategory?: string, quantity?: number, price?: number, metadata?: any) => void;
  trackFeatureUsage: (featureName: string, featureCategory: string, usageData?: any) => void;
  trackSearch: (searchQuery: string, searchType: string, resultsCount?: number, clickedPosition?: number) => void;
  trackConversionEvent: (funnelName: string, funnelStep: string, stepOrder: number, completed?: boolean, metadata?: any) => void;
  trackPerformance: (metricType: string, metricName: string, durationMs: number, success?: boolean, errorMessage?: string, metadata?: any) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    // Return a no-op implementation instead of throwing an error
    return {
      trackInteraction: () => {},
      trackEcommerceEvent: () => {},
      trackFeatureUsage: () => {},
      trackSearch: () => {},
      trackConversionEvent: () => {},
      trackPerformance: () => {},
    };
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const analytics = useAnalytics();
  
  // Enable automatic page tracking
  usePageAnalytics();

  const value: AnalyticsContextType = {
    trackInteraction: analytics.trackInteraction,
    trackEcommerceEvent: analytics.trackEcommerceEvent,
    trackFeatureUsage: analytics.trackFeatureUsage,
    trackSearch: analytics.trackSearch,
    trackConversionEvent: analytics.trackConversionEvent,
    trackPerformance: analytics.trackPerformance,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
