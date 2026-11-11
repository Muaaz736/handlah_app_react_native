import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makePersonalInformationStyles = (theme: RoleTheme) =>
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
    paddingTop: 60,
  },
  formContainer: {
    width: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
});

export const makeUpdatePersonalInformationStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    width: '100%',
  },
});
