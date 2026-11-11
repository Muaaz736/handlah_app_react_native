import { Platform, StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../types/roleManager.types';
import FONTS from '../../../../utils/fonts';

export const makeAiDashboardStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
    },
    headerSpacer: {
        width: 36,
    },
  });

export const makeMarkDoneModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D0D0D0',
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        marginBottom: 20,
        lineHeight: 18,
    },
    fieldBlock: {
        marginBottom: 16,
    },
    confirmText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        lineHeight: 20,
        marginBottom: 20,
    },
    submitBtn: {
        height: 52,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    submitBtnText: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
        color: theme.background,
    },
    cancelBtn: {
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
  });

export const makeGuidanceModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
        paddingTop: 12,
        maxHeight: '82%',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D0D0D0',
        alignSelf: 'center',
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    iconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
    },
    headerSub: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        marginTop: 1,
    },
    divider: {
        height: 1,
        backgroundColor: theme.border,
        marginBottom: 12,
    },
    scrollContent: {
        paddingBottom: 8,
    },
    center: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    errorText: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    retryBtn: {
        marginTop: 4,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 28,
        paddingVertical: 10,
    },
    retryText: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
    },
    section: {
        marginBottom: 18,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 8,
    },
    bullet: {
        width: 7,
        height: 7,
        borderRadius: 4,
        marginTop: 5,
    },
    listText: {
        flex: 1,
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        lineHeight: 20,
    },
    numberedItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
    },
    numberCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    numberText: {
        fontSize: 11,
        fontFamily: FONTS.display_bold,
        color: theme.background,
    },
    closeBtn: {
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    closeBtnText: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
        color: theme.background,
    },
  });
