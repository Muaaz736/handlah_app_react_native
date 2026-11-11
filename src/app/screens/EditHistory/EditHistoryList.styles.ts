import { StyleSheet } from 'react-native';
import FONTS from '../../../utils/fonts';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeEditHistoryListStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    gradient: { flex: 1, backgroundColor: theme.background },
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    headerTextContainer: { flex: 1 },
    headerTitle: { fontSize: 20, fontFamily: FONTS.display_bold, color: theme.textPrimary },
    headerSubtitle: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 2 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingBottom: 80 },
    emptyText: { fontSize: 16, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    listContainer: { paddingHorizontal: 16, paddingBottom: 30 },
    historyItem: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 16, paddingHorizontal: 10, marginBottom: 12,
      borderRadius: 8,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
      backgroundColor: theme.surface, gap: 12,
    },
    firstItem: { paddingTop: 8 },
    historyItemContent: { flex: 1 },
    dateText: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.textPrimary, marginBottom: 4 },
    userRow: { flexDirection: 'row', alignItems: 'center' },
    userName: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    separator: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    changeCount: { fontSize: 13, fontFamily: FONTS.display_semi_bold },
    separator_line: { height: 1, backgroundColor: theme.border },
  });
