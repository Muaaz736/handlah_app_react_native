import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeRadioButtonDefaultStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outerCircle: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
});
