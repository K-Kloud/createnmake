// Phase 2: Translation fallback hook for graceful degradation
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

// Hardcoded fallbacks for critical UI text
const fallbackTexts = {
  'common:loading': 'Loading...',
  'common:error': 'Error',
  'common:success': 'Success',
  'common:buttons.startCreating': 'Start Creating',
  'common:buttons.viewOpenMarket': 'View Open Market',
  'common:marketplace.openMarket': 'Open Market',
  'common:marketplace.searchPlaceholder': 'Search marketplace...',
  'common:gallery.linkCopied': 'Link Copied!',
  'common:gallery.linkCopiedDescription': 'Product link has been copied to clipboard',
  'marketplace:title': 'Marketplace',
  'marketplace:viewMode.paginated': 'Paginated View',
  'marketplace:viewMode.infiniteScroll': 'Infinite Scroll',
  'marketplace:filters.sortBy': 'Sort By',
  'marketplace:filters.newest': 'Newest',
  'marketplace:filters.priceDesc': 'Price: High to Low',
  'marketplace:wishlist.title': 'My Wishlist'
} as const;

export const useTranslationFallback = (namespace?: string | string[]) => {
  const { t, i18n, ready } = useTranslation(namespace);

  const safeT = useCallback((key: string, options?: any): string => {
    try {
      // First try the normal translation
      const translation = t(key, options);
      
      // Ensure we always return a string
      if (typeof translation === 'string' && translation !== key && translation) {
        return translation;
      }
      
      // Try with namespace prefix if not already present
      const namespacedKey = key.includes(':') ? key : `${namespace || 'common'}:${key}`;
      const fallback = fallbackTexts[namespacedKey as keyof typeof fallbackTexts];
      
      if (fallback) {
        console.warn(`🔄 [TRANSLATION] Using fallback for key: ${namespacedKey}`);
        return fallback;
      }
      
      // Return a readable version of the key as last resort
      const readableKey = key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
      console.warn(`⚠️ [TRANSLATION] No fallback found for key: ${namespacedKey}, using readable key: ${readableKey}`);
      return readableKey;
    } catch (error) {
      console.error(`❌ [TRANSLATION] Error translating key: ${key}`, error);
      // Return readable key on error
      return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
    }
  }, [t, namespace]);

  return {
    t: safeT,
    i18n,
    ready,
    isTranslationReady: ready && i18n.isInitialized
  };
};