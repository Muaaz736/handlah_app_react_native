import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';

export const makeAiChatbotStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  flex: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  // Media picker bottom-sheet modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    backgroundColor: theme.background,
    gap: 14,
    marginBottom: 10,
  },
  modalOptionText: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  modalCancel: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: FONTS.display_medium,
    color: theme.textSecondary,
  },
});
