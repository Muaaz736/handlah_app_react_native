import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddAccidentsStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    backgroundColor: theme.surface,
  },
  uploadText: {
    fontSize: 15,
    fontFamily: FONTS.display_regular,
  },
  addAccidentButton: {
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  skipButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
    alignSelf: 'flex-end',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    marginRight: 16,
  },
  skipButtonText: {
    fontSize: 15,
    fontFamily: FONTS.display_medium,
    textAlign: 'center',
    fontWeight: '600',
  },
  skipText: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
  },
  addVehicleButton: {
    marginTop: 8,
  },
  accidentsListContainer: {
    marginBottom: 20,
  },
  accidentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: theme.surface,
  },
  accidentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accidentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  accidentCardTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  costBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  costBadgeText: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  accidentCardDate: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  accidentCardInsurance: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    marginBottom: 4,
  },
  accidentCardShop: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
  accidentCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    padding: 4,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  accidentCardRow: {
    flexDirection: 'row',
    gap: 4,
  },
});