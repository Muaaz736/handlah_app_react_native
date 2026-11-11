import { I18nManager, StyleSheet } from 'react-native';
import fonts from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomInputStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.textPrimary,
    fontFamily: fonts.display_medium,
    marginBottom: 8,
    letterSpacing: 0.2,
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
    paddingHorizontal: 14,
    height: 52,
    overflow: 'hidden',
  },
  inputContainerError: {
    // borderColor: '#f44336',
    // backgroundColor: '#ffebee',
  },
  inputContainerDisabled: {
    backgroundColor: theme.inputBg,
    opacity: 0.7,
  },
  inputContainerMultiline: {
    height: undefined,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  iconMultiline: {
    marginTop: 2,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: theme.textPrimary,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.textPrimary,
    fontFamily: fonts.display_regular,
    padding: 0,
    height: '100%',
    textAlign:  I18nManager.isRTL ? 'right' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  inputSingleLine: {
    height: 52,
  },
  endIconContainer: {
    padding: 4,
    marginLeft: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
    marginLeft: 4,
    fontFamily: fonts.display_regular,
  },
});
