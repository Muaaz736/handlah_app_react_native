import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import fonts from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomCheckboxStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: theme.surface,
  },
  checkboxChecked: {
  },
  checkmark: {
    width: 14,
    height: 8,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: theme.textPrimary,
    transform: [{ rotate: '-45deg' }],
    marginBottom: 4,
  },
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    color: theme.textPrimary,
    fontFamily: fonts.display_semi_bold,
    width: '98%',
    textAlign: 'left',
  },
  link: {
    fontFamily: fonts.display_medium,
  },
  labelFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
