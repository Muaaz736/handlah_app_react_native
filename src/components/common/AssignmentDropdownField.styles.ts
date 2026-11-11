import { StyleSheet } from 'react-native';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeAssignmentDropdownFieldStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    lockedBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      minHeight: 52,
    },
    lockedText: {
      flex: 1,
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
    },
    disabledOverlay: {
      opacity: 0.55,
    },
    item: {
      padding: 17,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemDisabled: {
      opacity: 0.5,
    },
    itemText: {
      flex: 1,
      fontSize: 16,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      textAlign: 'left',
    },
    readOnlyBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: theme.border,
      marginLeft: 8,
    },
    readOnlyBadgeText: {
      fontSize: 11,
      fontFamily: FONTS.display_medium,
      color: theme.textSecondary,
    },
    sectionMessage: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: '#DC2626',
      marginTop: 6,
    },
  });
