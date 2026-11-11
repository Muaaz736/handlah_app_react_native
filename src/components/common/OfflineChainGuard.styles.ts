import { StyleSheet } from 'react-native';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeOfflineChainGuardStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  banner: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFEEBA',
  },
  title: {
    fontSize: 15,
    fontFamily: FONTS.display_bold,
    color: '#856404',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 18,
  },
});
