import { Dimensions, StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

const { width } = Dimensions.get('window');

export const makeCustomEditPermissionAccessModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.surface,
    borderRadius: 25,
    width: width * 0.85,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  // The main content row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.textSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  itemTitle: {
    fontSize: 15,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // Inline label + box: "View ☑"
  inlineCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxLabel: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
  },
  checkmark: {
    width: 10,
    height: 7,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: theme.surface,
    transform: [{ rotate: '-45deg' }],
    marginBottom: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: theme.textPrimary,
    borderWidth: 1,
    paddingVertical: 10,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
  },
  shareButton: {
    flex: 1,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  shareButtonText: {
    color: theme.surface,
    fontFamily: FONTS.display_bold,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
