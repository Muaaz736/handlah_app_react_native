import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeUpdatePhoneStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 18,
    paddingTop: isIOS ? 60 : 30,
  },
  formContainer: {
    width: '100%',
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  phoneTextContainer: {
    backgroundColor: theme.surface,
    paddingVertical: isIOS ? 16 : 5.5,
  },
  phoneContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: 'transparent',
  },
  footerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    backgroundColor: theme.background,
  },
});
