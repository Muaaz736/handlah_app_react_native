import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../../types/roleManager.types';
import FONTS from '../../../../../../utils/fonts';

export const makeChatHeaderStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: theme.textPrimary,
    transform: [{ rotate: '45deg' }],
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingLeft: 8,
  },
  botAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatarLargeText: {
    color: theme.textPrimary,
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    // backgroundColor: '#22C55E',
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    // color: '#22C55E',
  },
});
