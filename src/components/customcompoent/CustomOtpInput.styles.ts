import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { isIOS } from '../../utils/helpers';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomOtpInputStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  mainContainer: {
    width: '100%',
  },
  label: {
    fontSize: 24,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  requiredStar: {
    color: colors.error,
    marginLeft: 2,
  },
  errorLabel: {
    color: colors.error,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  otpBox: {
    width: 45,
    height: 45,
    marginHorizontal: isIOS ? 5 : 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedBox: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  filledBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 0,
  },
  errorBox: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  otpText: {
    color: theme.surface,
    textAlign: 'center',
    fontSize: 20,
  },
  errorText: {
    color: colors.error,
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
  },
});
