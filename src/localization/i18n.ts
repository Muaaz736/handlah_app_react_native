import { initReactI18next } from 'react-i18next';

import { getLocales } from 'react-native-localize';

import AsyncStorage from '@react-native-async-storage/async-storage';

import i18next from 'i18next';

import { SUPPORTED_LANGUAGES } from './supportedLanguages';

import type {
  LanguageCode,
  GetDefaultLanguageFunction,
} from '../types/i18n.types';

const resources = {
  en: { translation: require('./languages/en.json') },
  ar: { translation: require('./languages/ar.json') },
  es: { translation: require('./languages/es.json') },
  fr: { translation: require('./languages/fr.json') },
  de: { translation: require('./languages/de.json') },
  pt: { translation: require('./languages/pt.json') },
  zh: { translation: require('./languages/zh.json') },
  ja: { translation: require('./languages/ja.json') },
  ko: { translation: require('./languages/ko.json') },
  hi: { translation: require('./languages/hi.json') },
  ru: { translation: require('./languages/ru.json') },
  it: { translation: require('./languages/it.json') },
  du: { translation: require('./languages/du.json') },
  po: { translation: require('./languages/po.json') },
  tu: { translation: require('./languages/tu.json') },
  th: { translation: require('./languages/th.json') },
  id: { translation: require('./languages/id.json') },
  vt: { translation: require('./languages/vt.json') },
  he: { translation: require('./languages/he.json') },
  ur: { translation: require('./languages/ur.json') },
} as const;

// Get saved language synchronously (will be null on first load)
let savedLanguage: string | null = null;

AsyncStorage.getItem('APP_LANGUAGE').then((lang: string | null) => {
  savedLanguage = lang;
});

const getDefaultLanguage: GetDefaultLanguageFunction = async () => {
  const savedLang: string | null = await AsyncStorage.getItem('APP_LANGUAGE');
  if (savedLang && (SUPPORTED_LANGUAGES as Record<string, any>)[savedLang]) {
    return savedLang as LanguageCode;
  }

  const deviceLang: string | undefined = getLocales()[0]?.languageCode;
  return (
    (SUPPORTED_LANGUAGES as Record<string, any>)[deviceLang as string]
      ? deviceLang
      : 'en'
  ) as LanguageCode;
};

// Initialize i18n synchronously with default language
const initLanguage: string =
  savedLanguage && (SUPPORTED_LANGUAGES as Record<string, any>)[savedLanguage]
    ? savedLanguage
    : 'en';

i18next.use(initReactI18next).init({
  lng: initLanguage,
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export { getDefaultLanguage };
export default i18next;
