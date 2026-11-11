import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeAddChildModalStyles = (theme: RoleTheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: theme.background,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  datePickerContainer: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.background,
    borderWidth: 1.5,
    borderColor: theme.surface || '#e0e0e0',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    fontSize: 16,
  },
  addButton: {
    flex: 1,
  },
  addButtonText: {
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
    fontSize: 16,
  },
});
