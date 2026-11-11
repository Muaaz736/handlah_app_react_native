import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomListItemCardStyles = (theme: RoleTheme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.surface,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 1,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    width: 35,
    height: 35,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 2,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginRight: 8,
  },
  badgeText: {
    color: theme.surface,
    fontSize: 11,
    fontFamily: FONTS.display_bold,
    lineHeight: 14,
  },
});
