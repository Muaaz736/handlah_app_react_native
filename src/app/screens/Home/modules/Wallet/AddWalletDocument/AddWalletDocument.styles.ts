import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddWalletDocumentStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 10,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateGroup: {
    flex: 1,
  },
  uploadSection: {
    marginTop: 10,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FFF4',
  },
  uploadText: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: theme.surface,
  },
});
