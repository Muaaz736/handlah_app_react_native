import { StyleSheet } from 'react-native';
import FONTS from '../../../utils/fonts';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeAccountStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    scrollContent: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingBottom: 50,
    },
    bottomPadding: {
      height: 20,
    },

    // Scheduled Deletion Banner
    deletionBanner: {
      backgroundColor: '#CC2200',
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 12,
      padding: 14,
      gap: 10,
    },
    deletionBannerContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    deletionBannerTitle: {
      fontSize: 14,
      fontFamily: FONTS.display_bold,
      color: '#ffffff',
      marginBottom: 2,
    },
    deletionBannerSubtitle: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: '#ffffff',
      opacity: 0.9,
      lineHeight: 17,
    },
    cancelDeletionBtn: {
      alignSelf: 'flex-end',
      backgroundColor: 'rgba(255,255,255,0.25)',
      borderRadius: 8,
      paddingVertical: 7,
      paddingHorizontal: 14,
    },
    cancelDeletionBtnText: {
      fontSize: 13,
      fontFamily: FONTS.display_medium,
      color: '#ffffff',
    },

    // Profile Section
    profileSection: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
    },
    avatarContainer: {
      marginBottom: 16,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 48,
      fontFamily: FONTS.display_medium,
    },
    name: {
      fontSize: 24,
      color: theme.textPrimary,
      fontFamily: FONTS.display_bold,
      marginBottom: 4,
    },
    email: {
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: FONTS.display_regular,
      marginBottom: 15,
    },
    buttonContainer: {
      width: 'auto',
    },
    editButton: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 10,
    },
    editButtonText: {
      fontSize: 16,
      color: '#ffffff',
      fontFamily: FONTS.display_regular,
    },

    // List Items
    itemContainer: {
      backgroundColor: theme.background,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: theme.border,
    },
    text: {
      fontSize: 16,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
    },
    deleteText: {
      color: '#FF3B30',
    },
    arrow: {
      fontSize: 25,
      color: theme.textPrimary,
      fontWeight: 'bold',
    },
    switchScale: {
      transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    },
    prefSectionHeader: {
      fontSize: 13,
      fontFamily: FONTS.display_semi_bold,
      color: theme.placeholder,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 8,
    },
    logoutContainer: {
      paddingHorizontal: 16,
      marginTop: 20,
    },
    logoutButton: {
      width: '100%',
      borderRadius: 15,
    },
    logoutButtonText: {
      color: '#ffffff',
    },

    // Delete Account Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    modalContainer: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 24,
      width: '100%',
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: FONTS.display_bold,
      color: theme.textPrimary,
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      marginBottom: 16,
      opacity: 0.7,
    },
    modalInput: {
      marginBottom: 20,
    },
    modalButtonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCancelBtn: {
      backgroundColor: theme.border,
    },
    modalDeleteBtn: {
      backgroundColor: '#FF3B30',
    },
    modalCancelText: {
      fontFamily: FONTS.display_medium,
      fontSize: 15,
      color: theme.textPrimary,
    },
    modalDeleteText: {
      fontFamily: FONTS.display_medium,
      fontSize: 15,
      color: '#ffffff',
    },

    // MFA Method Selection Modal
    mfaMethodOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 12,
    },
  });
