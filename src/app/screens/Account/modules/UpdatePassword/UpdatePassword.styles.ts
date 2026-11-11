import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';

export const makeUpdatePasswordStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    fontFamily: FONTS.display_semi_bold,
    marginTop: 20,
    marginBottom: 30,
  },
  formContainer: {
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 24,
  },
  buttonContainer: {
    marginBottom: 20,
  },
});
