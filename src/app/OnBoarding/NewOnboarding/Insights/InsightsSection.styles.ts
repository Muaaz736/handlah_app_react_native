import { Platform, StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../types/roleManager.types';
import FONTS from '../../../../utils/fonts';

export const makeInsightsStyles = (theme: RoleTheme) =>
    StyleSheet.create({
        section: { marginBottom: 20 },

        // Section header
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
        },
        headerTitle: { fontSize: 20, fontFamily: FONTS.display_bold, color: theme.textPrimary },

        summaryCard: {
            backgroundColor: theme.surface,
            borderRadius: 16,
            paddingVertical: 12,
            paddingHorizontal: 8,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
        },
        summaryStatsRow: { flexDirection: 'row', gap: 10 },
        summaryStat: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
        summaryNum: { fontSize: 28, fontFamily: FONTS.display_bold, marginBottom: 4 },
        summaryLbl: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textPrimary, textAlign: 'center' },

        emptyState: {
            alignItems: 'center',
            paddingVertical: 24,
            gap: 8,
        },
        emptyText: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textSecondary },

        // Module group
        groupBlock: { marginBottom: 16 },
        groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
        groupIconBox: {
            width: 26, height: 26, borderRadius: 8,
            alignItems: 'center', justifyContent: 'center',
        },
        groupTitle: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, flex: 1 },
        groupCountBadge: {
            paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
            backgroundColor: theme.border,
        },
        groupCountText: { fontSize: 11, fontFamily: FONTS.display_semi_bold, color: theme.textSecondary },

        // Insight card
        card: {
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 14,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
        },
        cardIconBox: {
            width: 40, height: 40, borderRadius: 12,
            alignItems: 'center', justifyContent: 'center',
        },
        cardIconImg: { width: 20, height: 20 },
        cardBody: { flex: 1 },
        cardTitle: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, marginBottom: 3 },
        cardMessage: { fontSize: 12.5, fontFamily: FONTS.display_regular, color: theme.textSecondary, lineHeight: 17 },
        cardActionsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
        cardActionBtn: {
            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        },
        cardActionBtnText: { fontSize: 12.5, fontFamily: FONTS.display_semi_bold, color: '#fff' },
        cardOverflowBtn: {
            width: 30, height: 30, borderRadius: 15,
            alignItems: 'center', justifyContent: 'center',
        },
        cardLoadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            borderRadius: 16,
            backgroundColor: theme.isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
        },

        moreLink: { paddingLeft: 4, marginTop: -2, marginBottom: 6 },
        moreLinkText: { fontSize: 12.5, fontFamily: FONTS.display_semi_bold },

        // Module "View more / Show less" collapse toggle — shown once a
        // module has more than 3 insight cards.
        moduleToggle: {
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginTop: 2,
            marginBottom: 6,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 20,
        },
        moduleToggleText: { fontSize: 12.5, fontFamily: FONTS.display_semi_bold },

        // Getting Started card
        gsCard: {
            borderRadius: 18,
            marginBottom: 10,
        },
        gsCardContent:{
            paddingHorizontal: 18,
            paddingVertical: 14,
        },
        gsIconBox: {
            width: 44, height: 44, borderRadius: 14,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.25)',
            marginBottom: 10,
        },
        gsTitle: { fontSize: 16, fontFamily: FONTS.display_bold, color: '#fff', marginBottom: 4 },
        gsMessage: { fontSize: 12.5, fontFamily: FONTS.display_regular, color: 'rgba(255,255,255,0.9)', lineHeight: 17, marginBottom: 14 },
        gsBtn: {
            alignSelf: 'flex-start',
            backgroundColor: '#fff',
            paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
        },
        gsBtnText: { fontSize: 12.5, fontFamily: FONTS.display_bold },

        // Shared modal chrome (matches AIDashboard's MarkDoneModal)
        overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
        sheet: {
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: theme.background,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: Platform.OS === 'ios' ? 40 : 28,
        },
        handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D0D0D0', alignSelf: 'center', marginBottom: 20 },
        sheetTitle: { fontSize: 18, fontFamily: FONTS.display_bold, color: theme.textPrimary, marginBottom: 4 },
        sheetSubtitle: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginBottom: 18, lineHeight: 18 },

        // Snooze month options
        snoozeOption: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingVertical: 14,
            borderBottomWidth: 1, borderBottomColor: theme.border,
        },
        snoozeOptionText: { fontSize: 15, fontFamily: FONTS.display_medium, color: theme.textPrimary },
        snoozeOptionDate: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary },

        cancelBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 6 },
        cancelText: { fontSize: 15, fontFamily: FONTS.display_semi_bold, color: theme.textSecondary },

        ctaBtn: { borderRadius: 24, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
        ctaBtnText: { color: '#fff', fontSize: 15, fontFamily: FONTS.display_semi_bold },
    });
