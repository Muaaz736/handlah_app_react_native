import { StyleSheet } from 'react-native';
import colors, { getColorWithOpacity } from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeIdentityDriverLicenseFormStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    sectionTitle: {
        fontSize: 17,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    sectionCard: {
        // backgroundColor: theme.surface,
        borderRadius: 12,
        paddingVertical: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
        marginBottom: 8,
    },
    dropdown: {
        height: 52,
        marginBottom: 12,
    },
    halfWidth: {
        flex: 1,
    },
    walletRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    walletText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    uploadSection: {
        marginTop: 24,
    },
    uploadTitle: {
        fontSize: 14,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
        marginBottom: 12,
    },
    continueButton: {
        marginTop: 10,
    },
    classInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        backgroundColor: theme.surface,
        paddingHorizontal: 14,
        height: 52,
    },
    classInputText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
    },
    errorText: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: colors.error,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.textPrimary,
        fontFamily: FONTS.display_semi_bold,
        marginBottom: 20,
        textAlign: 'center',
    },
    classOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    classOption: {
        width: '30%',
        paddingVertical: 16,
        borderWidth: 1.5,
        borderColor: theme.border,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        backgroundColor: theme.surface,
    },
    classOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: getColorWithOpacity(colors.primary, 0.1),
    },
    classOptionText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.textPrimary,
        fontFamily: FONTS.display_semi_bold,
        textAlign: 'center'
    },
    classOptionTextSelected: {
        color: colors.primary,
    },
    modalCloseButton: {
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: getColorWithOpacity(theme.border, 0.3),
        borderRadius: 12,
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.textPrimary,
        fontFamily: FONTS.display_semi_bold,
    },
});
