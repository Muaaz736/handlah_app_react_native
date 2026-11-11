import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddPetIllnessScreenStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  illnessCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  illnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  illnessName: {
    fontSize: 18,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  illnessActions: {
    flexDirection: 'row',
    gap: 16,
  },
  addIllnessButton: {
    backgroundColor: colors.lightCGreen,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  addIllnessText: {
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    fontSize: 15,
  },
});
