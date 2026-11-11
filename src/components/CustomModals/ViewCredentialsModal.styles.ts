import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

const { width } = require('react-native').Dimensions.get('window');

export const makeViewCredentialsModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  credentialItem: {
    marginBottom: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  closeButton: {
    marginTop: 8,
  },
});
