import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';
import colors from '../../../../../utils/colors';

export const makeChooseSubscriptionPlanStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    textAlign: 'left',
  },
  planOptionSelected: {
    borderColor: colors.primary,
  },
  premiumPlan: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    textAlign: 'left',
  },
  activePlanText: {
    color: theme.surface,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
  },
  featuresSection: {
    flex: 1,
    marginTop: 32,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    marginBottom: 16,
    textAlign: 'left',
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  checkIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkIcon: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
    fontFamily: FONTS.display_regular,
    lineHeight: 20,
    textAlign: 'left',
  },
  continueButton: {
    marginBottom: 30,
  },
  continueButtonText: {
    fontSize: 16,
    color: theme.surface,
  },
});

export const makeSubscriptionPlanStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
  },
  planCard: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPlanLabel: {
    fontSize: 13,
    color: theme.textPrimary,
    fontFamily: FONTS.display_regular,
    textAlign: 'left',
  },
  activeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    textAlign: 'left',
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
    marginBottom: 4,
    textAlign: 'left',
  },
  planDuration: {
    fontSize: 14,
    color: theme.textPrimary,
    fontFamily: FONTS.display_regular,
    marginBottom: 16,
    textAlign: 'left',
  },
  billingInfo: {
    fontSize: 13,
    color: theme.textPrimary,
    fontFamily: FONTS.display_regular,
    lineHeight: 18,
    textAlign: 'left',
  },
  featuresSection: {
    flex: 1,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    marginBottom: 16,
    textAlign: 'left',
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  checkIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkIcon: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
    fontFamily: FONTS.display_regular,
    lineHeight: 20,
    textAlign: 'left',
  },
  upgradeButton: {
    marginBottom: 50,
  },
  upgradeButtonText: {
    fontSize: 16,
    color: theme.surface,
  },
});
