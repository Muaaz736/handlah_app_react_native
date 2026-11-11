import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../types/roleManager.types';
import FONTS from '../../utils/fonts';
import colors from '../../utils/colors';
const ONBOARDING_CONTENT_MAX_WIDTH = 500;

export const makeCommonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: FONTS.display_bold,
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500' as const,
    fontFamily: FONTS.display_semi_bold,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    marginBottom: 24,
  },
  progressFill: {
    height: 6,
    borderRadius: 10,
  },
  titleSection: {
    marginBottom: 28,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: FONTS.display_bold,
    marginBottom: 12,
    fontWeight: '500' as const,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.display_regular,
    lineHeight: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
  },
});

export const makeOnBoardingScreenStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
    width: '100%',
    maxWidth: ONBOARDING_CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  bottomSection: {
    paddingBottom: 10,
  },
  getStartedButton: {
    backgroundColor: colors.white,
    paddingVertical: 20,
    borderRadius: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  getStartedText: {
    color: colors.secondary,
    fontSize: 18,
    fontFamily: FONTS.display_bold,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  skipButton: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  skipText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontFamily: FONTS.display_regular,
  },
});
