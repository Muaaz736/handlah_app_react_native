import { StyleSheet } from 'react-native';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeSelectBusinessModalStyles = (theme: RoleTheme) =>
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
      paddingVertical: 24,
      paddingHorizontal: 20,
      width: '100%',
      maxWidth: 360,
      maxHeight: '70%',
    },
    title: {
      fontSize: 18,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    businessRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border || theme.textSecondary,
    },
    businessRowText: {
      fontSize: 15,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
      flex: 1,
    },
    cancelButton: {
      marginTop: 8,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 25,
      borderWidth: 1.5,
      borderColor: theme.textPrimary,
    },
    cancelButtonText: {
      color: theme.textPrimary,
      fontFamily: FONTS.display_bold,
      fontSize: 16,
    },
  });
