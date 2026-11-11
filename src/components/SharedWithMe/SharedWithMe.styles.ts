import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import { isIOS } from '../../utils/helpers';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeSharedWithMeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.surface,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
        flexGrow: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: theme.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: isIOS ? 8 : 0,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontFamily: FONTS.display_bold,
        color: theme.surface,
    },
    infoContainer: {
        flex: 1,
        marginRight: 8,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        flexWrap: 'wrap',
        gap: 6,
    },
    name: {
        fontSize: 16,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    },
    accessBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    accessBadgeText: {
        fontSize: 12,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
        textTransform: 'capitalize',
    },
    username: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: FONTS.display_regular,
        textAlign: 'center',
    },
})
