import { StyleSheet } from 'react-native';
import FONTS from '../../../../../utils/fonts';
import { isIOS } from '../../../../../utils/helpers';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeChangeColorPreferenceStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    screenContainer: {
      paddingHorizontal: 16,
    },
    headerContainer: {
      paddingTop: isIOS ? 0 : 20,
    },
    tabsContainer: {
      width: '50%',
      padding: 0,
      backgroundColor: theme.surface,
      height: 40,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabLabel: {
      fontSize: 14,
      fontFamily: FONTS.display_bold,
      color: theme.textPrimary,
    },
    activeTabLabel: {
      color: '#ffffff',
    },

    // Dark mode toggle row
    darkModeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 4,
      marginTop: 16,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      paddingLeft: 14,
      paddingRight: 10,
    },
    darkModeLabel: {
      fontSize: 15,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
    },
    darkModeSubLabel: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
      marginTop: 2,
    },
    darkModeLabelGroup: {
      flex: 1,
    },
    switchScale: {
      transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },

    pickerLabel: {
      fontSize: 16,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      marginTop: 20,
      marginBottom: 10,
      textAlign: 'left',
    },
    colorPickerContainer: {
      position: 'relative',
      marginTop: 10,
      marginBottom: 30,
    },
    pickerCard: {
      backgroundColor: theme.surface,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      padding: 30,
      borderRadius: 16,
      zIndex: 10,
    },
    bottomNotch: {
      position: 'absolute',
      bottom: -20,
      left: '50%',
      marginLeft: -20,
      width: 0,
      height: 0,
      borderLeftWidth: 20,
      borderRightWidth: 20,
      borderTopWidth: 20,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: theme.surface,
      zIndex: 20,
    },
    colorPicker: {
      width: '100%',
      gap: 20,
    },
    panel: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      height: 220,
    },
    slider: {
      borderRadius: 20,
    },
    colorValuesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    colorValueItem: {
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 6,
      marginTop: 4,
    },
    colorLabel: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      marginBottom: 4,
      textAlign: 'left',
    },
    colorValue: {
      fontSize: 14,
      fontFamily: FONTS.display_bold,
      color: theme.textPrimary,
    },
    buttonContainer: {
      marginTop: 20,
      marginBottom: 30,
    },
    colorWarningText: {
      fontSize: 13,
      fontFamily: FONTS.display_regular,
      color: '#E53E3E',
      textAlign: 'center',
      marginBottom: 10,
    },
    saveButton: {
      // backgroundColor set dynamically in component
    },
    saveButtonText: {
      color: '#ffffff',
      fontFamily: FONTS.display_bold,
    },
    resetButton: {
      alignItems: 'center',
      paddingVertical: 12,
      marginTop: 8,
    },
    resetButtonText: {
      fontSize: 16,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
    },
    previewSection: {
      marginBottom: 20,
    },
    previewLabel: {
      fontSize: 14,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      marginBottom: 10,
      textAlign: 'left',
    },
    previewRow: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
    },
    previewSwatch: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
    },
  });
