import { StyleSheet } from 'react-native';
import FONTS from '../../../utils/fonts';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeConnectionsStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    listContent: { paddingHorizontal: 16, paddingBottom: 80 },
    headerSection: { marginBottom: 16 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
    sectionTitle: { fontSize: 20, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    requestsBadge: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.background,
      paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: 20, borderWidth: 1, borderColor: theme.border, gap: 8,
    },
    requestsText: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.primary },
    notificationBadge: {
      backgroundColor: theme.primary,
      borderRadius: 10, minWidth: 20, height: 20,
      alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
    },
    notificationText: { fontSize: 12, fontFamily: FONTS.display_bold, color: '#ffffff' },
    tabs: { marginBottom: 16 },
    emptyContainer: { paddingVertical: 40, alignItems: 'center' },
    emptyText: { fontSize: 16, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    manageButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6 },
    manageButtonText: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.primary, marginLeft: 6 },
    floatingButton: { bottom: 13, right: 20 },
    skeletonCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12, padding: 16, marginBottom: 12, gap: 12,
    },
    skeletonAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.isDark ? '#3A3A3A' : '#E0E0E0' },
    skeletonContent: { flex: 1, gap: 8 },
    skeletonLine: { height: 14, borderRadius: 7, backgroundColor: theme.isDark ? '#3A3A3A' : '#E0E0E0', width: '100%' },
    skeletonLineShort: { width: '60%' },
    skeletonTabsRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    skeletonTab: { width: 80, height: 36, borderRadius: 18, backgroundColor: theme.isDark ? '#3A3A3A' : '#E0E0E0' },
  });
