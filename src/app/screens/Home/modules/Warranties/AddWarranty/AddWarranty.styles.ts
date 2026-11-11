import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddWarrantyStyles = (theme: RoleTheme) =>
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
  fullWidthContainer: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
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
  uploadSection: {
    marginBottom: 24,
  },
  addWarrantyButton: {
    borderRadius: 30,
    paddingVertical: 16,
  },
  notesInput: {
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    fontSize: 15,
    borderColor: theme.border,
    borderWidth: 1,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    backgroundColor: theme.surface,
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
