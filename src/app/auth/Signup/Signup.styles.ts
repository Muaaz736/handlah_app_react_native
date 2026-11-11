import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';
import FONTS from '../../../utils/fonts';

export const makeSignupStyles = (theme: RoleTheme) =>
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
      paddingTop: isIOS ? 60 : 30,
    },
    formContainer: {
      width: '100%',
    },
    phoneLabel: {
      marginBottom: 8,
      color: theme.textPrimary
    },
    phoneTextContainer: {
      backgroundColor: theme.surface,
      paddingVertical: isIOS ? 16 : 5.5,
    },
    phoneContainer: {
      width: '100%',
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.inputBg,
      borderRadius: 8,
      marginBottom: 16,
      shadowColor: 'transparent',
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: -12,
      marginBottom: 12,
    },
    primaryButton: {
      backgroundColor: theme.textPrimary,
    },
    primaryButtonText: {
      color: theme.textPrimary,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border ?? '#E0E0E0',
    },
    dividerText: {
      marginHorizontal: 12,
      fontSize: 14,
      fontFamily: FONTS.display_regular,
    },
  });
