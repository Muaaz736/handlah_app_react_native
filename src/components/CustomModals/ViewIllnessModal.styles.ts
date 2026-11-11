import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewIllnessModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 40,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    modalContainer: {
        backgroundColor: theme.surface,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 40,
        width: '100%',
        maxWidth: 420,
        maxHeight: '90%',
        flexShrink: 1,
    },
    scrollView: {
        flexGrow: 0,
        flexShrink: 1,
    },
    topIconContainer: {
        position: 'absolute',
        top: -30,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    topIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: theme.surface,
    },
    scrollContent: {
        paddingBottom: 16,
        flexGrow: 1,
    },
    footer: {
        paddingTop: 6,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
    },
    headerTextBlock: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        marginTop: 2,
    },
    statusPill: {
        backgroundColor: colors.lightCGreen,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontFamily: FONTS.display_semi_bold,
        color: colors.secondary,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: theme.textPrimary,
        marginVertical: 14,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: FONTS.display_semi_bold,
        color: theme?.isDark ? theme.primary : theme.secondary,
        marginBottom: 10,
        marginTop: 6,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        gap: 12,
    },
    gridItem: {
        flex: 1,
    },
    label: {
        fontSize: 11,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        marginBottom: 4,
    },
    value: {
        fontSize: 13,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    },
    singleRow: {
        marginBottom: 12,
    },
    notesBox: {
        backgroundColor: theme.background,
        borderRadius: 10,
        padding: 12,
    },
    notesText: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        lineHeight: 18,
    },
    attachmentsList: {
        marginTop: 6,
        gap: 8,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
    },
    attachmentName: {
        fontSize: 12,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    },
    closeButton: {
        marginTop: 6,
        paddingVertical: 14,
    },
});
