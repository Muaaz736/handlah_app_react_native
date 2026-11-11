import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeScreenWrapperStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
    },
    gradientWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 0,
      overflow: 'hidden',
    },
    gradient: {
      flex: 1,
    },
    contentLayer: {
      flex: 1,
      zIndex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    nonScrollableContent: {
      flex: 1,
    },
  });
