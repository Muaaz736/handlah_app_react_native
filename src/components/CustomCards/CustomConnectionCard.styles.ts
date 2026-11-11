import { StyleSheet } from 'react-native';
import FONTS from '../../utils/fonts';
import { isIOS } from '../../utils/helpers';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomConnectionCardStyles = (theme: RoleTheme) => StyleSheet.create({
  container: {
    marginBottom: 12,

    borderRadius: 20,

    shadowColor: theme.textPrimary,
    shadowOffset: {
      width: 0,
      height: 4, // Positive value for bottom shadow
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: isIOS ? 8 : 0, // For Android
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.surface,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
    gap: 4
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    textAlign: 'left',
  },
  name: {
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginRight: 8,
    textAlign: 'left',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  email: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    marginBottom: 2,
    textAlign: 'left',
  },
  phone: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  statusBadge: {
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    textAlign: 'left',
  },
  badgePadding: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
});
