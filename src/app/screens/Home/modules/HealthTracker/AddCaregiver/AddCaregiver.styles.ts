import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import FONTS from '../../../../../../utils/fonts';
import { getColorWithOpacity } from '../../../../../../utils/colors';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeStyles = (theme: RoleTheme) => StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 16,
        marginBottom: 0,
        paddingTop: 20,
    },
    HeaderTitle: {
        marginTop: 5
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        marginTop: 30,
    },
    title: {
        fontSize: 26,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputContainerNoMargin: {
        marginBottom: 0,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    noteBanner: {
        backgroundColor: getColorWithOpacity(theme.primary, 0.1),
        borderLeftWidth: 3,
        borderLeftColor: theme.primary,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    noteBannerText: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        lineHeight: 18,
        textAlign: 'left',
    },
    rowContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    halfInput: {
        flex: 1,
    },
    buttonContainer: {
        paddingBottom: 16,
    },
    saveButton: {
        paddingVertical: 16,
    },
});

export const makeDropdownStyles = (theme: RoleTheme) => StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
    },
    list: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 60,
        backgroundColor: theme.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 20,
        zIndex: 100,
        maxHeight: 240,
    },
    flatList: {
        maxHeight: 220,
    },
    loaderContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.surface,
        gap: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarPlaceholder: {
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 14,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    },
    itemUsername: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
});
