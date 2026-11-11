import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddSocialMediaStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 12,
  },
  accountCard: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  activeAccountCard: {},
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformName: {
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.surface,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border || '#E8E8E8',
    marginVertical: 20,
  },
  formContainer: {
    marginTop: 30,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  dropdown: {
    marginBottom: 8,
  },
  dropdownLeftIcon: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
  bottomButtons: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.background,
  },
  addButton: {},
  saveButton: {
    backgroundColor: 'transparent',
  },
  saveButtonText: {},
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 12,
  },
});
