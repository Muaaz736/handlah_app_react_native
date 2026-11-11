import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeFavoritesManagementStyles = (theme: RoleTheme) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 50,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
  favoritesList: {
    gap: 6,
    padding: 10,
  },
  favoritesGrid: {
    padding: 10,
    gap: 6,
  },
  columnWrapper: {
    gap: 6,
    justifyContent: 'flex-start',
  },
  favoritesListContainer: {
    borderWidth: 1.5,
    borderColor: theme.textSecondary,
    borderStyle: 'dashed',
    borderRadius: 20,
    marginTop: 16,
  },
  sectionCount: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
  },
  dropZoneActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '10',
  },
  floatingCardContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  floatingCard: {
    position: 'absolute',
    opacity: 0.9,
    transform: [{ scale: 1.12 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  sectionWithPadding: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  headerContainerStyle: {
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: theme.surface,
  },
  saveButton: {
    marginHorizontal: 16,
    marginVertical: 20,
  },
});
