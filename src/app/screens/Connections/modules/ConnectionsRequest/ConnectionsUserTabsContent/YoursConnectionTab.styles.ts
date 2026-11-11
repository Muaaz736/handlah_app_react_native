import { StyleSheet } from 'react-native';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeYoursConnectionStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16 },
    section: { marginBottom: 24 },
    listContainer: { gap: 10 },
    itemWrapper: { position: 'relative' },
    editIcon: { width: 18, height: 18, resizeMode: 'contain' },
    emptyStateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 40, gap: 16 },
    emptyIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 18, fontFamily: FONTS.display_regular, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 220 },
    selectorWrapper: { marginBottom: 24, zIndex: 10 },
    selectedCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, gap: 12,
    },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 24, fontFamily: FONTS.display_bold },
    avatarSmall: { width: 36, height: 36, borderRadius: 18 },
    avatarTextSmall: { fontSize: 14 },
    cardTextContainer: { flex: 1, gap: 2 },
    cardTitle: { fontSize: 15, fontFamily: FONTS.display_bold, color: theme.textPrimary },
    cardSubtitle: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    dropdownList: {
      marginTop: 6, borderRadius: 16,
      backgroundColor: theme.surface,
      overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 10, height: 10 },
      shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },
    dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
    dropdownItemBorder: { borderBottomWidth: 1, borderBottomColor: theme.border },
    dropdownItemText: { fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textPrimary },
    dropdownItemTextSelected: { fontFamily: FONTS.display_bold },
    dropdownItemSubtitle: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    checkmark: { fontSize: 18, marginLeft: 4 },
  });
