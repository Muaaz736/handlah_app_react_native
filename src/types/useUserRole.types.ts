import { USER_ROLES } from '../utils/roleManager';

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface UserRoleState {
  role: UserRole;
  themeColors: Record<string, any>;
  customColors: Record<number, string>;
  darkMode: Record<number, boolean>;
}

export interface RootState {
  userRole: UserRoleState;
}
