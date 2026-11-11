import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeIdentityLicenseCertificationsFormStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 17,
      fontFamily: FONTS.display_bold,
      color: theme.textPrimary,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    sectionCard: {
      // backgroundColor: theme.surface,
      borderRadius: 12,
      paddingVertical: 16,
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
      marginBottom: 8,
    },
    dropdown: {
      height: 52,
      marginBottom: 12,
    },
    halfWidth: {
      flex: 1,
      minWidth: 0,
    },
    walletRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    walletText: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
    },
    uploadSection: {
      marginTop: 8,
    },
    uploadTitle: {
      fontSize: 14,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
      marginBottom: 12,
    },
    uploadContainer: {
      borderWidth: 2,
      borderColor: theme.border,
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
    },
    uploadPlaceholder: {
      alignItems: 'center',
      gap: 8,
    },
    uploadText: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
    },
    uploadedImage: {
      width: '100%',
      height: 150,
      borderRadius: 8,
      resizeMode: 'cover',
    },
    addLicenseButton: {
      borderWidth: 1,
      marginTop: 0,
    },
    addLicenseButtonText: {
      color: colors.secondary,
      fontFamily: FONTS.display_medium,
    },
    removeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      gap: 4,
      marginBottom: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.error,
    },
    removeButtonText: {
      fontSize: 13,
      fontFamily: FONTS.display_medium,
      color: colors.error,
    },
    saveButton: {
      marginTop: 10,
    },
    errorText: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: colors.error,
      marginTop: 4,
    },
    customError: {
      marginBottom: 10, marginTop: -6
    }
  });
