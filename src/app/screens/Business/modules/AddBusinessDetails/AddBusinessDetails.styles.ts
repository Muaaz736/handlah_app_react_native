import { StyleSheet } from 'react-native';
import FONTS from '../../../../../utils/fonts';
import colors from '../../../../../utils/colors';
import { isIOS } from '../../../../../utils/helpers';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeAddBusinessDetailsStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  // B-003: tighter header — back button and title are now visually aligned
  headerContainerStyle: {
    paddingHorizontal: 16,
    marginBottom: 4,
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
  },
  // B-003: reduce extra top gap on Android
  headerMain: {
    marginTop: isIOS ? 0 : 8,
  },
  // B-005: reduce top padding so subtitle isn't too far from first field
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  formContainer: {
    gap: 8,
    paddingTop: 8,
    paddingBottom: 0,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 0,
  },
  // B-008: allow dropdown overlay to escape the row clip boundary
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    zIndex: 10,
    overflow: 'visible',
  },
  halfWidth: {
    flex: 1,
    zIndex: 10,
    overflow: 'visible',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'left',
  },
  // B-008/B-009: ensure dropdown list is not clipped and long text wraps
  dropdownContainer: {
    marginBottom: 0,
    zIndex: 10,
    overflow: 'visible',
  },
  // B-007: reduce gap between last field and submit button
  buttonContainer: {
    marginTop: 16,
  },
  addButton: {
    borderRadius: 30,
    paddingVertical: 16,
  },
  addButtonText: {
    color: theme.surface,
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
  },
});
