import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../../types/roleManager.types';
import FONTS from '../../../../../../utils/fonts';

export const makeSuggestionChipsStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: theme.background,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
  },
});
