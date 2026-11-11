import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeAddComplianceRecordStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  contentCard: {
    backgroundColor: theme.background,
    borderRadius: 20,
    marginTop: 10,
  },
  formContainer: {
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 0,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
    marginTop: 4,
    textAlign: 'left',
  },
  dropdownContainer: {
    marginBottom: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    marginTop: 16,
  },
  headerContainerStyle: {
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  calendarIcon: {
    width: 20,
    height: 20,
    tintColor: theme.textPrimary,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: colors.error,
    marginTop: 4,
  },
});
