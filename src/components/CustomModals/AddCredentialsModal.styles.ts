import { Dimensions, StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

const { width } = Dimensions.get('window');

export const makeAddCredentialsModalStyles = (theme: RoleTheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme?.isDark ? 'rgba(255,255,255, 0.01)' : 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: theme.background,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.display_medium,
  },
  addButton: {
    flex: 1,
  },
});
