import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import { isIOS } from '../../utils/helpers';
import FONTS from '../../utils/fonts';

export const sharedStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex1: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Scroll
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentPadded: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  // Auth / Forms
  authContentContainer: {
    flex: 1,
    padding: 18,
    paddingTop: isIOS ? 60 : 30,
  },
  formContainer: {
    width: '100%',
  },

  // Section cards
  sectionCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: colors.black,
  },
  sectionContainer: {
    width: '100%',
    marginTop: 24,
  },

  // Info rows (label + value display)
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: colors.black,
    marginBottom: 6,
  },
  infoValueContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: colors.gray,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },

  // Buttons
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },

  // Footer
  footerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    backgroundColor: colors.white,
  },
});

// Common AuthHeader container style used across 20+ screens
export const AUTH_HEADER_STYLE = {
  paddingHorizontal: 16,
  marginBottom: 0,
  paddingTop: isIOS ? 0 : 20,
} as const;
