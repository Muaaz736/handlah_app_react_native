import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeAddProjectStyles = (theme: RoleTheme) =>
  StyleSheet.create({
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
  formContainer: {
    gap: 8,
    paddingVertical: 16,
  },
  inputContainer: {
    marginBottom: 0,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'left',
  },
  dropdownContainer: {
    marginBottom: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  halfWidth: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'left',
  },
  submitButton: {
    marginTop: 16,
  },
  headerContainerStyle: {
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  inputContainerWithMarginTop: {
    marginBottom: 0,
    marginTop: 10,
  },
  rowContainerWithMarginTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    marginTop: 8,
  },
  statusDropdownWrapper: {
    marginBottom: 8,
  },
  datePickerContainer: {
    marginBottom: 0,
  },
  uploadSection: {
    marginTop: 10,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: 'red',
    marginTop: 4,
    marginLeft: 4,
  },
  noClientsContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE082',
    marginBottom: 4,
  },
  noClientsText: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: '#795548',
    marginBottom: 12,
    lineHeight: 20,
  },
  addClientButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  addClientButtonText: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
    color: theme.surface,
  },
  contactLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addContactLinkText: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
  },
});
