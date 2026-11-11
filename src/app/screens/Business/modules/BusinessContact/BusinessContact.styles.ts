import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeBusinessContactStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  safeArea: {
    flex: 1,
  },
  iconContainer: {
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    color: theme.background,
    fontFamily: FONTS.display_bold,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  searchContainer: {
    width: '100%',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  contactsList: {
    width: '100%',
    paddingTop: 8,
  },
  contactCard: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  contactName: {
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    flex: 1,
    minWidth: 0,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    flexShrink: 0,
  },
  roleText: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  contactEmail: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    marginBottom: 12,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactNameRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  shareIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  editIcon: {
    width: 17,
    height: 17,
    resizeMode: 'contain',
  },
  deleteIcon: {
    width: 17,
    height: 17,
    resizeMode: 'contain',
  },
  gradientContainer: {
    flex: 1,
  },
  headerContainerStyle: {
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  headerIcon: {
    width: 78,
    height: 78,
    resizeMode: 'contain',
    alignSelf: 'center',
    tintColor: theme.background,
  },
  whiteButton: {
    backgroundColor: theme.background,
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  shareButton: {
    backgroundColor: theme.background,
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  shareButtonText: {
    color: theme.textPrimary,
    fontSize: 14,
  },
  whiteButtonText: {
    color: theme.textPrimary,
    fontSize: 14,
  },
  searchStartIcon: {
    tintColor: theme.textPrimary,
    height: 17,
    width: 17,
  },
  searchInputContainer: {
    flex: 1,
    borderRadius: 14,
    height: 45,
  },
  searchWrapper: {
    flex: 1,
    marginTop: 15,
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referenceToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    paddingBottom: 12,
  },
  referenceToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D3D3D3',
    padding: 2,
    justifyContent: 'center',
  },
  referenceToggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.surface,
  },
  referenceToggleCircleActive: {
    alignSelf: 'flex-end',
  },
  referenceToggleLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
});
