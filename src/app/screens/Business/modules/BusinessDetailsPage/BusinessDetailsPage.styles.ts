import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeBusinessDetailsPageStyles = (theme: RoleTheme) =>
  StyleSheet.create({
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  businessAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: FONTS.display_bold,
    color: '#5B7FFF',
  },
  businessName: {
    fontSize: 24,
    fontFamily: FONTS.display_bold,
    color: theme.surface,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: theme.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    width: '65%'
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  disabledIcon: {
    opacity: 0.4,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'left',
  },
  infoGrid: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  fullWidthInfo: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    marginBottom: 4,
    textAlign: 'left',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    lineHeight: 20,
    textAlign: 'left',
  },
  gradientContainer: {
    flex: 1,
  },
  headerContainerStyle: {
    paddingHorizontal: 16,
    marginBottom: 0,
    paddingTop: 20,
  },
});
