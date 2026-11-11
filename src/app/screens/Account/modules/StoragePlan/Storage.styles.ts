import { StyleSheet } from "react-native";
import { RoleTheme } from "../../../../../types/roleManager.types";
import FONTS from "../../../../../utils/fonts";

export const makeStoragePlanStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    content: {
      padding: 16,
      gap: 14,
    },

    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
      padding: 16,
      gap: 10,
    },

    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    cardLabel: {
      fontFamily: FONTS.display_semi_bold,
      fontSize: 15,
      color: theme.textPrimary,
    },

    badge: {
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },

    badgeWrap: {
      borderRadius: 12,
      maxWidth: 160,
      paddingVertical: 8,
    },

    badgeText: {
      fontFamily: FONTS.display_semi_bold,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    planName: {
      fontFamily: FONTS.display_bold,
      fontSize: 20,
      color: theme.textPrimary,
    },

    planMeta: {
      fontFamily: FONTS.display_regular,
      fontSize: 14,
      color: theme.textSecondary,
    },

    restoreText: {
      fontFamily: FONTS.display_semi_bold,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: 6,
    },

    badgeTextWrap: {
      textAlign: 'center',
    },

    usageRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },

    usageValue: {
      fontFamily: FONTS.display_bold,
      fontSize: 22,
      color: theme.textPrimary,
    },

    usageTotal: {
      fontFamily: FONTS.display_regular,
      fontSize: 14,
      color: theme.textSecondary,
    },

    trackBar: {
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.border,
      overflow: 'hidden',
    },

    fillBar: {
      height: '100%',
      borderRadius: 5,
    },

    usageLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    percentText: {
      fontFamily: FONTS.display_regular,
      fontSize: 12,
      color: theme.textSecondary,
    },

    warningText: {
      fontFamily: FONTS.display_medium,
      fontSize: 12,
      color: '#FF3B30',
    },

    cautionText: {
      fontFamily: FONTS.display_medium,
      fontSize: 12,
      color: '#FF9500',
    },

    freeText: {
      fontFamily: FONTS.display_regular,
      fontSize: 12,
      color: theme.textSecondary,
    },

    warningNote: {
      fontFamily: FONTS.display_regular,
      fontSize: 12,
      color: '#FF3B30',
      lineHeight: 18,
    },

    manageBtn: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 4,
    },

    manageBtnText: {
      fontFamily: FONTS.display_semi_bold,
      fontSize: 15,
      color: theme.background,
    },

    resetNote: {
      fontFamily: FONTS.display_regular,
      fontSize: 12,
      color: theme.textSecondary,
    },

    noDataText: {
      fontFamily: FONTS.display_regular,
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 20,
    },

    creditRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 4,
    },

    creditChip: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 8,
      paddingHorizontal: 6,
      alignItems: 'center',
      gap: 2,
      backgroundColor: theme.background,
    },

    creditChipLabel: {
      fontFamily: FONTS.display_regular,
      fontSize: 11,
      color: theme.textSecondary,
    },

    creditChipValue: {
      fontFamily: FONTS.display_bold,
      fontSize: 15,
      color: theme.textPrimary,
    },
  });
