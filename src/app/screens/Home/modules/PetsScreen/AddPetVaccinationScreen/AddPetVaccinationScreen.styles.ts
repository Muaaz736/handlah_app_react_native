import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddPetVaccinationScreenStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  vaccineCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vaccineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 18,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  vaccineActions: {
    flexDirection: 'row',
    gap: 16,
  },
  vaccineDate: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#666666',
  },
  addVaccineButton: {
    backgroundColor: colors.lightCGreen,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addVaccineText: {
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    fontSize: 15,
  },
});
