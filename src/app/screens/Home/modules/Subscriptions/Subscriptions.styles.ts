import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles shared across Subscriptions module components
export const makeCommonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
  });

// Subscriptions.tsx (main list screen) specific styles
export const makeSubscriptionsStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingVertical: 8,
      paddingHorizontal: 20,
    },
    backButton: {
      width: 35,
      height: 35,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      alignItems: 'center',
      paddingTop: 40,
    },
    iconContainer: {
      marginBottom: 24,
    },
    title: {
      fontSize: 32,
      color: theme.surface,
      fontFamily: FONTS.display_bold,
      marginBottom: 32,
      textAlign: 'center',
    },
    buttonsRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 12,
      marginBottom: 24,
      paddingHorizontal: 12,
    },
    addButton: {
      flex: 1,
      minWidth: 0,
      backgroundColor: theme.surface,
      borderRadius: 25,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonText: {
      flexShrink: 1,
      color: theme.textPrimary,
      fontFamily: FONTS.display_semi_bold,
      fontSize: 15,
      textAlign: 'center',
    },
    shareButton: {
      flexShrink: 0,
      borderRadius: 25,
      paddingVertical: 14,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    shareButtonText: {
      fontFamily: FONTS.display_semi_bold,
      fontSize: 15,
    },
    shareIconBtn: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
    },
    totalsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 12,
      marginBottom: 20,
    },
    totalItem: {
      flexGrow: 1,
      flexBasis: '28%',
      marginBottom: 8,
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 6,
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginHorizontal: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
      elevation: 2,
    },
    totalLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      fontFamily: FONTS.display_medium,
      textAlign: 'center',
      marginBottom: 4,
    },
    totalValue: {
      fontSize: 15,
      color: theme.textPrimary,
      fontFamily: FONTS.display_bold,
      textAlign: 'center',
    },
    subscriptionsList: {
      width: '100%',
      paddingHorizontal: 12,
    },
    subscriptionCard: {
      width: '100%',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      flex: 1,
      minWidth: 0,
    },
    subscriptionName: {
      fontSize: 18,
      color: theme.textPrimary,
      fontFamily: FONTS.display_bold,
      flex: 1,
      minWidth: 0,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconButton: {
      padding: 4,
    },
    cardBody: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    renewalLabel: {
      fontSize: 13,
      color: '#666666',
      fontFamily: FONTS.display_regular,
      marginBottom: 4,
    },
    renewalDate: {
      fontSize: 15,
      color: theme.textPrimary,
      fontFamily: FONTS.display_semi_bold,
    },
    costBadge: {
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    costText: {
      fontSize: 14,
      color: theme.textPrimary,
      fontFamily: FONTS.display_semi_bold,
    },
    emptyStateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 60,
      paddingBottom: 40,
      gap: 16,
    },
    emptyIconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: '#E5E5E5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: '#888',
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: 220,
    },
    subscriptionIcon: {
      width: 78,
      height: 78,
      resizeMode: 'contain',
      tintColor: theme.background,
    },
    shareIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
    },
    sectionHeader: {
      fontSize: 15,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      marginBottom: 10,
      marginTop: 4,
      alignSelf: 'flex-start',
    },
    loadingIndicator: {
      marginVertical: 20,
    },
    actionIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
    },
  });
