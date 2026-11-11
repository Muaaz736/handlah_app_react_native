import { StyleSheet } from 'react-native';
import FONTS from '../../../utils/fonts';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeSearchResultsStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchInputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      padding: 0,
      margin: 0,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
      paddingTop: 8,
      flexGrow: 1,
    },
    resultsCount: {
      fontSize: 13,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
      marginBottom: 12,
      marginTop: 4,
    },
    groupContainer: {
      marginBottom: 20,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    groupDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    groupTitle: {
      fontSize: 13,
      fontFamily: FONTS.display_bold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    groupBadge: {
      backgroundColor: theme.surface,
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    groupBadgeText: {
      fontSize: 11,
      fontFamily: FONTS.display_medium,
      color: theme.textSecondary,
    },
    groupCard: {
      backgroundColor: theme.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: 12,
    },
    resultRowLast: {
      borderBottomWidth: 0,
    },
    iconBadge: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    resultContent: {
      flex: 1,
      gap: 2,
    },
    resultTitle: {
      fontSize: 14,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
    },
    resultSubtitle: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
    },
    resultModule: {
      fontSize: 11,
      fontFamily: FONTS.display_regular,
      color: theme.placeholder,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: FONTS.display_bold,
      color: theme.textPrimary,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
    },
  });
