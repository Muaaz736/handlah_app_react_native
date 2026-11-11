import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeLegalStyles = (theme: RoleTheme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    headerContainerStyle: {
        paddingHorizontal: 16,
        marginBottom: 0,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        color: theme.surface,
        fontFamily: FONTS.display_bold,
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    whiteButton: {
        backgroundColor: theme.background,
        width: 'auto',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    whiteButtonText: {
        color: theme.textPrimary,
        fontSize: 14,
    },
    documentsList: {
        width: '100%',
    },
    documentCard: {
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    addButton: {
        backgroundColor: theme.background,
        width: 'auto',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    addButtonText: {
        color: theme.textPrimary,
        fontSize: 14,
    },
    shareButton: {
        backgroundColor: theme.background,
        width: 'auto',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    shareButtonText: {
        color: theme.textPrimary,
        fontSize: 14,
    },
    shareIconBlack: {
        width: 20,
        height: 20,
        tintColor: theme.textPrimary,
    },
    shareIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    documentTitle: {
        fontSize: 14,
        color: theme.textPrimary,
        fontFamily: FONTS.display_bold,
        flex: 1,
        textAlign: 'left',
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typeBadge: {
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    typeBadgeText: {
        fontSize: 12,
        color: theme.background,
        fontFamily: FONTS.display_semi_bold,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    iconButton: {
        padding: 2,
    },
    cardBody: {
        marginTop: 4,
    },
    datesRow: {
        flexDirection: 'row',
        marginBottom: 8,
        gap: 12,
    },
    dateItem: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 12,
        color: '#666666',
        fontFamily: FONTS.display_regular,
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 14,
        color: theme.textPrimary,
        fontFamily: FONTS.display_semi_bold,
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    fileName: {
        fontSize: 13,
        color: theme.textPrimary,
        fontFamily: FONTS.display_regular,
        flex: 1,
        marginRight: 8,
    },
    cardNotes: {
        fontSize: 13,
        color: '#666666',
        fontFamily: FONTS.display_regular,
        marginTop: 8,
        lineHeight: 18,
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
    legalScreenIcon: {
        width: 78,
        height: 78,
        resizeMode: 'contain',
        tintColor: theme.background,
    },
    loadingIndicator: {
        marginVertical: 20,
    },
    actionIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
});
