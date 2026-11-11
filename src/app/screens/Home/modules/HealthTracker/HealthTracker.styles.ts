import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles shared across HealthTracker sub-form components
export const makeCommonStyles = (theme: RoleTheme) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
  },
});

// HealthTracker.tsx (main list screen) specific styles
export const makeHealthTrackerStyles = (theme: RoleTheme) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    color: theme.surface,
    fontFamily: FONTS.display_bold,
    marginTop: 8,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    marginBottom: 20,
    gap: 6,
  },
  shareButtonText: {
    color: theme.surface,
    fontFamily: FONTS.display_semi_bold,
    fontSize: 14,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientHeaderText: {
    marginLeft: 10,
  },
  patientTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  patientSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  patientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  patientTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
    marginTop: 6,
  },

  patientTagText: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  patientTagTextSelected: {
    color: theme.surface,
  },
  patientButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  selectButton: {
    flex: 1,
    backgroundColor: theme.background,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  selectButtonText: {
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    fontSize: 14,
  },
  addChildButton: {
    flex: 1,
    backgroundColor: theme.background,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  addChildButtonText: {
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionHeaderText: {
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    textAlign: 'left',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overviewContent: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  overviewLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    flex: 1,
  },
  overviewValue: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    textAlign: 'right',
  },
  overviewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  overviewTag: {
    backgroundColor: theme.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  overviewTagText: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  listContent: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.background,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  listItemText: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 4,
  },
  shareIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: theme.secondary,
  },
  shareIconSmall: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: theme.secondary,
  },
  addButton: {
    backgroundColor: colors.primary,
    marginTop: 8,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
  },
  appointmentItem: {
    backgroundColor: theme.background,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  appointmentDoctor: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  appointmentAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  appointmentAddressText: {
    fontSize: 11,
    fontFamily: FONTS.display_regular,
    color: colors.primary,
    flex: 1,
  },
  appointmentDate: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  sectionEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  sectionEmptyText: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 10,
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
    tintColor: theme.surface,
  },
  shareActionButton: {
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 20,
  },
  patientButtonsRow: {
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  caregiverSection: {
    marginTop: 12,
  },
  patientActionButton: {
    flex: 1,
    paddingVertical: 12,
  },
  addChildEmptyButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
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
