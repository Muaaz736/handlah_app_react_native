import { Dimensions, StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { isIOS } from '../../utils/helpers';
import type { RoleTheme } from '../../types/roleManager.types';

const { height } = Dimensions.get('window');

export const makeCustomFloatingActionButtonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: height * 0.125,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  button: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: isIOS ? 6 : 0,
    borderWidth: isIOS ? 0 : 0.5,
    borderColor: isIOS ? colors.transparent : theme.border,
  },
});
