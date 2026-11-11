import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewBookmarkModalStyles = (theme: RoleTheme) =>
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
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeTag: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  typeTagText: {
    fontSize: 14,
    color: theme.background,
    fontFamily: FONTS.display_semi_bold,
  },
  closeIcon: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 20,
    textAlign: 'left',
  },
  contentScroll: {
    maxHeight: 300,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textSecondary,
    marginBottom: 8,
  },

  linkValue: {
    fontSize: 16,
    fontFamily: FONTS.display_regular,
    textDecorationLine: 'underline',
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 16,
    color: theme.textSecondary,
    flex: 1,
    fontFamily: FONTS.display_regular,
  },
  secretValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secretValue: {
    flexShrink: 1,
  },
  secretToggle: {
    padding: 2,
  },
  noteSection: {
    marginTop: 12,
  },
  noteText: {
    fontSize: 15,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 22,
  },
  closeButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
  },
});
