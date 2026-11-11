import { StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeAddAdHocReminderStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 30,
    },
    inputWrapper: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 15,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
      marginBottom: 10,
    },
    labelHint: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
    },
    inputContainer: {
      marginBottom: 0,
    },
    customInputContainer: {
      minHeight: 100,
      alignItems: 'flex-start',
      paddingTop: 12,
    },
    multilineInput: {
      height: 80,
      textAlignVertical: 'top',
    },
    // Frequency pills
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    pill: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 50,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    pillText: {
      fontSize: 13,
      fontFamily: FONTS.display_medium,
      color: theme.textSecondary,
    },
    pillTextActive: {
      color: theme.surface,
      fontFamily: FONTS.display_semi_bold,
    },
    // Stepper
    stepperContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 6,
      backgroundColor: theme.background,
    },
    stepperValue: {
      fontSize: 15,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
    },
    stepperButtons: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    stepperArrow: {
      padding: 2,
    },
    // Days of week
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    dayPill: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 50,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    dayPillText: {
      fontSize: 13,
      fontFamily: FONTS.display_medium,
      color: theme.textSecondary,
    },
    // Monthly date grid (1-31)
    monthlyGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    monthlyDayCell: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthlyDayCellActive: {
      borderWidth: 0,
    },
    monthlyDayCellText: {
      fontSize: 13,
      fontFamily: FONTS.display_medium,
      color: theme.textSecondary,
    },
    monthlyDayCellTextActive: {
      color: theme.surface,
      fontFamily: FONTS.display_semi_bold,
    },
    // Monthly trigger (summary row)
    monthlyTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.background,
    },
    monthlyTriggerText: {
      flex: 1,
      fontSize: 14,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
      marginRight: 8,
    },
    monthlyTriggerPlaceholder: {
      color: theme.placeholder,
    },
    // Monthly bottom-sheet modal
    monthlyModalWrapper: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    monthlyModalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    monthlyModalSheet: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 36,
    },
    monthlyModalHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
      alignSelf: 'center',
      marginBottom: 16,
    },
    monthlyModalTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    monthlyModalTitle: {
      fontSize: 16,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
    },
    monthlySelectAllText: {
      fontSize: 13,
      fontFamily: FONTS.display_medium,
    },
    monthlyModalDoneBtn: {
      marginTop: 20,
      paddingVertical: 14,
    },
    // Date / Time pickers
    datePickerContainer: {
      marginBottom: 0,
    },
    // Buttons
    buttonContainer: {
      flexDirection: 'row',
      paddingVertical: 12,
      backgroundColor: theme.background,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 2,
      paddingVertical: 0,
    },
    cancelButtonText: {},
    saveButton: {
      flex: 1,
      paddingVertical: 15,
    },
    saveButtonText: {
      color: theme.surface,
    },
    errorText: {
      fontSize: 12,
      color: '#E53E3E',
      marginTop: 6,
      marginLeft: 2,
      fontFamily: FONTS.display_regular,
    },

  });
