export type LanguageCode = string;

export interface SupportedLanguage {
  rtl: boolean;
  label?: string;
}

export type SupportedLanguagesMap = {
  [key in LanguageCode]: SupportedLanguage;
};
