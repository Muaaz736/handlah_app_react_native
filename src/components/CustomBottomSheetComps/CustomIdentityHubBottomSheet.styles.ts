import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomIdentityHubBottomSheetStyles = (theme: RoleTheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  tabContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 16,
    flex: 1,
    height: 48,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  formFieldsContainer: {
    gap: 12,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    height: 52,
    fontSize: 14,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 12,
    paddingRight: 40,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    height: 52,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  whiteButtonText: {
    color: theme.surface,
  },
  calendarIconContainer: {
    position: 'absolute',
    right: 12,
    bottom: 16,
  },
  handleIndicator: {
    backgroundColor: theme.textPrimary,
    width: 90,
    height: 6,
  },
  connectionTabWrapper: {
    flex: 1,
    position: 'relative',
  },
  accountTypeTabs: {
    marginTop: 16,
    marginBottom: 4,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dropdownHeight: {
    height: 45,
  },
  emergencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  emergencyLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginRight: 12,
  },
  switchScale: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  dropdownList: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 30,
    zIndex: 100,
    maxHeight: 220,
  },
  dropdownFlatList: {
    maxHeight: 220,
  },
  dropdownLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  dropdownEmpty: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface,
    gap: 10,
  },
  dropdownAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  dropdownAvatarPlaceholder: {
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownAvatarText: {
    fontSize: 14,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  dropdownItemInfo: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  dropdownItemUsername: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  tabsContainerStyle: {
    padding: 0,
    backgroundColor: theme.surface,
    height: 40,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  tabLabelStyle: {
    fontSize: 16,
    color: theme.textPrimary,
  },
  activeTabLabelStyle: {
    color: theme.surface,
  },
  activeTabStyle: {
    borderRadius: 14,
  },
  tabStyle: {
    borderRadius: 14,
  },
  selectedCategoryInfo: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  selectedCategoryText: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  selectedCategoryBold: {
    fontFamily: FONTS.display_semi_bold,
  },
  multilineInput: {
    height: 80,
    paddingTop: 12,
  },
});
