import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import { isIOS } from '../../utils/helpers';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCommonAuthStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    scrollContentWithPadding: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    contentContainer: {
      flex: 1,
      padding: 18,
      paddingTop: isIOS ? 60 : 30,
    },
    formContainer: {
      width: '100%',
    },
    footerContainer: {
      paddingHorizontal: 18,
      paddingBottom: 40,
      paddingTop: 16,
      backgroundColor: theme.background,
    },
    footerContainerNoPaddingTop: {
      paddingHorizontal: 18,
      paddingBottom: 40,
      backgroundColor: theme.background,
    },
  });

export const makeIdentitySetupStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    headerContainer: {
      paddingHorizontal: 18,
      paddingTop: isIOS ? 60 : 30,
    },
    sectionHeader: {
      marginTop: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
      paddingBottom: 12,
      paddingHorizontal: 18,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.textPrimary,
      fontFamily: FONTS.display_medium,
      textAlign: 'left',
    },
    contentContainerHorizontalPadding: {
      paddingHorizontal: 18,
    },
    inputWrapper: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textPrimary,
      fontFamily: FONTS.display_medium,
      marginBottom: 8,
      textAlign: 'left',
    },
    rowInputs: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    halfInput: {
      flex: 1,
    },
    skipButton: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    skipText: {
      fontSize: 15,
      color: theme.textSecondary,
      fontFamily: FONTS.display_regular,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
    },
    errorTextWithFont: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
      fontFamily: FONTS.display_regular,
    },
    uploadSection: {
      marginBottom: 20,
    },
    uploadLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textPrimary,
      fontFamily: FONTS.display_medium,
      marginBottom: 12,
    },
    dateInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      backgroundColor: theme.background,
      paddingHorizontal: 14,
      height: 52,
    },
    dateInputText: {
      fontSize: 14,
      color: theme.placeholder,
      fontFamily: FONTS.display_regular,
    },
    uploadBox: {
      borderWidth: 1.5,
      borderColor: theme.border,
      borderStyle: 'dashed',
      borderRadius: 8,
      paddingVertical: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAFAFA',
    },
    uploadText: {
      fontSize: 14,
      color: theme.textPrimary,
      fontFamily: FONTS.display_medium,
      marginTop: 8,
    },
  });

export const makeVerificationStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    resendContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    resendText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: FONTS.display_medium,
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textPrimary,
      fontFamily: FONTS.display_bold,
    },
    resendActiveText: {
      fontSize: 14,
      color: theme.textPrimary,
      fontWeight: '700',
      fontFamily: FONTS.display_medium,
      textDecorationLine: 'underline',
    },
    helpContainer: {
      marginTop: 20,
    },
    helpText: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      fontFamily: FONTS.display_regular,
    },
    linkText: {
      color: theme.textPrimary,
      fontWeight: '700',
      fontFamily: FONTS.display_medium,
      textDecorationLine: 'underline',
    },
  });

// Keep old names as aliases for backward compatibility during migration
export const commonStyles = makeCommonAuthStyles;
export const identitySetupStyles = makeIdentitySetupStyles;
export const verificationStyles = makeVerificationStyles;
