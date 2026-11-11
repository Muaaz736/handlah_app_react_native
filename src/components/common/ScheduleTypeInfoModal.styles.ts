import { StyleSheet } from 'react-native';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeScheduleTypeInfoModalStyles = (theme: RoleTheme) =>
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
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontFamily: FONTS.display_bold,
      color: theme.textPrimary,
    },
    closeButton: {
      padding: 2,
      marginLeft: 12,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary || '#888',
      marginTop: 6,
      marginBottom: 16,
      lineHeight: 18,
    },
    list: {
      marginBottom: 16,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      gap: 12,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemTextContainer: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 14,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      marginBottom: 2,
    },
    itemDescription: {
      fontSize: 13,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary || '#888',
      lineHeight: 18,
    },
    gotItButton: {
      borderRadius: 25,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gotItButtonText: {
      color: '#fff',
      fontFamily: FONTS.display_bold,
      fontSize: 16,
    },
  });
