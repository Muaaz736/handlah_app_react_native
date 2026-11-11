import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeStyles = (theme: RoleTheme) => StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 0,
    paddingTop: 20,
  } as ViewStyle,
  HeaderTitle: {
    marginTop: 5,
  } as TextStyle,
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    marginTop: 30,
  } as ViewStyle,
  title: {
    fontSize: 26,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginTop: 8,
  } as TextStyle,
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    marginBottom: 24,
  } as TextStyle,
  inputGroup: {
    marginBottom: 16,
  } as ViewStyle,
  dropdown: {
    borderColor: theme.border,
    borderRadius: 8,
  } as ViewStyle,
  inputContainer: {
    marginBottom: 16,
  } as ViewStyle,
  inputContainerNoMargin: {
    marginBottom: 0,
  } as ViewStyle,
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  } as ViewStyle,
  halfInput: {
    flex: 1,
    marginTop: 12,
  } as ViewStyle,
  doctorDropdownWrapper: {
    position: 'relative',
  } as ViewStyle,
  doctorLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  } as ViewStyle,
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.surface,
    backgroundColor: theme.border,
  } as ViewStyle,
  quickAddBtnText: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
  } as TextStyle,
  quickAddDoctorForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    backgroundColor: theme.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 8,
  } as ViewStyle,
  quickAddDoctorInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    backgroundColor: theme.background,
    color: theme.textPrimary,
  } as TextStyle,
  quickAddDoctorSaveBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  } as ViewStyle,
  quickAddDoctorSaveBtnText: {
    color: theme.surface,
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
  } as TextStyle,
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
  } as ViewStyle,
  reminderText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  } as TextStyle,
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  uploadContainer: {
    marginBottom: 16,
  } as ViewStyle,
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  } as ViewStyle,
  uploadText: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  } as TextStyle,
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 16,
  } as TextStyle,
  datePickerContainer: {
    marginBottom: 16,
  } as ViewStyle,
  buttonContainer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  } as ViewStyle,
  saveButton: {
    paddingVertical: 16,
  } as ViewStyle,
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: '#FF0000',
    marginTop: -12,
    marginBottom: 12,
    textAlign: 'left',
  } as TextStyle,
  errorTextRow: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: '#FF0000',
    marginTop: -12,
    textAlign: 'left',
  } as TextStyle,
  errorTextLocation: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: '#FF0000',
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'left',
  } as TextStyle,
});
