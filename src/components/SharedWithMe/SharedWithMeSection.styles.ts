import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeSharedWithMeSectionStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  wrapper: {
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 12,
    marginTop: 4,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  ownerBlock: {
    width: '100%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  ownerName: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 10,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#888',
    textAlign: 'center',
  },
  // Skeleton styles
  skeletonSectionTitle: {
    height: 14,
    width: '45%',
    borderRadius: 7,
    backgroundColor: theme.textSecondary,
    marginBottom: 12,
    marginTop: 4,
  },
  skeletonOwnerBlock: {
    width: '100%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    backgroundColor: theme.inputBg,
  },
  skeletonOwnerName: {
    height: 14,
    width: '40%',
    borderRadius: 7,
    backgroundColor: theme.textSecondary,
    marginBottom: 12,
  },
  skeletonCard: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonCardTitle: {
    height: 16,
    width: '45%',
    borderRadius: 7,
    backgroundColor: theme.textSecondary,
  },
  skeletonIconsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.textSecondary,
  },
  skeletonCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonLabel: {
    height: 11,
    width: 80,
    borderRadius: 6,
    backgroundColor: theme.textSecondary,
    marginBottom: 6,
  },
  skeletonDate: {
    height: 14,
    width: 100,
    borderRadius: 7,
    backgroundColor: theme.textSecondary,
  },
  skeletonBadge: {
    height: 34,
    width: 110,
    borderRadius: 20,
    backgroundColor: theme.textSecondary,
  },
});
