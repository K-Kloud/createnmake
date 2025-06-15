
import { useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

export const useClickTracking = () => {
  const { trackInteraction } = useAnalytics();

  const trackClick = useCallback((
    element: HTMLElement,
    customType?: string,
    metadata?: any
  ) => {
    const elementType = customType || element.tagName.toLowerCase();
    const elementId = element.id || undefined;
    const elementText = element.textContent?.trim() || undefined;
    
    trackInteraction(elementType, elementId, elementText, metadata);
  }, [trackInteraction]);

  const trackButtonClick = useCallback((buttonText: string, buttonId?: string, metadata?: any) => {
    trackInteraction('button', buttonId, buttonText, metadata);
  }, [trackInteraction]);

  const trackLinkClick = useCallback((linkText: string, href: string, metadata?: any) => {
    trackInteraction('link', href, linkText, { href, ...metadata });
  }, [trackInteraction]);

  const trackMenuClick = useCallback((menuItem: string, menuSection?: string) => {
    trackInteraction('menu_item', menuSection, menuItem, { section: menuSection });
  }, [trackInteraction]);

  return {
    trackClick,
    trackButtonClick,
    trackLinkClick,
    trackMenuClick,
  };
};
