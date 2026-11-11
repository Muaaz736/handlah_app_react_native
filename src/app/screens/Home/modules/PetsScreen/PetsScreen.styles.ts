import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles shared across PetsScreen Add sub-screens
export const makeCommonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingTop: 16,
  },
  HeaderTitle: {
    marginTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  mainSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#666666',
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 10,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateGroup: {
    flex: 1,
  },
  uploadSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FFF4',
  },
  uploadText: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: colors.primary,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  skipButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
    alignSelf: 'flex-end',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    fontSize: 15,
    fontFamily: FONTS.display_medium,
    textAlign: 'center',
    fontWeight: '600',
  },
  skipText: {
    fontSize: 15,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    textAlign: 'center',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    marginTop: 4,
  }
});

// PetsScreen.tsx (main screen) specific styles
export const makePetsScreenStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    color: theme.surface,
    fontFamily: FONTS.display_bold,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
    width: '100%',
  },
  addButton: {
   backgroundColor: theme.background,
   paddingHorizontal: 15,
   paddingVertical: 12,
  },
  addButtonText: {
    color: theme.textPrimary,
    fontSize: 15,
  },
  shareButton: {
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareButtonText: {
    fontSize: 15,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#888',
    fontFamily: FONTS.display_medium,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#999999',
    fontFamily: FONTS.display_regular,
    textAlign: 'center',
  },
  petsList: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666666',
    fontFamily: FONTS.display_regular,
    marginBottom: 14,
  },
  petsTabsContainer: {
    marginBottom: 16,
  },
  petsTabsContent: {
    gap: 8,
  },
  petTab: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
  },
  petTabActive: {
    backgroundColor: colors.lightCGreen,
    borderWidth: 2,
  },
  petTabText: {
    fontSize: 14,
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
  },
  petTabTextActive: {
    fontFamily: FONTS.display_semi_bold,
  },
  sectionCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  petCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    marginBottom: 0,
  },
  overviewHeaderCollapsed: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
  overviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  overviewTitle: {
    fontSize: 15,
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
  },
  overviewSubtitle: {
    fontSize: 11,
    color: '#666666',
    fontFamily: FONTS.display_regular,
    flexShrink: 1,
  },
  overviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  overviewActionButton: {
    padding: 2,
  },
  petNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  petName: {
    fontSize: 20,
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
  },
  typeBadge: {
    backgroundColor: colors.lightCGreen,
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  typeBadgeText: {
    fontSize: 12,
    color: theme.background,
    fontFamily: FONTS.display_medium,
  },
  petInfoText: {
    fontSize: 13,
    color: '#666666',
    fontFamily: FONTS.display_regular,
    marginBottom: 14,
  },
  datesRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: '#666666',
    fontFamily: FONTS.display_regular,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 13,
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
  },
  microchipSection: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sectionLabel: {
    fontSize: 12,
    color: colors.secondary,
    fontFamily: FONTS.display_semi_bold,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#666666',
    fontFamily: FONTS.display_regular,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 12,
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
  },
  petPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginTop: 8,
  },
  sectionContainer: {
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
  },
  sectionHeaderSubtitle: {
    fontSize: 11,
    color: '#666666',
    fontFamily: FONTS.display_regular,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemHeaderLeft: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemActionButton: {
    padding: 2,
  },
  itemSubtext: {
    fontSize: 11,
    color: '#666666',
    fontFamily: FONTS.display_regular,
    marginBottom: 2,
  },
  itemNotes: {
    fontSize: 10,
    color: '#999999',
    fontFamily: FONTS.display_regular,
    marginTop: 4,
  },
  addButtonSection: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  addButtonSectionText: {
    fontSize: 15,
    color: theme.surface,
    fontFamily: FONTS.display_semi_bold,
  },
  petWhiteIcon: {
    width: 78,
    height: 78,
    resizeMode: 'contain',
    tintColor: theme.background,
  },
  shareIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  sectionIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: theme.textPrimary
  },
  actionIcon18: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  actionIcon16: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  sharedUsersSection: {
    width: '100%',
    marginTop: 12,
    marginBottom: 4,
  },
  sharedUsersHeading: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },
  chipsScrollView: {
    height: 44,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.surface,
    alignSelf: 'flex-start',
  },
  chipSelected: {
    backgroundColor: theme.background,
    borderColor: theme.surface,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  chipTextSelected: {
    color: theme.primary,
  },
});
