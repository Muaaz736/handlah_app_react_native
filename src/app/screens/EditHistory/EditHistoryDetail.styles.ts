import { StyleSheet } from 'react-native';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeEditHistoryDetailStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    gradient: { flex: 1, backgroundColor: theme.background },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    backButton: {
      width: 40, height: 40, borderRadius: 20,
      justifyContent: 'center', alignItems: 'center',
      ...(isIOS
        ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 }
        : { elevation: 2 }),
    },
    headerTextContainer: { flex: 1 },
    headerNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
    headerTitle: { fontSize: 20, fontFamily: FONTS.display_bold, color: theme.textPrimary },
    changeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    changeBadgeText: { fontSize: 12, fontFamily: FONTS.display_semi_bold },
    headerSubtitle: { fontSize: 22, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, marginTop: 2 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 20 },
    changeItem: { gap: 8 },
    fieldLabel: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, letterSpacing: 0.5 },
    textChangeRow: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
      borderRadius: 10, backgroundColor: theme.surface, padding: 5,
    },
    valueBox: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, minHeight: 40, justifyContent: 'center' },
    newValueBox: {},
    oldValueText: { fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textPrimary },
    newValueText: { fontSize: 14, fontFamily: FONTS.display_medium },
    removedValueText: { color: '#FF3B30', fontFamily: FONTS.display_semi_bold, fontStyle: 'italic' },
    notSetValueText: { color: theme.textSecondary, fontFamily: FONTS.display_regular, fontStyle: 'italic' },
    arrowContainer: { width: 24, alignItems: 'center', justifyContent: 'center' },
    imageChangeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
    imageBox: { backgroundColor: theme.surface, padding: 8, alignItems: 'center', justifyContent: 'center' },
    changeImage: { borderRadius: 8 },
    noImageBox: { borderRadius: 8, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 80 },
    emptyText: { fontSize: 16, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    passwordLockedRow: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
      borderRadius: 10, backgroundColor: theme.surface, padding: 5,
    },
    maskedText: { fontSize: 18, fontFamily: FONTS.display_medium, color: theme.textPrimary, letterSpacing: 2 },
    lockIconContainer: { paddingHorizontal: 6, justifyContent: 'center', alignItems: 'center' },
  });
