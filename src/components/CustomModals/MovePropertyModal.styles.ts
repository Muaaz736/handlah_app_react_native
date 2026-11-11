import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeMovePropertyModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  dropdownContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  dropdown: {
    borderColor: theme.border,
    borderRadius: 10,
  },
  helperText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary || '#888',
    marginTop: 6,
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
  },
  fullWidthButton: {
    flex: 1,
    paddingVertical: 14,
  },
  moveButton: {
    flex: 1,
    paddingVertical: 14,
  },
});
