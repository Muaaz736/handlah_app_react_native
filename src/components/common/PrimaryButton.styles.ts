import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import fonts from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makePrimaryButtonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  button: {
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.blue,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  transparentButton: {
    backgroundColor: 'rgba(139, 195, 74, 0.1)',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: theme.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    fontFamily: fonts.display_medium,
  },
  outlineText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '600',
    fontFamily: fonts.display_medium,
  },
  transparentText: {
    color: theme.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    fontFamily: fonts.display_medium,
  },
});
