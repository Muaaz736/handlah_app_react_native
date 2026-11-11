import { StyleSheet } from 'react-native';
import fonts from '../../utils/fonts';
import { isIOS } from '../../utils/helpers';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeAuthHeaderStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: 32,
    },
    backButton: {
      width: 20,
      height: 20,
      marginBottom: isIOS ? 10 : 14,
    },
    backButtonIcon: {
      width: 35,
      height: 35,
      tintColor: theme.textPrimary,
    },
    textContainer: {
      alignItems: 'flex-start',
      marginTop: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.textPrimary,
      fontFamily: fonts.display_bold,
      marginBottom: 8,
      textAlign: 'left',
    },
    subtitle: {
      fontSize: 15,
      color: theme.textSecondary,
      fontFamily: fonts.display_regular,
      lineHeight: 22,
      textAlign: 'left',
    },

  });
