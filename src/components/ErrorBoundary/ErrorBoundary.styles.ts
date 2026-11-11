import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeErrorBoundaryStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: '#FFF3F3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  errorTitle: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: '#D32F2F',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: '#D32F2F',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#5B7FFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.surface,
    textAlign: 'center',
  },
});
