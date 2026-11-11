import { StyleSheet } from 'react-native';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomDropDownStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    dropdown: {
      height: 52,
      backgroundColor: theme.surface,
      borderColor: theme.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
    },
    dropdownContainer: {
      borderRadius: 12,
      borderWidth: 1,
      maxHeight: 300,
      backgroundColor: theme.surface,
      borderColor: theme.border
    },
    icon: {
      marginRight: 12,
    },
    item: {
      padding: 17,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      textAlign: 'left',
    },
    addNewItem: {
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border || '#e5e5e5',
    },
    textItem: {
      flex: 1,
      fontSize: 16,
      fontFamily: FONTS.display_regular,
      textAlign: 'left',
      color: theme.textPrimary
    },
    addNewText: {
      color: theme.textPrimary,
      fontFamily: FONTS.display_medium,
    },
    placeholderStyle: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
    },
    selectedTextStyle: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      flexShrink: 1,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      borderColor: theme.textSecondary,
      borderRadius: 6
    },
  });

export const makeCustomDropDownChipStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginRight: 6,
      marginTop: 6,
      gap: 5,
      maxWidth: 160,
    },
    chipLabel: {
      fontSize: 14,
      fontFamily: FONTS.display_medium,
      color: theme.surface,
      flexShrink: 1,
    },
  });
