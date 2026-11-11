import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeNewPasswordStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    contentContainer: {
      flex: 1,
      padding: 18,
      paddingTop: 60,
    },
    formContainer: {
      width: '100%',
    },
    footerContainer: {
      paddingHorizontal: 18,
      paddingBottom: 40,
      paddingTop: 16,
      backgroundColor: theme.background,
    },
  });
