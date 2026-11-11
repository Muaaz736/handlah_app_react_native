import createApiThunk from '../../utils/createApiThunk';
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';

export type ThemeMode = 'light' | 'dark' | 'system';

// The API returns raw lowercase field names (matches this backend's other
// GET endpoints, e.g. countries returns `countryname`, not `countryName`).
export interface ThemeResponseDto {
  deviceid: string;
  isbusiness: boolean;
  thememode: ThemeMode;
  primarycolor: string | null;
  secondarycolor: string | null;
}

export interface GetThemeArg {
  role: number;
  deviceId: string;
  isBusiness: boolean;
}

export interface UpdateThemeArg {
  role: number;
  deviceId: string;
  isBusiness: boolean;
  themeMode: ThemeMode;
  primaryColor: string | null;
  secondaryColor: string | null;
}

export const getThemeAsync = createApiThunk<ThemeResponseDto, GetThemeArg>(
  TYPE_CONSTANTS.GET_THEME_ASYNC,
  'get',
  ({ deviceId, isBusiness }) =>
    `${API_ENDPOINTS.THEME}?deviceId=${encodeURIComponent(deviceId)}&isBusiness=${isBusiness}`,
  'Failed to load theme.',
);

export const updateThemeAsync = createApiThunk<ThemeResponseDto, UpdateThemeArg>(
  TYPE_CONSTANTS.UPDATE_THEME_ASYNC,
  'put',
  API_ENDPOINTS.THEME,
  'Failed to save theme.',
  {
    getBody: ({ deviceId, isBusiness, themeMode, primaryColor, secondaryColor }) => ({
      deviceId,
      isBusiness,
      themeMode,
      primaryColor,
      secondaryColor,
    }),
    skipOfflineQueue: true,
  },
);
