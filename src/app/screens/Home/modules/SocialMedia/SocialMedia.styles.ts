import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles shared across all SocialMedia sub-screens
export const makeCommonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  headerContainerStyle: {
    paddingHorizontal: 16,
    marginBottom: -30,
    paddingTop: 20,
  },
  headerIcon: {
    width: 78,
    height: 78,
    resizeMode: 'contain',
    alignSelf: 'center',
    tintColor: theme.surface,
  },
  iconContainer: {
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    color: theme.surface,
    fontFamily: FONTS.display_bold,
    marginTop: 8,
    textAlign: 'center',
  },
  whiteButton: {
    backgroundColor: theme.surface,
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  blackText: {
    color: theme.textPrimary,
  },
});

// SocialMedia.tsx specific styles
export const makeSocialMediaStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  accountsSection: {
    width: '100%',
    marginTop: 30,
  },
  whiteButton: {
    backgroundColor: theme.surface,
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  blackText: {
    color: theme.textPrimary,
  },
  accountsHeader: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 12,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  platformIcon: {
    marginRight: 10,
  },
  accountDetails: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  platformName: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  username: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    marginLeft: 8,
  },
  actionBtn: {
    padding: 4,
  },
  shareIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    gap: 16,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 220,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  viewingAsContainer: {
    marginTop: 16,
    marginHorizontal: 0,
    width: '100%',
  },
  viewingAsTrigger: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  viewingAsTriggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: 'transparent',
  },
  viewingAsTriggerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  viewingAsTriggerAvatarText: {
    fontSize: 13,
    fontFamily: FONTS.display_bold,
    color: theme.surface,
  },
  viewingAsTriggerInfo: {
    flex: 1,
  },
  viewingAsLabel: {
    fontSize: 11,
    fontFamily: FONTS.display_regular,
    color: '#000',
  },
  viewingAsTriggerName: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  userDropdownPanel: {
    backgroundColor: theme.surface,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  userDropdownItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  userDropdownItemActive: {
    backgroundColor: '#F6FFF0',
  },
  userDropdownItemLast: {
    borderBottomWidth: 0,
  },
  userDropdownAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  userDropdownAvatarText: {
    fontSize: 15,
    fontFamily: FONTS.display_bold,
    color: theme.surface,
  },
  userDropdownInfo: {
    flex: 1,
  },
  userDropdownName: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  userDropdownUsername: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    marginTop: 1,
  },
});
