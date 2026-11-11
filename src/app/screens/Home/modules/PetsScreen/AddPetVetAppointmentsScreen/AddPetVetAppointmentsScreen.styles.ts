import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddPetVetAppointmentsScreenStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  appointmentCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 6,
  },
  appointmentDetails: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: colors.primary,
    marginBottom: 2,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  addAppointmentButton: {
    backgroundColor: colors.lightCGreen,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  addAppointmentText: {
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    fontSize: 15,
  },
});
