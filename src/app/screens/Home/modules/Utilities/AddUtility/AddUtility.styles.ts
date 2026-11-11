import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddUtilityStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 30,
  },
  formContainer: {
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  halfInput: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 13,
  },
  fullWidthContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  inputContainerNoMargin: {
    marginBottom: 0,
  },
  addUtilityButton: {
    borderRadius: 30,
    paddingVertical: 16,
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    marginTop: 4,
    textAlign: 'left',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  notesInputContainer: {
    height: 120,
    alignItems: 'flex-start',
  },
  linkInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  linkInfoText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    flex: 1,
    marginTop: -4,
    lineHeight: 18,
  },
});
