import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

const { width } = require('react-native').Dimensions.get('window');
export const makeCustomDateTimePickerStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    marginBottom: 6,
    textAlign: 'left',
    color: theme.textPrimary
  },
  requiredStar: {
    color: colors.error,
    marginLeft: 2,
  },
  focusedLabel: {
    color: colors.secondary,
  },
  activeLabel: {
    color: colors.secondary,
  },
  errorLabel: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 13,
    height: 50,
    paddingHorizontal: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.border,
  },
  focusedContainer: {
    backgroundColor: theme.surface,
  },
  errorContainer: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  disabledContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.6,
  },
  prefixIconContainer: {
    marginRight: 12,
  },
  suffixIconContainer: {
    marginLeft: 12,
  },
  clearButton: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 11,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textSecondary,
  },
  displayText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
  textWithPrefixIcon: {
    marginLeft: 0,
  },
  placeholderText: {
    color: theme.textSecondary,
    textAlign: 'left',
  },
  disabledText: {
    color: theme.textPrimary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredPickerContainer: {
    width: width * 0.85,
    backgroundColor: theme.surface,
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  pickerWrapper: {
    width: '100%',
    height: 200,
    position: 'relative',
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionHighlight: {
    position: 'absolute',
    height: 40,
    backgroundColor: colors.primary,
    left: '15%',
    right: '15%',
    width: '70%',
    alignSelf: 'center',
    top: '50%',
    transform: [{ translateY: -20 }],
    borderRadius: 10,
    zIndex: 1,
  },
  pickerColumnsContainer: {
    flexDirection: 'row',
    width: '70%',
    height: '100%',
    position: 'relative',
    zIndex: 2,
    alignSelf: 'center',
  },
  pickerColumn: {
    flex: 1,
    height: '100%',
  },
  pickerListContent: {
    paddingVertical: 80,
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPickerItem: {},
  pickerItemText: {
    fontSize: 16,
    color: '#777',
    fontFamily: FONTS.display_semi_bold,
  },
  selectedPickerItemText: {
    color: colors.secondary,
    fontSize: 24,
    fontFamily: FONTS.display_semi_bold,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    color: theme.surface,
  },
  errorText: {
    fontSize: 10,
    color: colors.error,
    marginTop: 4,
    fontFamily: FONTS.display_regular,
  },
});
