import { StyleSheet, Dimensions } from 'react-native';
import type { RoleTheme } from '../../../../types/roleManager.types';
import FONTS from '../../../../utils/fonts';

const { width: SCREEN_W } = Dimensions.get('window');
const CHIP_GAP = 8;
export const CHIP_W = Math.round((SCREEN_W - 32 - CHIP_GAP * 3) / 4);
export const CHIP_H = SCREEN_W * 0.22;

export const makeS = (theme: RoleTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scroll: { paddingHorizontal: 16, paddingBottom: 40 },

    // "Advanced Dashboard" / "Insights" view switcher
    viewTabsContainer: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 10,
        height: 40,
        padding: 0,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    headerLabel: { fontSize: 24, fontFamily: FONTS.display_bold, color: theme.textPrimary },
    headerBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
    headerBadgeText: { fontSize: 12, fontFamily: FONTS.display_semi_bold, color: '#ffffff' },

    // Card base (white, rounded, shadow)
    card: {
        backgroundColor: theme.background,
        borderRadius: 18,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },

    // Briefing card
    briefCard: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    briefTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    briefText: { flex: 1, paddingRight: 12 },
    briefCaption: { fontSize: 11, fontFamily: FONTS.display_semi_bold, letterSpacing: 0.9, marginBottom: 7 },
    briefTitle: { fontSize: 20, fontFamily: FONTS.display_bold, color: theme.textPrimary, lineHeight: 26, marginBottom: 8 },
    briefSubtitle: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, lineHeight: 18 },

    // Stats row inside briefing card
    statsRow: { flexDirection: 'row', gap: 10 },
    statBox: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    statNum: { fontSize: 28, fontFamily: FONTS.display_bold, marginBottom: 4 },
    statLbl: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textPrimary, textAlign: 'center' },

    // Favorites section
    favSection: { marginBottom: 20 },
    favHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    favTitle: { fontSize: 20, fontFamily: FONTS.display_bold, color: theme.textPrimary },
    manageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    manageBtnText: { fontSize: 13, fontFamily: FONTS.display_medium },
    chipsRow: { gap: CHIP_GAP, paddingVertical: 2 },
    chip: {
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        overflow: 'hidden',
    },
    chipLabel: { fontSize: 14, fontFamily: FONTS.display_medium, textAlign: 'center', paddingHorizontal: 4 },

    // Attention section
    attSection: { marginBottom: 20 },
    attSectionTitle: { fontSize: 18, fontFamily: FONTS.display_bold, color: theme.textPrimary, marginBottom: 14 },
    attCard: {
        backgroundColor: theme.surface,
        borderWidth: 1,
        marginBottom: 10,
        shadowOffset: { width: 0, height: 2 },
        borderRadius: 15,
        borderColor: theme.surface,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 1,
    },
    attRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    attIconBox: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    attIcon: { width: '100%', height: '100%', resizeMode: 'contain' },
    attContent: { flex: 1, marginRight: 6 },
    attItemTitle: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, marginBottom: 2 },
    attSubtitle: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 11, fontFamily: FONTS.display_semi_bold },

    // Expanded body
    expandBody: {
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 16,
    },
    expandText: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary, lineHeight: 20, marginBottom: 14 },
    expandActions: { flexDirection: 'row', gap: 10 },
    actionFilled: { flex: 1, paddingVertical: 13, borderRadius: 28, alignItems: 'center' },
    actionFilledText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: theme.background },
    actionLightFill: { flex: 1, paddingVertical: 13, borderRadius: 28, alignItems: 'center' },
    actionLightFillText: { fontSize: 13, fontFamily: FONTS.display_semi_bold },
    expandActionsCol: { gap: 8, marginTop: 0 },
    actionOutline: { paddingVertical: 11, borderRadius: 28, alignItems: 'center', borderWidth: 1.5 },
    actionOutlineText: { fontSize: 13, fontFamily: FONTS.display_semi_bold },
    actionMarkDone: { paddingVertical: 11, borderRadius: 28, alignItems: 'center', backgroundColor: theme.background },
    actionMarkDoneText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },

    emptyState: { alignItems: 'center', paddingVertical: 32, gap: 10 },
    emptyText: { fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textSecondary },

    // Halo AI Insight
    haloCard: { borderRadius: 16, padding: 18, marginBottom: 4 },
    haloLabel: { fontSize: 15, fontFamily: FONTS.display_bold, color: '#ffffff', marginBottom: 8 },
    haloText: { fontSize: 13, fontFamily: FONTS.display_regular, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },

    // Footer
    footer: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: theme.background,
        gap: 10,
    },
    outlineBtn: { height: 50, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    outlineBtnText: { fontSize: 15, fontFamily: FONTS.display_semi_bold },
    saveBtn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { fontSize: 15, fontFamily: FONTS.display_semi_bold, color: '#ffffff' },
  });
