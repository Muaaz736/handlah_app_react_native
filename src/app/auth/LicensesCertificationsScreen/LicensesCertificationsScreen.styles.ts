import { StyleSheet } from 'react-native';
import { getColorWithOpacity } from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeLicensesCertificationsStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 18,
    paddingTop: isIOS ? 60 : 30,
  },
  sectionHeader: {
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 12,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    textAlign: 'left',
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  formContainer: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    borderTopWidth: 3,
    borderTopColor: theme.border,
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    marginBottom: 8,
    textAlign: 'left',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
    paddingHorizontal: 14,
    height: 52,
  },
  dropdownText: {
    fontSize: 14,
    color: theme.textPrimary,
    fontFamily: FONTS.display_regular,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
    paddingHorizontal: 14,
    height: 52,
  },
  dateInputText: {
    fontSize: 14,
    color: theme.placeholder,
    fontFamily: FONTS.display_regular,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    marginBottom: 12,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: theme.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadText: {
    fontSize: 14,
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    marginTop: 8,
  },
  addLicenseContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  tipText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: FONTS.display_regular,
    textAlign: 'left',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  addedLicensesSection: {
    marginTop: 12,
  },
  licenseCard: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  licenseCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  licenseCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
  },
  licenseCardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  footerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: theme.surface,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontFamily: FONTS.display_regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
    marginBottom: 20,
    textAlign: 'center',
  },
  typeOptionsContainer: {
    maxHeight: 350,
    marginBottom: 20,
  },
  typeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: theme.surface,
  },
  typeOptionSelected: {
    borderColor: theme.textPrimary,
    backgroundColor: getColorWithOpacity(theme.textPrimary, 0.05),
  },
  typeOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    flex: 1,
  },
  typeOptionTextSelected: {
    color: theme.textPrimary,
    fontWeight: '600',
  },
  modalCloseButton: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: getColorWithOpacity(theme.border, 0.3),
    borderRadius: 12,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    fontFamily: FONTS.display_regular,
  },
});
