/**
 * i18n Configuration Types
 */

/**
 * Language resource structure
 */
export interface LanguageResource {
  translation: Record<string, any>;
}

/**
 * All language resources
 */
export interface I18nResources {
  [languageCode: string]: LanguageResource;
}

/**
 * Supported language codes
 */
export type LanguageCode =
  | 'en'
  | 'ar'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'hi'
  | 'ru'
  | 'it'
  | 'du'
  | 'po'
  | 'tu'
  | 'th'
  | 'id'
  | 'vt'
  | 'he'
  | 'ur';

/**
 * i18n function types
 */
export type GetDefaultLanguageFunction = () => Promise<LanguageCode>;
