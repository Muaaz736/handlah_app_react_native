import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomBottomSheetStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  bottomSheetStyle: {
    zIndex: 10000,
    elevation: 10000,
  },
  backgroundStyle: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicatorStyle: {
    backgroundColor: theme.textSecondary,
    width: 40,
    height: 4,
  },
});
