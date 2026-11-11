import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeAddBankAccountStyles = (theme: RoleTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 30,
    },
    formContainer: {
        backgroundColor: theme.background,
    },
    rowContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    halfInput: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 8,
        textAlign: 'left',
    },
    inputContainerNoMargin: {
        marginBottom: 0,
    },
    notesInput: {
        borderRadius: 12,
        padding: 16,
        minHeight: 100,
        fontSize: 15,
        borderColor: theme.border,
        borderWidth: 1,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        backgroundColor: theme.background,
        textAlign: 'left',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    checkboxLabel: {
        fontSize: 15,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    },
    walletContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    walletLabel: {
        fontSize: 15,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#D3D3D3',
        padding: 2,
        justifyContent: 'center',
    },
    toggleActive: {
        backgroundColor: colors.primary,
    },
    toggleCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.surface,
    },
    toggleCircleActive: {
        alignSelf: 'flex-end',
    },
    plannedPaymentsSection: {
        marginBottom: 24,
    },
    paymentCard: {
        backgroundColor: theme.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 16,
        marginBottom: 12,
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    paymentNumber: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        flex: 1,
    },
    paymentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    paymentActionBtn: {
        padding: 4,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
        marginBottom: 16,
    },
    addMoreButton: {
        // backgroundColor: colors.lightCGreen,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    addMoreText: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    uploadSection: {
        marginBottom: 24,
    },
    uploadBox: {
        borderWidth: 2,
        borderStyle: 'dashed',
        // borderColor: theme.textSecondary,
        borderRadius: 12,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
    },
    uploadText: {
        fontSize: 16,
        fontFamily: FONTS.display_medium,
        // color: theme.textPrimary,
        marginTop: 8,
    },
    addAccountButton: {
        borderRadius: 30,
        paddingVertical: 16,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    headerTitleStyle: {
        marginBottom: 0,
        marginTop: 10,
        textAlign: 'left',
    },
    datePickerInputContainer: {
        borderRadius: 9,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
    },
});
