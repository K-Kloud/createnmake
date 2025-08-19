
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import existing translation files
import enCommon from '@/locales/en/common.json';
import enDashboard from '@/locales/en/dashboard.json';
import enNavigation from '@/locales/en/navigation.json';
import enMarketplace from '@/locales/en/marketplace.json';

import esCommon from '@/locales/es/common.json';
import esDashboard from '@/locales/es/dashboard.json';
import esNavigation from '@/locales/es/navigation.json';
import esMarketplace from '@/locales/es/marketplace.json';

import frCommon from '@/locales/fr/common.json';
import frAuth from '@/locales/fr/auth.json';
import frDashboard from '@/locales/fr/dashboard.json';
import frNavigation from '@/locales/fr/navigation.json';
import frMarketplace from '@/locales/fr/marketplace.json';

import deCommon from '@/locales/de/common.json';
import deAuth from '@/locales/de/auth.json';
import deDashboard from '@/locales/de/dashboard.json';
import deNavigation from '@/locales/de/navigation.json';
import deMarketplace from '@/locales/de/marketplace.json';

import ptCommon from '@/locales/pt/common.json';
import ptAuth from '@/locales/pt/auth.json';
import ptDashboard from '@/locales/pt/dashboard.json';
import ptNavigation from '@/locales/pt/navigation.json';
import ptMarketplace from '@/locales/pt/marketplace.json';

import itCommon from '@/locales/it/common.json';
import itAuth from '@/locales/it/auth.json';
import itDashboard from '@/locales/it/dashboard.json';
import itNavigation from '@/locales/it/navigation.json';
import itMarketplace from '@/locales/it/marketplace.json';

import zhCommon from '@/locales/zh/common.json';
import zhAuth from '@/locales/zh/auth.json';
import zhDashboard from '@/locales/zh/dashboard.json';
import zhNavigation from '@/locales/zh/navigation.json';
import zhMarketplace from '@/locales/zh/marketplace.json';

import jaCommon from '@/locales/ja/common.json';
import jaAuth from '@/locales/ja/auth.json';
import jaDashboard from '@/locales/ja/dashboard.json';
import jaNavigation from '@/locales/ja/navigation.json';
import jaMarketplace from '@/locales/ja/marketplace.json';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    navigation: enNavigation,
    marketplace: enMarketplace,
  },
  es: {
    common: esCommon,
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
  de: {
    common: deCommon,
    auth: deAuth,
    dashboard: deDashboard,
    navigation: deNavigation,
    marketplace: deMarketplace,
  },
  pt: {
    common: ptCommon,
    auth: ptAuth,
    dashboard: ptDashboard,
    navigation: ptNavigation,
    marketplace: ptMarketplace,
  },
  it: {
    common: itCommon,
    auth: itAuth,
    dashboard: itDashboard,
    navigation: itNavigation,
    marketplace: itMarketplace,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    dashboard: zhDashboard,
    navigation: zhNavigation,
    marketplace: zhMarketplace,
  },
  ja: {
    common: jaCommon,
    auth: jaAuth,
    dashboard: jaDashboard,
    navigation: jaNavigation,
    marketplace: jaMarketplace,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'navigation', 'marketplace'],
    
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

    debug: false,
  });

export default i18n;
