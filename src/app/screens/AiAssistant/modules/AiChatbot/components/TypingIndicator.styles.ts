import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../../types/roleManager.types';
import colors from '../../../../../../utils/colors';

export const makeTypingIndicatorStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  typingBubble: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -12,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.textPrimary,
  },
  botAvatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  botAvatarText: {
    color: theme.background,
    fontSize: 14,
  },
});
