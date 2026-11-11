import { StyleSheet } from 'react-native';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeMfaVerificationStyles = (theme: RoleTheme) =>
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
      marginTop: 20,
    },
    otpContainer: {
      marginBottom: 30,
      alignItems: 'center',
    },
    resendContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    resendText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: FONTS.display_medium,
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textPrimary,
      fontFamily: FONTS.display_bold,
    },
    resendActiveText: {
      fontSize: 14,
      color: theme.textPrimary,
      fontWeight: '700',
      fontFamily: FONTS.display_medium,
      textDecorationLine: 'underline',
    },
    footerContainer: {
      paddingHorizontal: 18,
      paddingBottom: 40,
      backgroundColor: theme.background,
    },
  });
