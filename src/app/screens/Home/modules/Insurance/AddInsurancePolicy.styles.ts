import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeAddInsurancePolicyStyles = (theme: RoleTheme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 24,
    marginTop: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  halfWidth: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    marginTop: -12,
    marginBottom: 8,
  },
  errorTextWithoutMargin: {
    color: '#E53935',
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    marginTop: 8,
  },
  clearDateText: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    color: colors.error,
    marginTop: 4,
    textAlign: 'right',
  },
  linkInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  linkInfoText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    flex: 1,
    lineHeight: 18,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
});
