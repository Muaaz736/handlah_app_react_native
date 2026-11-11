import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeAddBusinessContactStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  contentCard: {
    backgroundColor: theme.background,
    borderRadius: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    marginBottom: 24,
  },
  formContainer: {
    gap: 8,
    paddingVertical: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'left',
  },
  dropdownContainer: {
    marginBottom: 0,
  },
  fullWidthDropdown: {
    marginBottom: 16,
  },
  referenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  referenceLabelContainer: {
    flex: 1,
    marginRight: 8,
  },
  referenceLabel: {
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  referenceSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    marginTop: 2,
  },
  submitButton: {
    marginTop: 8,
  },
  headerContainerStyle: {
    paddingHorizontal: 16,
    marginBottom: 0,
    paddingTop: 20,
  },
  switchStyle: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: 'red',
    marginTop: 4,
    marginLeft: 4,
  },
});
