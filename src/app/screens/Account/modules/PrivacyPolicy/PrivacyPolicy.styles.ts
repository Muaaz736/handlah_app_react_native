import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';


export const makePrivacyPolicyStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 16,
  },

  headerContainer: {
    marginBottom: 10,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 12,
    textAlign:"left"
  },
  sectionText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 22,
    textAlign: 'left',
  },
  effectiveDate: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.textSecondary,
    opacity: 0.3,
    marginVertical: 20,
  },
  footer: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
});
