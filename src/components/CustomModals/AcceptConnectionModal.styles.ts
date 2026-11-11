import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeAcceptConnectionModalStyles = (theme: RoleTheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    maxHeight: '85%',
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 8,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  dropdownHeight: {
    height: 50,
  },
  emptyText: {
    fontSize: 13,
    color: theme.textSecondary,
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
  },
  switchScale: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
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
