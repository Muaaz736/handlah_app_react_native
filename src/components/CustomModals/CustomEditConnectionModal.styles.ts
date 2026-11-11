import { Dimensions, StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

const { width, height } = Dimensions.get('window');

export const makeCustomEditConnectionModalStyles = (theme: RoleTheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme?.isDark ? 'rgba(255, 255, 255, 0.05)' :  'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    maxHeight: height * 0.75,
    minHeight: height * 0.6,
    backgroundColor: theme.background,
    borderRadius: 20,
    width: width * 0.9,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  tabsContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  emergencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  emergencyLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginRight: 12,
  },
  footer: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: theme.background,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
  },
  switchScale: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  dropdownHeight: {
    height: 45,
  },
  searchDropdownWrapper: {
    width: '100%',
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
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 20,
    zIndex: 100,
    maxHeight: 240,
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
    fontSize: 16,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  emptyBusinessText: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    marginTop: 4,
  },
});
