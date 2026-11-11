import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import fonts from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeSocialButtonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: theme.border ?? '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.surface,
    marginBottom: 16,
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
  },
  text: {
    fontSize: 16,
    color: theme.textPrimary,
    fontFamily: fonts.display_semi_bold,
  },
});
