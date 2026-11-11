import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeEditPersonalPropertyStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    paddingTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error || 'red',
    marginTop: 4,
    fontFamily: FONTS.display_regular,
  },
});
