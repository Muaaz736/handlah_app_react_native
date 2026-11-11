export enum UserRole {
  PERSONAL = 0,
  BUSINESS = 1,
}

/** UI colors that change between light and dark mode */
export interface UIColors {
  /** Main screen background */
  background: string;
  /** Cards, inner containers, subtle surfaces */
  surface: string;
  /** Primary body text */
  textPrimary: string;
  /** Secondary / muted text */
  textSecondary: string;
  /** Borders and dividers */
  border: string;
  /** Placeholder text in inputs */
  placeholder: string;
  /** Input field background */
  inputBg: string;
  isDark: boolean;
}

/** Role-branded colors (primary, secondary, gradient, etc.) */
export interface RoleBaseTheme {
  primary: string;
  secondary: string;
  /** Header/gradient area text — role-specific (may be dark or light) */
  text: string;
  darkGreen: string;
  lightCGreen: string;
  activeTabBg: string;
  gradient: string[];
}

/** Full theme = role branding + UI mode colors */
export interface RoleTheme extends RoleBaseTheme, UIColors {}

export type RoleThemesMap = Record<number, RoleBaseTheme>;

export type SaveUserRoleFunction = (role: UserRole) => Promise<boolean>;
export type GetUserRoleFunction = () => Promise<UserRole>;
export type GetThemeForRoleFunction = (
  role: UserRole,
  customColors?: Record<number, string>,
  isDark?: boolean,
) => RoleTheme;
export type ClearUserRoleFunction = () => Promise<boolean>;
