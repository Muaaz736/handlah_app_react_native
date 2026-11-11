import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import fonts from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeTextLinkStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  text: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: fonts.display_regular,
  },
  link: {
    color: theme.textPrimary,
    fontFamily: fonts.display_medium,
  },
});
