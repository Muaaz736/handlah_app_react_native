import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomAddNotesModalStyles = (theme: RoleTheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: theme.textSecondary,
    fontWeight: '300',
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.textSecondary,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    minHeight: 100,
    maxHeight: 200,
  },
});
