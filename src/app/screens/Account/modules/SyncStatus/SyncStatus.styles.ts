import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';
import colors from '../../../../../utils/colors';

export const makeSyncStatusStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    main: {
      flex: 1,
      paddingHorizontal: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Summary Bar
    summaryBar: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      marginTop: 12,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'space-around',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    summaryItem: {
      alignItems: 'center',
      flex: 1,
    },
    summaryCount: {
      fontSize: 22,
      fontFamily: FONTS.display_bold,
      color: theme.textPrimary,
      marginTop: 4,
    },
    summaryLabel: {
      fontSize: 11,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
      marginTop: 2,
    },
    summaryDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.textSecondary,
    },

    // Actions
    actionsRow: {
      flexDirection: 'row',
      paddingHorizontal: 4,
      marginTop: 12,
      gap: 10,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 6,
    },
    actionBtnText: {
      fontSize: 13,
      fontFamily: FONTS.display_semi_bold,
      color: theme.surface,
    },
    clearBtn: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: colors.error,
    },

    // Tabs
    tabRow: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 8,
      gap: 8,
    },
    tab: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    tabText: {
      fontSize: 12,
      fontFamily: FONTS.display_medium,
      color: theme.textSecondary,
    },
    tabTextActive: {
      color: theme.textPrimary,
    },

    // List
    listContent: {
      paddingBottom: 40,
      flexGrow: 1,
    },

    // Card
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginTop: 10,
      padding: 14,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 10,
    },
    cardInfo: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 15,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
    },
    cardStatus: {
      fontSize: 12,
      fontFamily: FONTS.display_medium,
      marginTop: 2,
    },
    removeBtn: {
      padding: 4,
    },
    cardBody: {
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 10,
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    cardLabel: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
    },
    cardValue: {
      fontSize: 12,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
    },
    errorRow: {
      marginTop: 6,
      backgroundColor: '#FFF5F5',
      padding: 8,
      borderRadius: 6,
    },
    errorText: {
      fontSize: 11,
      fontFamily: FONTS.display_regular,
      color: colors.error,
    },
    redoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      gap: 6,
    },
    redoBtnText: {
      fontSize: 13,
      fontFamily: FONTS.display_semi_bold,
    },

    // Empty
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 80,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 13,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
      marginTop: 6,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
  });
