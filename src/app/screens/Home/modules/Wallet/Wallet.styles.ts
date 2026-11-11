import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles shared across Wallet module components
export const makeCommonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

// Wallet.tsx (main list screen) specific styles
export const makeWalletStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    color: theme.surface,
    fontFamily: FONTS.display_bold,
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 12,
    width: '100%',
    justifyContent: 'center',
  },
  shareButton: {
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  shareButtonText: {
    fontFamily: FONTS.display_medium,
    fontSize: 15,
  },
  loader: {
    marginTop: 40,
  },
  documentsList: {
    width: '100%',
  },
  documentCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentTitle: {
    fontSize: 18,
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  cardBody: {
    marginTop: 8,
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 20,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666666',
    fontFamily: FONTS.display_regular,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
  },
  cardActionIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  walletIcon: {
    width: 78,
    height: 78,
    resizeMode: 'contain',
    tintColor: theme.background
  },
  shareIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  documentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignSelf: 'center',
  },
});
