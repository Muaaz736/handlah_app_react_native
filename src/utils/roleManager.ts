import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from './colors';
import type {
  UserRole,
  RoleTheme,
  RoleBaseTheme,
  RoleThemesMap,
  UIColors,
  SaveUserRoleFunction,
  GetUserRoleFunction,
  GetThemeForRoleFunction,
  ClearUserRoleFunction,
} from '../types/roleManager.types';

// Storage key
const USER_ROLE_KEY: string = '@user_role';

// User role constants
export const USER_ROLES: Record<'PERSONAL' | 'BUSINESS', UserRole> = {
  PERSONAL: 0,
  BUSINESS: 1,
};

/** Light and dark UI color palettes */
export const UI_COLORS: Record<'light' | 'dark', UIColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#fffefe',
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    border: '#E8E8E8',
    placeholder: '#B8B8B8',
    inputBg: '#FFFFFF',
    isDark: false,
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    textPrimary: '#EFEFEF',
    textSecondary: '#9E9E9E',
    border: '#2A2A2A',
    placeholder: '#666666',
    inputBg: '#242424',
    isDark: true,
  },
};

/** Base role themes — UI mode colors are merged in at runtime by getThemeForRole */
export const ROLE_THEMES: RoleThemesMap = {
  0: {
    primary: colors.primary,
    secondary: colors.secondary,
    text: colors.text,
    darkGreen: colors.darkGreen,
    lightCGreen: colors.lightCGreen,
    activeTabBg: colors.darkGreen,
    gradient: ['#16A34A', '#16A34Acf', '#16A34Ab2', '#16A34A80', '#fff'],
  },
  1: {
    primary: colors.businessPrimary,
    secondary: colors.businessSecondary,
    text: colors.businessText,
    darkGreen: colors.businessDarkGreen,
    lightCGreen: colors.businessLightCGreen,
    activeTabBg: colors.businessSecondary,
    gradient: ['#0D2F61', '#266cb1cf', '#5ea0e0b2', '#dae8f8b2', '#fff'],
  },
};

export const saveUserRole: SaveUserRoleFunction = async role => {
  try {
    await AsyncStorage.setItem(USER_ROLE_KEY, role.toString());
    return true;
  } catch (error) {
    console.error('Error saving user role:', error);
    return false;
  }
};

export const getUserRole: GetUserRoleFunction = async () => {
  try {
    const savedRole: string | null = await AsyncStorage.getItem(USER_ROLE_KEY);
    if (savedRole !== null) {
      return parseInt(savedRole, 10) as UserRole;
    }
    return USER_ROLES.PERSONAL;
  } catch (error) {
    console.error('Error getting user role:', error);
    return USER_ROLES.PERSONAL;
  }
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  let clean = hex.replace('#', '');

  if (clean.length === 3)
    clean = clean
      .split('')
      .map(c => c + c)
      .join('');
  if (clean.length > 6) clean = clean.slice(0, 6);
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map(v => v.toString(16).padStart(2, '0'))
      .join('')
  );
};

export const darkenColor = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
};

const lightenColor = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
};

const hexWithAlpha = (hex: string, alpha: number): string => {
  const clean = hex.replace('#', '').slice(0, 6);
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return '#' + clean + alphaHex;
};

export const generateThemeFromColor = (primaryHex: string, isDark = false): RoleTheme => {
  const uiColors = isDark ? UI_COLORS.dark : UI_COLORS.light;
  const bgEnd = uiColors.background;
  const secondary = darkenColor(primaryHex, 0.55);
  const darkShade = darkenColor(primaryHex, 0.35);
  const lightShade = lightenColor(primaryHex, 0.65);

  return {
    primary: primaryHex,
    secondary,
    text: isDark ? '#ffffff' : '#1a1a1a',
    darkGreen: darkShade,
    lightCGreen: lightShade,
    activeTabBg: secondary,
    gradient: isDark
      ? [
        darkenColor(primaryHex, 0.1),
        darkenColor(primaryHex, 0.1),
        hexWithAlpha(darkenColor(primaryHex, 0.55), 0.8),
        hexWithAlpha(primaryHex, 0.25),
        bgEnd,
      ]
      : [
        darkenColor(primaryHex, 0.6),
        hexWithAlpha(darkenColor(primaryHex, 0.15), 0.81),
        hexWithAlpha(lightenColor(primaryHex, 0.3), 0.7),
        hexWithAlpha(lightenColor(primaryHex, 0.6), 0.7),
        bgEnd,
      ],
    ...uiColors,
  };
};

export const getThemeForRole: GetThemeForRoleFunction = (
  role,
  customColors?,
  isDark = false,
) => {
  const uiColors = isDark ? UI_COLORS.dark : UI_COLORS.light;
  const customPrimary = customColors?.[role];

  if (customPrimary) {
    return generateThemeFromColor(customPrimary, isDark);
  }

  const base: RoleBaseTheme = ROLE_THEMES[role] || ROLE_THEMES[USER_ROLES.PERSONAL];

  // In dark mode replace the gradient's final stop (white) with dark background
  const gradient = isDark
    ? [...base.gradient.slice(0, -1), uiColors.background]
    : base.gradient;

  return { ...base, ...uiColors, gradient };
};

export const clearUserRole: ClearUserRoleFunction = async () => {
  try {
    await AsyncStorage.removeItem(USER_ROLE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user role:', error);
    return false;
  }
};
