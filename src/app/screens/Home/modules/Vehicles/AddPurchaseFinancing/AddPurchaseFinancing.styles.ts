import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddPurchaseFinancingStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    addLoanButton: {
        marginTop: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    addVehicleButton: {
        marginTop: 8,
    },
    skipButton: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 10,
        alignSelf: 'flex-end',
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        backgroundColor: 'transparent',
        marginRight: 16,
    },
    skipButtonText: {
        fontSize: 15,
        fontFamily: FONTS.display_medium,
        textAlign: 'center',
        fontWeight: '600',
    },
    skipText: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
    },
    loansListContainer: {
        marginBottom: 20,
    },
    loanCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        backgroundColor: theme.surface,
    },
    loanCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    loanHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    loanCardTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    amountBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    amountBadgeText: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    loanCardSubtitle: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        marginBottom: 4,
    },
    loanCardInfo: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    loanCardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionIcon: {
        padding: 4,
    },
});