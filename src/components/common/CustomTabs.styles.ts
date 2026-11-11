import { StyleSheet } from 'react-native';
import { getColorWithOpacity } from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomTabsStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#e5e5e5',
    borderRadius: 100,
    overflow: 'hidden',
    height: 48,
    margin: 8,
    position: 'relative',
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: getColorWithOpacity(theme.surface, 0.1),
    direction: 'ltr',
  },
  activeTabBackground: {
    position: 'absolute',
    height: '100%',
    borderRadius: 100,
    top: 0,
    left: 0,
  },
  tab: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tabLabel: {
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  activeTabLabel: {
    color: theme.surface,
  },
  icon: {
    marginRight: 8,
  },
});
