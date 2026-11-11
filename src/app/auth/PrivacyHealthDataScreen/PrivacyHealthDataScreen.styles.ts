import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makePrivacyHealthDataStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 18,
    paddingTop: isIOS ? 60 : 30,
  },
  optionsContainer: {
    marginTop: -15,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: theme.textPrimary,
    fontFamily: FONTS.display_regular,
    marginRight: 16,
    textAlign: 'left',
  },
  footerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: theme.background,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  disableModalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  disableModalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBody: {
    maxHeight: 340,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  bulletList: {
    marginBottom: 8,
  },
  bulletItem: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  withdrawText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 22,
  },
  consentContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.textPrimary,
    borderColor: theme.textPrimary,
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.background,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  enableButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: theme.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enableButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  enableButtonText: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.surface,
  },
});
