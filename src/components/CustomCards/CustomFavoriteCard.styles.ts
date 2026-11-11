import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import { isIOS } from '../../utils/helpers';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomFavoriteCardStyles = (theme: RoleTheme) => StyleSheet.create({
  container: {
    width: '100%',
    padding: 8,
    borderRadius: 15,
  },
  gradient: {
    borderRadius: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: isIOS ? 3 : 0,
  },
  dragedStyle: {
    borderColor: theme.textPrimary,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 15,
    padding: 8,
  },
  icon: {
    width: 35,
    height: 35,
    tintColor: theme.textPrimary,
  },
  label: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
    color: theme.surface,
    textAlign: 'center',
    marginTop: isIOS ? 6 : 0,
    marginBottom: 5,
    paddingHorizontal: 2,
    lineHeight: 16,
  },
  labelRTL: {
    fontSize: 11,
    lineHeight: 15,
  },
  closeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 10,
    borderRadius: 50,
    backgroundColor: theme.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  wrapper: {
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 10,
    minWidth: 25,
    height: 25,
    borderRadius: 45,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.surface,
  },
  countBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.display_bold,
    color: theme.surface,
    lineHeight: 13,
  },
});
