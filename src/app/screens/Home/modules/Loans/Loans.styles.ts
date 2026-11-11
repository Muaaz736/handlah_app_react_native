import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles shared across Loans module components
export const makeCommonStyles = (theme: RoleTheme) => StyleSheet.create({
    scrollView: {
        flex: 1,
    },
});

// Loans.tsx (main list screen) specific styles
export const makeLoansStyles = (theme: RoleTheme) => StyleSheet.create({
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    safeArea: {
        flex: 1,
    },
    iconContainer: {
        marginBottom: 0,
        alignItems: 'center',
    },
    loanIconWrapper: {
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
    totalsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 24,
        marginBottom: 8,
        paddingHorizontal: 0,
    },
    totalItem: {
        flex: 1,
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
        fontFamily: FONTS.display_medium,
        color: theme.textSecondary,
        textAlign: 'center',
        marginBottom: 4,
    },
    totalValue: {
        fontSize: 15,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
        textAlign: 'center',
    },
    loansSection: {
        width: '100%',
        marginTop: 16,
        textAlign: 'left',
    },
    loanCard: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        textAlign: 'left',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardInfoLeft: {
        flex: 1,
        minWidth: 0,
        marginRight: 8,
    },
    loanInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        textAlign: 'left',
        flexShrink: 1,
        overflow: 'hidden',
        marginRight: 8,
    },
    loanName: {
        fontSize: 18,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        textAlign: 'left',
        flexShrink: 1,
        maxWidth: '70%',
    },
    balanceBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        flexShrink: 0,
    },
    balanceText: {
        fontSize: 14,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        padding: 4,
    },
    lenderText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        marginBottom: 4,
        textAlign: 'left',
        maxWidth: '75%',
    },
    paymentText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        marginBottom: 2,
        textAlign: 'left',
    },
    paymentLabel: {
        fontFamily: FONTS.display_semi_bold,
        textAlign: 'left',
    },
    paymentValue: {
        color: theme.textPrimary,
        fontFamily: FONTS.display_regular,
        textAlign: 'left',
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
    gradientContainer: {
        flex: 1,
    },
    headerContainerStyle: {
        paddingHorizontal: 16,
        marginBottom: 0,
    },
    loanIcon: {
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
    actionIcon: {
        width: 20,
        height: 20,
    },
});
