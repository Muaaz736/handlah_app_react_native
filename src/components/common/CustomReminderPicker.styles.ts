import { StyleSheet } from 'react-native';
import { getColorWithOpacity } from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomReminderPickerStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  reminderSection: {
    marginBottom: 24,
  },
  reminderLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    marginBottom: 16,
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    rowGap: 12,
  },
  gradient: {
    borderRadius: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: theme.border,
    minWidth: 70,
    alignItems: 'center',
  },
  reminderButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderColor: 'transparent',
  },
  reminderButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666666',
    fontFamily: FONTS.display_medium,
  },
  reminderButtonTextActive: {
    color: theme.textPrimary,
    fontWeight: '600',
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  modalCancelButton: {
    backgroundColor: getColorWithOpacity(theme.border, 0.3),
  },
  modalConfirmButton: {
    backgroundColor: theme.textPrimary,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
  },
});
