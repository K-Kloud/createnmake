
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
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

import frCommon from '@/locales/fr/common.json';
import frAuth from '@/locales/fr/auth.json';
import frDashboard from '@/locales/fr/dashboard.json';
import frNavigation from '@/locales/fr/navigation.json';
import frMarketplace from '@/locales/fr/marketplace.json';

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
  fr: {
    common: frCommon,
    auth: frAuth,
    dashboard: frDashboard,
    navigation: frNavigation,
    marketplace: frMarketplace,
  },
};

i18n
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
  });

export default i18n;
