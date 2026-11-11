import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeIdentityFormStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    flex: 1,
    padding: 18,
  },
  sectionHeader: {
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: 6,
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    textAlign: 'left',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    marginBottom: 8,
    textAlign: 'left',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 52,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
    paddingHorizontal: 14,
    height: 52,
  },
  dateInputText: {
    fontSize: 14,
    color: theme.placeholder,
    fontFamily: FONTS.display_regular,
  },
  countryInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
    paddingHorizontal: 14,
    height: 52,
  },
  countryInputText: {
    flex: 1,
    fontSize: 14,
    color: theme.placeholder,
    fontFamily: FONTS.display_regular,
    marginLeft: 10,
  },
  phoneLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    marginBottom: 8,
    textAlign: 'left',
  },
  phoneTextContainer: {
    backgroundColor: theme.surface,
    paddingVertical: isIOS ? 16 : 5.5,
  },
  phoneContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.inputBg,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: 'transparent',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 20,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  footerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 16,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    color: theme.textPrimary,
    fontFamily: FONTS.display_regular,
  },
  headerPadding: {
    paddingHorizontal: 18,
    paddingTop: isIOS ? 60 : 30,
  },
  continueButton: {
    backgroundColor: theme.textPrimary,
    borderRadius: 10,
  },
  continueButtonText: {
    color: theme.textPrimary,
  },
});
