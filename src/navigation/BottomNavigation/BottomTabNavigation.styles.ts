import { Platform, StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import { clampedScale } from '../../utils/responsive';
import type { RoleTheme } from '../../types/roleManager.types';

const TAB_BAR_HEIGHT = 70;

const TAB_LABEL_MAX_FONT_SIZE = 13;

export const makeBottomTabNavigationStyles = (
  theme: RoleTheme,
  width: number,
  bottomInset: number,
) =>
  StyleSheet.create({
    tabBar: {
      height: TAB_BAR_HEIGHT + bottomInset,
      paddingTop: 8,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: 0,
      backgroundColor: theme.surface,
      ...Platform.select({
        android: { elevation: 0, borderTopWidth: 0 },
        ios: {
          shadowColor: theme.textPrimary,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
      }),
    },
    tabLabel: {
      fontSize: clampedScale(width, 0.025, TAB_LABEL_MAX_FONT_SIZE),
      fontFamily: FONTS.display_semi_bold,
      textAlign: 'center',
      marginTop: 5,
    },
    tabIcon: {
      marginTop: 5,
    },
    countBubble: { width: 28, height: 18, justifyContent: 'center', borderRadius: 12, position: 'absolute', top: -5, right: -12 },
    countBubbleText: { color: theme.surface, fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  });
