import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles shared across Utilities module components
export const makeCommonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerContainerStyle: {
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  whiteButton: {
    backgroundColor: theme.surface,
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  blackText: {
    color: theme.textPrimary,
  },
});

// Utilities.tsx (main list screen) specific styles
export const makeUtilitiesStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  iconContainer: {
    marginBottom: 0,
    alignItems: 'center',
  },
  utilityIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: theme.surface,
    fontFamily: FONTS.display_bold,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
    marginBottom: 8,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: theme.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
  },
  filterButtonActive: {
    backgroundColor: theme.surface,
  },
  filterText: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    flex: 1,
  },
  filterTextActive: {
    fontFamily: FONTS.display_semi_bold,
  },
  inlineDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownScroll: {
    maxHeight: 250,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dropdownItemSelected: {
    backgroundColor: theme.inputBg,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    flex: 1,
  },
  dropdownItemTextSelected: {
    fontFamily: FONTS.display_semi_bold,
  },
  checkboxWrap: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginRight: 4,
  },
  countBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.display_bold,
    color: theme.primary,
  },
  dropdownContainer: {
    marginTop: 12,
    marginBottom: 8,
    zIndex: 1000,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    gap: 16,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 220,
  },
  totalsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  totalItem: {
    width: '48%',
    minWidth: 0,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    fontFamily: FONTS.display_medium,
    textAlign: 'center',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 15,
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
    textAlign: 'center',
  },
  utilitiesSection: {
    width: '100%',
    marginTop: 16,
  },
  utilityCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  nameSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  utilityName: {
    fontSize: 18,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    textAlign: 'left',
    maxWidth: '80%',
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  propertyText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    textAlign: 'left',
    marginBottom: 4,
    flex: 1,
    minWidth: 0,
  },
  amountBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    flexShrink: 0,
  },
  amountText: {
    fontSize: 14,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtn: {
    padding: 4,
  },
  arrowButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    padding: 4,
  },
  actionIconLg: {
    width: 19,
    height: 19,
  },
  utilityIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    tintColor: theme.surface,
  },
  chevronMargin: {
    marginLeft: 4,
  },
});
