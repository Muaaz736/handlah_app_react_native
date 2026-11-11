import { StyleSheet } from 'react-native';
import fonts from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeVendorAutocompleteInputStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    wrapper: {
      zIndex: 1,
    },
    dropdownList: {
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: -12,
      marginBottom: 12,
      overflow: 'hidden',
    },
    dropdownScroll: {
      maxHeight: 220,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: theme.surface,
    },
    dropdownItemTextWrapper: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    dropdownItemText: {
      fontSize: 14,
      fontFamily: fonts.display_regular,
      color: theme.textPrimary,
    },
    dropdownItemRemoveBtn: {
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
  });
