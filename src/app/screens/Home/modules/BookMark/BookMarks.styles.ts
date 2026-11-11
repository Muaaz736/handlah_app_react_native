import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';


// Common styles shared across Add + Edit bookmark forms
export const makeCommonStyles = (theme: RoleTheme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingTop: 16,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },
    title: {
        fontSize: 28,
        color: theme.textPrimary,
        fontFamily: FONTS.display_bold,
        marginBottom: 12,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 16,
        color: theme.textPrimary,
        fontFamily: FONTS.display_regular,
        marginBottom: 32,
        lineHeight: 24,
        textAlign: 'left',
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: theme.textPrimary,
        fontFamily: FONTS.display_medium,
        marginBottom: 8,
    },
    buttonsContainer: {
        gap: 16,
        marginTop: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: theme.background,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        color: theme.textPrimary,
        fontFamily: FONTS.display_semi_bold,
        marginBottom: 8,
        marginTop: 12,
        textAlign: 'left',
    },
    modalInput: {
        marginBottom: 0,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: theme.background,
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.textPrimary,
    },
    cancelButtonText: {
        color: theme.textPrimary,
        fontFamily: FONTS.display_semi_bold,
        fontSize: 16,
    },
    addButton: {
        flex: 1,
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    addButtonText: {
        color: theme.surface,
        fontFamily: FONTS.display_semi_bold,
        fontSize: 16,
    },
});

// BookMarks.tsx (main list screen) specific styles
export const makeBookMarkListStyles = (theme: RoleTheme) => StyleSheet.create({
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    iconContainer: {
        marginBottom: 20,
    },
    bookmarkScreenIcon: {
        width: 78,
        height: 78,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 32,
        color: theme.surface,
        fontFamily: FONTS.display_bold,
        marginBottom: 28,
        textAlign: 'center',
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
        alignItems: 'center',
    },
    addButton: {
        backgroundColor: theme.background,
        width: 'auto',
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    addButtonText: {
        color: theme.textPrimary,
        fontSize: 16,
    },
    shareButton: {
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    shareButtonText: {
        color: theme.textPrimary,
        fontSize: 16,
    },
    bookmarksList: {
        width: '100%',
        marginTop: 30,
    },
    listHeader: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 12,
    },
    bookmarkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.surface,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    platformIcon: {
        marginRight: 10,
    },
    accountDetails: {
        justifyContent: 'center',
        flex: 1,
    },
    platformName: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    username: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        padding: 4,
    },
    shareIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
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
    loadingIndicator: {
        marginVertical: 20,
    },
});
