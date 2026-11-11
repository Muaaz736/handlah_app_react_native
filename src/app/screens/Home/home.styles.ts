import { StyleSheet } from 'react-native';
import FONTS from '../../../utils/fonts';
import type { RoleTheme } from '../../../types/roleManager.types';

// Common styles shared across all Home module screens
export const makeHomeCommonStyles = (theme: RoleTheme) => StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerContainerStyle: {
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  iconContainer: {
    marginBottom: 0,
    alignItems: 'center',
  },
  whiteButton: {
    backgroundColor: theme.background,
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  blackText: {
    color: theme.textPrimary,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 220,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  iconButton: {
    padding: 4,
  },
});
