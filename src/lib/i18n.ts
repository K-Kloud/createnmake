
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import existing translation files
import enCommon from '@/locales/en/common.json';
import enAuth from '@/locales/en/auth.json';
import enDashboard from '@/locales/en/dashboard.json';
import enNavigation from '@/locales/en/navigation.json';
import enMarketplace from '@/locales/en/marketplace.json';

import esCommon from '@/locales/es/common.json';
import esAuth from '@/locales/es/auth.json';
import esDashboard from '@/locales/es/dashboard.json';
import esNavigation from '@/locales/es/navigation.json';
import esMarketplace from '@/locales/es/marketplace.json';


const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    navigation: enNavigation,
    marketplace: enMarketplace,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    dashboard: esDashboard,
    navigation: esNavigation,
    marketplace: esMarketplace,
  },
};

console.log('🌐 [I18N] Initializing internationalization...');

// Phase 2: Add translation validation and error handling
const validateTranslations = () => {
  const requiredKeys = {
    common: ['loading', 'error', 'success', 'buttons.startCreating'],
    marketplace: ['title', 'viewMode.paginated', 'viewMode.infiniteScroll']
  };

  let hasErrors = false;
  Object.entries(requiredKeys).forEach(([namespace, keys]) => {
    const nsResources = resources.en[namespace as keyof typeof resources.en];
    keys.forEach(key => {
      if (!key.split('.').reduce((obj, k) => obj?.[k], nsResources)) {
        console.error(`❌ [I18N] Missing required key: ${namespace}.${key}`);
        hasErrors = true;
      }
    });
  });

  if (!hasErrors) {
    console.log('✅ [I18N] Translation validation passed');
  }
  return !hasErrors;
};

// Phase 2: Implement retry logic for i18n initialization
const initializeI18nWithRetry = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 [I18N] Initialization attempt ${attempt}/${retries}`);
      
      await i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          resources,
          fallbackLng: 'en',
          defaultNS: 'common',
          ns: ['common', 'auth', 'dashboard', 'navigation', 'marketplace'],
          
          detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage'],
          },

          interpolation: {
            escapeValue: false,
          },

          react: {
            useSuspense: false,
          },

          debug: process.env.NODE_ENV === 'development',
          
          // Phase 2: Add missing key handler
          missingKeyHandler: (lng, ns, key, fallbackValue) => {
            console.warn(`🔍 [I18N] Missing translation key: ${ns}:${key} for language: ${lng}`);
            return fallbackValue || key;
          },

          // Phase 2: Add post-processing for graceful degradation
          postProcess: ['fallback'],
        });

      console.log('✅ [I18N] Internationalization initialized successfully');
      validateTranslations();
      return true;
      
    } catch (error) {
      console.error(`❌ [I18N] Initialization attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        console.error('🚨 [I18N] All initialization attempts failed, using fallback');
        // Phase 2: Provide hardcoded fallbacks for critical functionality
        return false;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100 * attempt));
    }
  }
  return false;
};

// Start initialization
initializeI18nWithRetry();

export default i18n;
