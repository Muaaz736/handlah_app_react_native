import { useSelector, useDispatch } from 'react-redux';
import {
  setUserRole,
  toggleUserRole,
  setCustomColor,
  resetCustomColor,
  resetAllCustomColors,
  setDarkMode,
  toggleDarkMode,
} from '../redux/slices/userRoleSlice';
import { USER_ROLES } from '../utils/roleManager';
import { getOrCreateDeviceId } from '../services/notifications/NotificationService';
import { updateThemeAsync } from '../redux/services/themeService';
import { enqueueThemeSync } from '../utils/themeSyncQueue';

import type { RootState, UserRole } from '../types/useUserRole.types';

export const useUserRole = () => {
  const dispatch = useDispatch();

  const { role, themeColors, customColors, darkMode } = useSelector(
    (state: RootState) => state.userRole,
  );

  const safeCustomColors = customColors || {};
  const safeDarkMode = darkMode || {};

  const syncThemeToBackend = (
    targetRole: number,
    primaryColor: string | null,
    isDark: boolean,
  ): void => {
    enqueueThemeSync(targetRole, async () => {
      try {
        const deviceId = await getOrCreateDeviceId();
        await dispatch(
          updateThemeAsync({
            role: targetRole,
            deviceId,
            isBusiness: targetRole === USER_ROLES.BUSINESS,
            themeMode: isDark ? 'dark' : 'light',
            primaryColor,
            secondaryColor: null,
          }) as any,
        ).unwrap();
      } catch {}
    });
  };

  const changeUserRole = (newRole: UserRole): void => {
    dispatch(setUserRole(newRole));
  };

  const toggleRole = (): void => {
    dispatch(toggleUserRole());
  };

  const isBusinessRole = (): boolean => role === USER_ROLES.BUSINESS;

  const isPersonalRole = (): boolean => role === USER_ROLES.PERSONAL;

  const setCustomColorForRole = (targetRole: number, color: string): void => {
    dispatch(setCustomColor({ role: targetRole, color }));
    syncThemeToBackend(targetRole, color, safeDarkMode[targetRole] ?? false);
  };

  const resetColorForRole = (targetRole: number): void => {
    dispatch(resetCustomColor(targetRole));
    syncThemeToBackend(targetRole, null, safeDarkMode[targetRole] ?? false);
  };

  const resetAllColors = (): void => {
    dispatch(resetAllCustomColors());
  };

  /** Whether dark mode is active for the currently displayed role */
  const isDarkMode: boolean = safeDarkMode[role] ?? false;

  const setDarkModeForRole = (targetRole: number, isDark: boolean): void => {
    dispatch(setDarkMode({ role: targetRole, isDark }));
    syncThemeToBackend(targetRole, safeCustomColors[targetRole] ?? null, isDark);
  };

  const toggleDarkModeForRole = (targetRole: number): void => {
    dispatch(toggleDarkMode(targetRole));
    syncThemeToBackend(
      targetRole,
      safeCustomColors[targetRole] ?? null,
      !(safeDarkMode[targetRole] ?? false),
    );
  };

  return {
    userRole: role,
    themeColors,
    customColors: safeCustomColors,
    /** All roles' dark mode flags — use this when you need to read any role's dark setting */
    darkMode: safeDarkMode,
    /** Dark mode flag for the currently active role */
    isDarkMode,
    changeUserRole,
    toggleRole,
    isBusinessRole,
    isPersonalRole,
    setCustomColorForRole,
    resetColorForRole,
    resetAllColors,
    setDarkModeForRole,
    toggleDarkModeForRole,
  };
};
