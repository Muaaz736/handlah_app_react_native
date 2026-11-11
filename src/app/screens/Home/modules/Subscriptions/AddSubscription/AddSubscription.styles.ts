import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddSubscriptionStyles = (theme: RoleTheme) =>
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
    paddingTop: 60,
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
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
    paddingHorizontal: 14,
    height: 52,
  },
  dateInput: {
    borderRadius: 8,
    backgroundColor: theme.surface,
    height: 52,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 80,
    color: theme.textPrimary
  },
  textAreaPlaceholder: {
    fontSize: 14,
    color: theme.placeholder,
    fontFamily: FONTS.display_regular,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
    marginTop: 8,
    marginBottom: 14,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  checkRow: {
    marginBottom: 20,
  },
  uploadSection: {
    marginBottom: 20,
  },
  hintText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontFamily: FONTS.display_regular,
    marginTop: 6,
    textAlign: 'left',
  },
  footerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 16,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: '#FF0000',
    marginTop: -16,
    marginBottom: 16,
    textAlign: 'left',
  },
  errorTextRow: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: '#FF0000',
    marginTop: -16,
    textAlign: 'left',
  },
  errorTextInline: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: '#FF0000',
    marginTop: 4,
    textAlign: 'left',
  },
});
