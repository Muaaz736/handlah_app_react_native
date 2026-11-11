import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewSubscriptionModalStyles = (theme: RoleTheme) =>
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  otherText: {
    fontSize: 14,
    fontFamily: FONTS.display_bold,
    color: theme.surface,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'capitalize',
  },
  infoContainer: {
    marginBottom: 24,
    width: '100%',
    maxHeight: 340,
  },
  infoRow: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  infoRowNotes: {
    alignItems: 'flex-start',
  },
  capitalizeText: {
    textTransform: 'capitalize',
  },
  notesText: {
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    textAlign: 'left',
    minWidth: 80,
  },
  value: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    textAlign: 'left',
    flex: 1,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#A9A9A9',
    fontStyle: 'italic',
  },
  secretValueRow: {
    flex: 1,
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
  urlText: {
    color: theme.textPrimary,
    textDecorationLine: 'underline',
  },
  closeButton: {
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  closeButtonText: {
    fontFamily: FONTS.display_bold,
    fontSize: 16,
  },
});
