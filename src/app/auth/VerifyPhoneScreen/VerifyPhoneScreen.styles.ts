import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeVerifyPhoneStyles = (theme: RoleTheme) =>
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
    color: colors.textSecondary,
    fontFamily: FONTS.display_medium,
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
  helpContainer: {
    marginTop: 20,
  },
  helpText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: FONTS.display_regular,
  },
  linkText: {
    color: theme.textPrimary,
    fontWeight: '700',
    fontFamily: FONTS.display_medium,
    textDecorationLine: 'underline',
  },
});
