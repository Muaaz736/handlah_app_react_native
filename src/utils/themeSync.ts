import { AppDispatch } from '../types/store.types';
import { getOrCreateDeviceId } from '../services/notifications/NotificationService';
import { getThemeAsync, updateThemeAsync, ThemeResponseDto } from '../redux/services/themeService';
import { applyRemoteTheme } from '../redux/slices/userRoleSlice';
import { USER_ROLES } from './roleManager';
import { enqueueThemeSync } from './themeSyncQueue';

const isBareDefault = (theme: ThemeResponseDto): boolean =>
  theme.thememode === 'system' && !theme.primarycolor;

const syncRoleTheme = async (
  dispatch: AppDispatch,
  role: number,
  deviceId: string,
  localPrimaryColor: string | undefined,
  localIsDark: boolean | undefined,
): Promise<void> => {
  const isBusiness = role === USER_ROLES.BUSINESS;

  try {
    const remote = await dispatch(getThemeAsync({ role, deviceId, isBusiness }) as any).unwrap();

    if (isBareDefault(remote)) {
      if (localPrimaryColor || localIsDark) {
        enqueueThemeSync(role, async () => {
          try {
            await dispatch(
              updateThemeAsync({
                role,
                deviceId,
                isBusiness,
                themeMode: localIsDark ? 'dark' : 'light',
                primaryColor: localPrimaryColor ?? null,
                secondaryColor: null,
              }) as any,
            ).unwrap();
          } catch {}
        });
      }
      return;
    }

    dispatch(
      applyRemoteTheme({
        role,
        primaryColor: remote.primarycolor,
        isDark: remote.thememode === 'dark',
      }),
    );
  } catch {}
};

export const syncThemeOnLogin = async (
  dispatch: AppDispatch,
  customColors: Record<number, string>,
  darkMode: Record<number, boolean>,
): Promise<void> => {
  const deviceId = await getOrCreateDeviceId();

  await Promise.all([
    syncRoleTheme(
      dispatch,
      USER_ROLES.PERSONAL,
      deviceId,
      customColors?.[USER_ROLES.PERSONAL],
      darkMode?.[USER_ROLES.PERSONAL],
    ),
    syncRoleTheme(
      dispatch,
      USER_ROLES.BUSINESS,
      deviceId,
      customColors?.[USER_ROLES.BUSINESS],
      darkMode?.[USER_ROLES.BUSINESS],
    ),
  ]);
};
