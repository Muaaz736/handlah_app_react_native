import { StyleSheet } from 'react-native';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddLoanMortgageStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    tabContainer: {
        marginTop: 24,
        marginBottom: 20,
    },
    activeTab: {
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        paddingBottom: 8,
    },
    activeTabText: {
        fontSize: 18,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        paddingHorizontal: 16,
    },
    formContainer: {
        borderRadius: 16,
        paddingHorizontal: 0,
    },
    inputContainer: {
        marginBottom: 0,
    },
    inputContainerNoMargin: {
        marginBottom: 0,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 20,
        backgroundColor: theme.surface,
    },
    uploadText: {
        fontSize: 15,
        fontFamily: FONTS.display_regular,
    },
    addLoanButton: {
        marginTop: 16,
        marginBottom: 16,
    },
    loansListContainer: {
        marginBottom: 20,
    },
    loanCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    loanCardContent: {
        flex: 1,
    },
    loanCardTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 4,
    },
    loanCardSubtitle: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    loanCardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    flexOne: {
        flex: 1,
    },
});