import { StyleSheet } from 'react-native';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles shared across Add + Edit PersonalProperty forms
export const makeCommonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'left',
  },
  helperText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary || '#888',
    marginTop: 6,
    textAlign: 'left',
  },
  dropdown: {
    borderColor: theme.border || '#E8E8E8',
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputContainerNoMargin: {
    marginBottom: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.textSecondary,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 20,
    textAlign: 'left',
  },
  textAreaContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  textAreaInput: {
    height: '100%',
    textAlignVertical: 'top',
    textAlign: 'left',
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addButton: {
    paddingVertical: 16,
  },
});

// PersonalProperty.tsx (main list screen) specific styles
export const makePersonalPropertyStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  safeArea: {
    flex: 1,
  },
  iconContainer: {
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    color: theme.surface,
    fontFamily: FONTS.display_bold,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  propertiesSection: {
    width: '100%',
    marginTop: 24,
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  propertyInfo: {
    flex: 1,
    gap: 4,
  },
  propertyName: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    textAlign: 'left',
    textTransform: 'capitalize',
  },
  propertyCategory: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    marginTop: 2,
    textAlign: 'left',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 4,
  },
  shareIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    gap: 16,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 220,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  headerContainerStyle: {
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  headerIcon: {
    width: 78,
    height: 78,
    resizeMode: 'contain',
    alignSelf: 'center',
    tintColor: theme.surface,
  },
  whiteButton: {
    backgroundColor: theme.surface,
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  blackText: {
    color: theme.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 20,
    marginBottom: 4,
    justifyContent: 'flex-start',
    width: '100%',
  },
  filterButton: {
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 60,
  },
  filterButtonActive: {
    backgroundColor: theme.surface,
  },
  filterText: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    flex: 1,
  },
  filterTextActive: {
    fontFamily: FONTS.display_semi_bold,
  },
  inlineDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    maxHeight: 250,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.inputBg,
  },
  dropdownItemSelected: {
    backgroundColor: theme.inputBg,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    flex: 1,
  },
  dropdownItemTextSelected: {
    fontFamily: FONTS.display_semi_bold,
  },
  checkboxWrap: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginRight: 4,
  },
  countBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.display_bold,
    color: theme.primary,
  },
});
