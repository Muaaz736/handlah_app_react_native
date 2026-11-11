import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomInsurancePolicyCardStyles = (theme: RoleTheme) => StyleSheet.create({
  // Property Card Styles
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.background,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  propertyCategory: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    marginTop: 2,
    textAlign: 'left',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    padding: 0,
  },
  shareIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  propertyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  amountBadge: {
    fontSize: 10,
    color: theme.textPrimary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontFamily: FONTS.display_semi_bold,
  },
});
