import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';

export const makeTermsConditionsStyles = (theme: RoleTheme) =>
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
    paddingBottom: 40,
  },
  // Brand header block
  brandText: {
    fontSize: 15,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 10,
  },
  introText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 22,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: theme.surface,
    marginBottom: 24,
  },
  // Numbered section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'left',
  },
  sectionText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 22,
    textAlign: 'left',
  },
  sectionFooter: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 22,
    marginTop: 10,
  },
  // Bullet list
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.textPrimary,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 22,
  },
  // Contact section
  contactSection: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F7F8FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  contactTitle: {
    fontSize: 15,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  contactIntro: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 22,
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#1A73E8',
    lineHeight: 24,
  },
  // Footer
  footerText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
});
