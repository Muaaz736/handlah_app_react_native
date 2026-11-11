import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles shared across Insurance module components
export const makeCommonStyles = (theme: RoleTheme) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

// Insurance.tsx (main list screen) specific styles
export const makeInsuranceStyles = (theme: RoleTheme) => StyleSheet.create({
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  safeArea: {
    flex: 1,
  },
  iconContainer: {
    marginBottom: 0,
    alignItems: 'center',
  },
  insuranceIconWrapper: {
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
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    marginBottom: 8,
  },
  totalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  insuranceSection: {
    width: '100%',
    marginTop: 16,
  },
  insuranceCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insuranceInfo: {
    flex: 1,
    minWidth: 0,
  },
  insuranceName: {
    fontSize: 18,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  balanceBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    flexShrink: 0,
  },
  balanceText: {
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
  policyText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    marginBottom: 4,
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
  },
  arrowButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    padding: 4,
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
  gradientContainer: {
    flex: 1,
  },
  headerContainerStyle: {
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  insuranceIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    tintColor: theme.surface,
  },
  whiteButton: {
    backgroundColor: theme.background,
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  blackText: {
    color: theme.textPrimary,
  },
  actionIcon: {
    width: 18,
    height: 18,
  },
  loadingIndicator: {
    marginTop: 40,
  },
});
