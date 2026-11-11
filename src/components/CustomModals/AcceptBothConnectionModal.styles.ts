import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeAcceptBothConnectionModalStyles = (theme: RoleTheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme?.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: theme.background,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '100%',
    maxHeight: '88%',
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    marginBottom: 16,
    lineHeight: 19,
  },
  innerTabStyle: {
    paddingHorizontal: 14,
  },
  scroll: {
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 8,
    gap: 12,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 15,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  dropdown: {
    height: 50,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    paddingRight: 12,
    lineHeight: 20,
  },
  switchScale: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  btn: {
    flex: 1,
    borderRadius: 12,
  },
});
