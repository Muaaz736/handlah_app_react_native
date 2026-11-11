import { StyleSheet } from 'react-native';
import FONTS from '../../../utils/fonts';
import type { RoleTheme } from '../../../types/roleManager.types';

const { height } = require('react-native').Dimensions.get('window');
export const makeRemindersStyles = (theme: RoleTheme) => StyleSheet.create({
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  headerSection: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginVertical: 12,
    textAlign: 'left',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: theme.background,
  },
  filterButtonText: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
  },
  filterMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  filterMenu: {
    position: 'absolute',
    borderRadius: 14,
    backgroundColor: theme.background,
    paddingVertical: 6,
    minWidth: 160,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  filterMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  filterMenuItemText: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  floatingButton: {
    bottom: height >= 812 ? 10 : 15,
    right: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    backgroundColor: theme.background,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    paddingVertical: 0,
  },
});
