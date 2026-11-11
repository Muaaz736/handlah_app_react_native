/**
 * Platform and RTL helper types
 */
export type PlatformType = 'ios' | 'android' | 'windows' | 'macos' | 'web';

export type ApplyRTLFunction = (isRTL: boolean) => boolean;

/**
 * Name and initials helper types
 */
export type GetInitialsFunction = (name: string | null | undefined) => string;

/**
 * Date format helper types
 */
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY';
export type LanguageCode = string;

export type GetLocaleDateFormatFunction = (language: LanguageCode) => DateFormat;
