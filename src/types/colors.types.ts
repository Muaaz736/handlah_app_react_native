/**
 * Color Palette Interface
 * Defines the structure for the application's color scheme
 */
export interface ColorPalette {
  // Primary Colors
  primary: string;
  secondary: string;

  // Grayscale
  white: string;
  black: string;
  gray: string;
  lightGray: string;
  darkGray: string;

  // UI Colors
  background: string;
  border: string;
  placeholder: string;
  text: string;
  textSecondary: string;
  description: string;

  // Status Colors
  success: string;
  error: string;
  warning: string;
  info: string;

  // Additional Colors
  link: string;
  transparent: string;

  // Green Shades
  green: string;
  lightGreen: string;
  lightCGreen: string;
  darkGreen: string;

  // Blue Shades
  blue: string;
  lightBlue: string;
  darkBlue: string;

  // Business Role Colors
  businessPrimary: string;
  businessSecondary: string;
  businessDarkGreen: string;
  businessLightCGreen: string;
  businessText: string;

  // Purple Shades
  purple: string;
  lightPurple: string;

  // Orange/Amber
  orange: string;
  amber: string;

  // Backgrounds
  backgroundLight: string;
  backgroundDark: string;

  // Shadows
  shadow: string;
}

/**
 * Color utility function types
 */
export type HexColor = string;
export type RgbaColor = string;
export type AlphaValue = number;

export type HexToRgbaFunction = (hex: HexColor, alpha?: AlphaValue) => RgbaColor;
export type GetColorWithOpacityFunction = (color: string, opacity?: AlphaValue) => string;
