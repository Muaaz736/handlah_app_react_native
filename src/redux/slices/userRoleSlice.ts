import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { USER_ROLES, getThemeForRole } from '../../utils/roleManager';

export interface UserRoleSliceState {
  role: number;
  themeColors: Record<string, any>;
  /** Per-role custom primary colors: { 0: '#FF5733', 1: '#3366FF' } */
  customColors: Record<number, string>;
  /** Per-role dark mode flags: { 0: false, 1: true } — missing key means light */
  darkMode: Record<number, boolean>;
}

const initialState: UserRoleSliceState = {
  role: USER_ROLES.PERSONAL,
  themeColors: getThemeForRole(USER_ROLES.PERSONAL, {}, false),
  customColors: {},
  darkMode: {},
};

const isDarkForRole = (darkMode: Record<number, boolean>, role: number): boolean =>
  darkMode?.[role] ?? false;

const userRoleSlice = createSlice({
  name: 'userRole',
  initialState,
  reducers: {
    setUserRole: (state, action: PayloadAction<number>) => {
      state.role = action.payload;
      state.themeColors = getThemeForRole(
        action.payload,
        state.customColors,
        isDarkForRole(state.darkMode, action.payload),
      );
    },
    toggleUserRole: state => {
      state.role =
        state.role === USER_ROLES.PERSONAL ? USER_ROLES.BUSINESS : USER_ROLES.PERSONAL;
      state.themeColors = getThemeForRole(
        state.role,
        state.customColors,
        isDarkForRole(state.darkMode, state.role),
      );
    },
    rehydrateThemeColors: state => {
      state.themeColors = getThemeForRole(
        state.role,
        state.customColors,
        isDarkForRole(state.darkMode, state.role),
      );
    },
    /** Set a custom primary color for a specific role. The full theme is auto-derived. */
    setCustomColor: (
      state,
      action: PayloadAction<{ role: number; color: string }>,
    ) => {
      state.customColors[action.payload.role] = action.payload.color;
      if (state.role === action.payload.role) {
        state.themeColors = getThemeForRole(
          state.role,
          state.customColors,
          isDarkForRole(state.darkMode, state.role),
        );
      }
    },
    /** Reset a specific role's color back to the built-in default. */
    resetCustomColor: (state, action: PayloadAction<number>) => {
      delete state.customColors[action.payload];
      if (state.role === action.payload) {
        state.themeColors = getThemeForRole(
          state.role,
          state.customColors,
          isDarkForRole(state.darkMode, state.role),
        );
      }
    },
    /** Reset all custom colors back to defaults. */
    resetAllCustomColors: state => {
      state.customColors = {};
      state.themeColors = getThemeForRole(
        state.role,
        {},
        isDarkForRole(state.darkMode, state.role),
      );
    },
    /** Enable or disable dark mode for a specific role. */
    setDarkMode: (
      state,
      action: PayloadAction<{ role: number; isDark: boolean }>,
    ) => {
      state.darkMode[action.payload.role] = action.payload.isDark;
      if (state.role === action.payload.role) {
        state.themeColors = getThemeForRole(
          state.role,
          state.customColors,
          action.payload.isDark,
        );
      }
    },
    /** Toggle dark mode for a specific role. */
    toggleDarkMode: (state, action: PayloadAction<number>) => {
      const role = action.payload;
      const next = !isDarkForRole(state.darkMode, role);
      state.darkMode[role] = next;
      if (state.role === role) {
        state.themeColors = getThemeForRole(state.role, state.customColors, next);
      }
    },
    applyRemoteTheme: (
      state,
      action: PayloadAction<{ role: number; primaryColor: string | null; isDark: boolean }>,
    ) => {
      const { role, primaryColor, isDark } = action.payload;
      if (primaryColor) {
        state.customColors[role] = primaryColor;
      } else {
        delete state.customColors[role];
      }
      state.darkMode[role] = isDark;
      if (state.role === role) {
        state.themeColors = getThemeForRole(state.role, state.customColors, isDark);
      }
    },
  },
});

export const {
  setUserRole,
  toggleUserRole,
  rehydrateThemeColors,
  setCustomColor,
  resetCustomColor,
  resetAllCustomColors,
  setDarkMode,
  toggleDarkMode,
  applyRemoteTheme,
} = userRoleSlice.actions;

export default userRoleSlice.reducer;
