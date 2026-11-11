import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';
import i18n from './i18n';
import { applyRTL } from '../utils/helpers';
import { SUPPORTED_LANGUAGES } from './supportedLanguages';

import type {
  LanguageCode,
  SupportedLanguagesMap,
} from '../types/languageService.types';

const typedSupportedLanguages = SUPPORTED_LANGUAGES as SupportedLanguagesMap;

export const changeLanguage = async (langCode: LanguageCode): Promise<boolean> => {
  if (!typedSupportedLanguages[langCode]) return false;

  await AsyncStorage.setItem('APP_LANGUAGE', langCode);
  await i18n.changeLanguage(langCode);

  const needsRestart = applyRTL(typedSupportedLanguages[langCode].rtl);

  if (needsRestart) {
    RNRestart.restart();
    return true;
  }

  return false;
};
