import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeChoosePlanStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    flex: 1,
    padding: 18,
    paddingTop: isIOS ? 60 : 30,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    backgroundColor: theme.surface,
    padding: 18,
    paddingVertical: 20,
    marginBottom: 16,
  },
  planCardPremium: {
    backgroundColor: theme.textPrimary,
    borderColor: theme.textPrimary,
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: theme.textPrimary,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioSpacing: {
    marginRight: 12,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    flex: 1,
  },
  planTitlePremium: {
    color: theme.surface,
  },
  planPrice: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featuresTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 16,
    color: theme.textPrimary,
    marginRight: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#666666',
    fontFamily: FONTS.display_regular,
  },
  footerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: theme.surface,
    borderTopWidth: 0,
  },
});
