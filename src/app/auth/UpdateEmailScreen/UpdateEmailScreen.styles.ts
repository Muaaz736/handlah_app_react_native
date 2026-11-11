import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeUpdateEmailStyles = (theme: RoleTheme) =>
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
  footerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    backgroundColor: theme.background,
  },
});
