import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeShareModalStyles = (theme: RoleTheme) =>
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
    maxWidth: 400,
    maxHeight: '85%',
    overflow: 'visible',
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 12,
  },
  dropdownWrapper: {
    zIndex: 1000,
    elevation: 1000,
    marginBottom: 8,
  },
  dropdown: {},
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
  permissionScroll: {
    maxHeight: 220,
    marginBottom: 4,
  },
  permissionTitle: {
    fontSize: 15,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  permissionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.background,
    borderRadius: 12,
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    flex: 1,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.textPrimary,
  },
  cancelButtonText: {
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
    fontSize: 16,
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
