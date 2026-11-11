import { Dimensions, StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import type { RoleTheme } from '../../../types/roleManager.types';

/**
 * commonStyles — shared across multiple Business sub-screens
 * (BusinessContact, Projects, ComplianceVault, ComplianceDetail, Licenses)
 */

const { width, height } = Dimensions.get('window');
export const makeCommonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    gradientContainer: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 30,
    },
    headerContainerStyle: {
      paddingHorizontal: 16,
      marginBottom: 0,
    },
    iconContainer: {
      marginBottom: 0,
      alignItems: 'center',
    },
    headerIcon: {
      width: 78,
      height: 78,
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    title: {
      fontSize: 28,
      color: theme.surface,
      fontFamily: FONTS.display_medium,
      marginTop: 10,
      textAlign: 'center',
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginTop: 10,
      marginBottom: 16,
    },
    whiteButton: {
      backgroundColor: theme.surface,
      width: 'auto',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    whiteButtonText: {
      color: theme.textPrimary,
      fontSize: 14,
    },
    shareIconBlack: {
      width: 20,
      height: 20,
      tintColor: theme.textPrimary,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      width: '100%',
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      width: '100%',
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptyStateSubtitle: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
    actionButton: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
    },
    fullWidth: {
      width: '100%',
    },
    loadingOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      width: '100%',
    },
    searchStartIcon: {
      tintColor: theme.textPrimary,
      height: 17,
      width: 17,
    },
    searchInputContainer: {
      flex: 1,
      borderRadius: 14,
      height: 45,
    },
    searchWrapper: {
      flex: 1,
      marginTop: 15,
      marginBottom: 16,
    },
  });

/**
 * businessStyles — styles specific to Business.tsx root screen only
 */
export const makeBusinessStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    scrollContent: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingBottom: 100,
    },
    newOnboardingButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 16,
      marginBottom: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    newOnboardingButtonText: {
      color: 'white',
      fontSize: 14,
      fontFamily: FONTS.display_semi_bold,
    },
    // Business Header
    businessHeader: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      backgroundColor: theme?.isDark ? theme.surface : '#F8F9FA',
    },
    businessSelectorRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    selectBusinessText: {
      fontSize: 16,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
    },
    addBusinessButton: {
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    addBusinessText: {
      fontSize: 13,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
    },
    dropdownContainer: {
      marginBottom: 20,
    },
    businessDropdown: {
      height: 50,
      borderRadius: 12,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme?.isDark ? theme.border : '#E5E5EA',
    },
    businessCard: {
      alignItems: 'center',
      backgroundColor: theme.background,
      paddingVertical: 24,
      paddingHorizontal: 20,
      borderRadius: 16,
      shadowColor: theme.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 3,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
      backgroundColor: theme.background,
      borderRadius: 16,
    },
    emptyStateText: {
      fontSize: 16,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      marginBottom: 8,
    },
    emptyStateSubtext: {
      fontSize: 13,
      fontFamily: FONTS.display_regular,
      color: '#8E8E93',
      textAlign: 'center',
    },
    businessAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#e0e0e0',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    businessAvatarText: {
      fontSize: 28,
      fontFamily: FONTS.display_bold,
      color: theme.textPrimary,
    },
    businessInfo: {
      alignItems: 'center',
    },
    businessName: {
      fontSize: 18,
      fontFamily: FONTS.display_bold,
      color: theme.textPrimary,
      marginBottom: 4,
      textAlign: 'center',
    },
    businessType: {
      fontSize: 13,
      fontFamily: FONTS.display_regular,
      color: '#8E8E93',
      textAlign: 'center',
    },

    // Search Bar
    searchContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 12,
    },
    searchPlaceholder: {
      flex: 1,
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.placeholder,
    },

    // Tabs
    tabsContainer: {
      paddingHorizontal: 16,
      marginBottom: 8,
    },

    // Sections
    sectionsContainer: {
      paddingHorizontal: 16,
    },
    aiToggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 4,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    aiToggleLabel: {
      fontSize: 14,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
    },

    // Expandable search + Advanced Dashboard switch row
    topControlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    topControlExpanded: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      paddingVertical: 0,
    },
    iconControl: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    switchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10
    },
    switchPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 52,
      borderRadius: 14,
      overflow: 'hidden',
    },
    switchPillLabel: {
      flex: 1,
      fontSize: 15,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: FONTS.display_bold,
      color: theme.textPrimary,
      textAlign: 'left',
    },
    listContentContainer: {
      gap: 10,
      paddingVertical: 20,
    },
    sectionContent: {
      gap: 8,
    },

    // Sub Items Container
    subItemsContainer: {
      marginTop: 8,
      marginLeft: 16,
      gap: 8,
    },

    // List Item
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.background,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      shadowColor: theme.textPrimary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    listItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    icon: {
      width: 30,
      height: 30,
      tintColor: theme.textPrimary,
    },
    listItemText: {
      flex: 1,
    },
    listItemTitle: {
      fontSize: 16,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      marginBottom: 4,
      textAlign: 'left',
    },
    listItemSubtitle: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: '#8E8E93',
      textAlign: 'left',
    },

    // Sub List Item
    subListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderColor: '#f0f0f0ff',
      borderWidth: 1,
      borderLeftWidth: 3,
      borderLeftColor: theme.textPrimary,
    },
    subIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    subIcon: {
      width: 20,
      height: 20,
      tintColor: theme.textPrimary,
    },
    subListItemTitle: {
      fontSize: 15,
      fontFamily: FONTS.display_medium,
      color: theme.textPrimary,
      marginBottom: 2,
      textAlign: 'left',
    },
    subListItemSubtitle: {
      fontSize: 11,
      fontFamily: FONTS.display_regular,
      color: '#8E8E93',
      textAlign: 'left',
    },
    subItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    countBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    countBadgeText: {
      color: theme.surface,
      fontSize: 11,
      fontFamily: FONTS.display_bold,
      lineHeight: 14,
    },

    // Floating Action Button
    floating_action_btn: {
      bottom: height >= 812 ? 10 : 15,
      right: 24,
    },

    // Search Input (inside search bar)
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      paddingVertical: 0,
    },

    // Search Results Container
    searchResultsContainer: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 24,
    },

    // Empty Search State
    emptySearchState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 12,
    },

    // Empty State Title / Subtitle (for search)
    emptyStateTitle: {
      fontSize: 18,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      textAlign: 'center',
    },
    emptyStateSubtitle: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: '#8E8E93',
      textAlign: 'center',
      paddingHorizontal: 32,
    },

    // Results Count
    resultsCount: {
      fontSize: 13,
      fontFamily: FONTS.display_regular,
      color: '#8E8E93',
      marginBottom: 12,
    },

    // Result Group (category grouping)
    resultGroup: {
      marginBottom: 20,
    },
    resultGroupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    resultGroupDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    resultGroupTitle: {
      fontSize: 13,
      fontFamily: FONTS.display_semi_bold,
      color: '#8E8E93',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Individual Search Result Item
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      marginBottom: 8,
      gap: 12,
      shadowColor: theme.textPrimary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    resultIconBadge: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultContent: {
      flex: 1,
      gap: 2,
    },
    resultTitle: {
      fontSize: 15,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
    },
    resultSubtitle: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: '#8E8E93',
    },
    resultModule: {
      fontSize: 11,
      fontFamily: FONTS.display_medium,
    },
  });
