import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeAddPersonalPropertyStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 24,
    textAlign: 'left',
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: colors.error || '#FF0000',
    marginTop: 4,
    textAlign: 'left',
  },
});
