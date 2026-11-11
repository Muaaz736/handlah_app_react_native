import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeEmailVerificationStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
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
  resendText: {
    fontSize: 15,
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    textDecorationLine: 'underline',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 15,
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
    marginLeft: 8,
  },
  resendActiveText: {
    fontSize: 15,
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    textDecorationLine: 'underline',
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  footerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: theme.surface,
  },
  spamText: {
    fontSize: 13,
    color: '#666666',
    fontFamily: FONTS.display_regular,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  spamLink: {
    color: theme.textPrimary,
    textDecorationLine: 'underline',
    fontFamily: FONTS.display_medium,
  },
});
