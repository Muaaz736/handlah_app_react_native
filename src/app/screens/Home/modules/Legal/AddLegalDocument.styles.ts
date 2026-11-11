import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeAddLegalDocumentStyles = (theme: RoleTheme) => StyleSheet.create({
    headerContainerStyle: {
        paddingHorizontal: 16,
        marginBottom: 0,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 10,
    },
    datesRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    dateGroup: {
        flex: 1,
    },
    uploadSection: {
        marginTop: 10,
    },
    uploadBox: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        marginTop: 8,
    },
    footer: {
        paddingBottom: 20,
        paddingTop: 16,
        backgroundColor: theme.background,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        marginTop: 4,
    },
    clearDateText: {
        fontSize: 12,
        fontFamily: FONTS.display_medium,
        color: colors.error,
        marginTop: 4,
        textAlign: 'right',
    },
});
