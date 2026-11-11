import { Dimensions, StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

const { width, height } = Dimensions.get('window');

export const makeCustomAddConnectionModalStyles = (theme: RoleTheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme?.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    maxHeight: height * 0.75,
    minHeight: height * 0.6,
    backgroundColor: theme.background,
    borderRadius: 20,
    overflow: 'hidden',
    width: width * 0.9,
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
    textAlign: 'left',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tabsContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  labelRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  innerTabStyle: {
    paddingHorizontal: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'left',
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
    textAlign: 'left',
  },
  footer: {
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
  dropdownList: {
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 240,
    marginTop: 4,
    marginBottom: 8,
  },
  dropdownFlatList: {
    maxHeight: 240,
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
  fieldLoader: {
    marginVertical: 8,
  },
  listFooterLoader: {
    paddingVertical: 8,
  },
});
