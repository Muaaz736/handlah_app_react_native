import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles shared across BankingOrFinance screens
export const makeCommonStyles = (theme: RoleTheme) => StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    headerContainerStyle: {
        paddingHorizontal: 16,
        marginBottom: 0,
    },
});

// BankingFinance screen-specific styles
export const makeBankingFinanceStyles = (theme: RoleTheme) => StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    iconContainer: {
        marginBottom: 0,
        alignItems: 'center',
    },
    bankIconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        color: theme.surface,
        fontFamily: FONTS.display_bold,
        marginTop: 8,
        textAlign: 'center',
    },
    buttonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
    },
    accountsSection: {
        width: '100%',
        marginTop: 32,
    },
    accountCard: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: 18,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 4,
    },
    accountType: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        padding: 4,
    },
    balanceBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    balanceText: {
        fontSize: 16,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
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
    bankIcon: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        tintColor: theme.surface,
    },
    whiteButton: {
        backgroundColor: theme.background,
        width: 'auto',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    blackText: {
        color: theme.textPrimary,
    },
    shareIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
    },
    actionIcon: {
        width: 18,
        height: 18,
    },
});
