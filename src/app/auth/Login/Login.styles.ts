import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeLoginStyles = (theme: RoleTheme) =>
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
      paddingTop: isIOS ? 60 : 20,
    },
    formContainer: {
      width: '100%',
      marginTop: 20,
    },
    forgotPasswordContainer: {
      marginBottom: 10,
    },
    primaryButton: {
      backgroundColor: theme.textPrimary,
    },
    primaryButtonText: {
      color: theme.textPrimary,
    },
  });
