import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import { getColorWithOpacity } from '../../../../../utils/colors';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeAddLicenseStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentCard: {
    backgroundColor: theme.background,
    borderRadius: 20,
    marginTop: 10,
  },
  formContainer: {
    gap: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
    marginTop: 0,
    textAlign: 'left',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    borderRadius: 12,
  },
  dropdownContainer: {
    marginBottom: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  credentialsButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  credentialsStatus: {
    backgroundColor: getColorWithOpacity('#10B981', 0.1),
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  credentialsStatusText: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: '#10B981',
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
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
    color: 'red',
    marginTop: 4,
    marginLeft: 4,
  },
});
