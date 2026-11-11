import { StyleSheet } from 'react-native';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeAddLoanStyles = (theme: RoleTheme) => StyleSheet.create({
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
    fullWidthContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 8,
    },
    inputContainerNoMargin: {
        marginBottom: 0,
    },
    uploadSection: {
        marginBottom: 24,
    },
    linkInfoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    linkInfoText: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        flex: 1,
        marginTop: -4,
        lineHeight: 18,
    },
    addLoanButton: {
        borderRadius: 30,
        paddingVertical: 16,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
    },
});
