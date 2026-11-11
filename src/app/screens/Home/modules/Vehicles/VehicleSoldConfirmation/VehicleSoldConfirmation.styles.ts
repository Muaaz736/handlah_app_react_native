import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeVehicleSoldConfirmationStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    soldToText: {
        fontSize: 16,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        marginBottom: 32,
        lineHeight: 24,
    },
    emailText: {
        fontFamily: FONTS.display_semi_bold,
    },
    sectionLabel: {
        fontSize: 15,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        marginBottom: 12,
    },
    uploadBox: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        backgroundColor: theme.surface,
    },
    uploadText: {
        fontSize: 16,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
        marginTop: 8,
    },
    historyText: {
        fontSize: 15,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        marginBottom: 32,
        lineHeight: 22,
    },
    shareButton: {
        borderRadius: 30,
        paddingVertical: 16,
    },
});
export const makeDropdownStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    trigger: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: theme.surface,
    },
    triggerText: {
        fontFamily: FONTS.display_regular,
        fontSize: 14,
    },
    list: {
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 4,
        backgroundColor: theme.surface,
        overflow: 'hidden',
        maxHeight: 200,
    },
    item: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.surface ?? '#eee',
    },
    itemName: {
        fontFamily: FONTS.display_medium,
        fontSize: 14,
        color: theme.textPrimary,
    },
    itemSub: {
        fontFamily: FONTS.display_regular,
        fontSize: 12,
        color: theme.textSecondary,
        marginTop: 2,
    },
    emptyText: {
        fontFamily: FONTS.display_regular,
        fontSize: 13,
        color: theme.textSecondary,
        padding: 12,
        textAlign: 'center',
    },
});
