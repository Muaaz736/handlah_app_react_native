import { StyleSheet } from 'react-native';
import { getColorWithOpacity } from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomScrollableTabsStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flexGrow: 0,
    flexShrink: 0,
  },
  contentContainer: {
    paddingVertical: 8,
    gap: 5,
  },
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
  tab: {
    borderRadius: 100, // Fully rounded corners
    borderWidth: 0.4,
    borderColor: getColorWithOpacity(theme.textSecondary, 0.6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderWidth: 0,
  },
  tabLabel: {
    fontSize: 14,
    color: getColorWithOpacity(theme.textSecondary, 1),
    fontFamily: FONTS.display_regular,
  },
  activeTabLabel: {
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  viewAllTab: {
    borderWidth: 0.4,
    borderColor: getColorWithOpacity(theme.textSecondary, 0.6),
    paddingHorizontal: 20,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllLabel: {
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    fontSize: 12,
  },
});
