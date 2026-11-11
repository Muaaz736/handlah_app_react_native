import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';
import { isIOS } from '../../../../../utils/helpers';

export const makeLanguagesStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  fieldLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  screenContainer: {
    paddingHorizontal: 16,
  },
  authHeaderContainer: {
    paddingTop: isIOS ? 0 : 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 24,
  },
  saveButton: {
    width: '100%',
  },
  saveButtonText: {
    color: theme.white,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
});
