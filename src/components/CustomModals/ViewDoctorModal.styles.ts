import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewDoctorModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginTop: -60,
    marginBottom: 12,
    alignSelf: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.surface,
  },
  specialityTag: {
    backgroundColor: colors.lightCGreen,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  specialityText: {
    fontFamily: FONTS.display_medium,
    fontSize: 12,
    color: theme.textPrimary,
  },
  name: {
    fontFamily: FONTS.display_bold,
    fontSize: 20,
    color: theme.textPrimary,
    marginBottom: 4,
    textAlign: 'left',
  },
  npiId: {
    fontFamily: FONTS.display_regular,
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  contactContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 24,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    paddingVertical: 8,
    borderBottomWidth: 0,
  },
  inlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inlineText: {
    fontFamily: FONTS.display_regular,
    fontSize: 13,
    color: theme.textPrimary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0,
    gap: 8,
  },
  contactText: {
    fontFamily: FONTS.display_regular,
    fontSize: 13,
    color: theme.textPrimary,
    flex: 1,
  },
  sectionLabel: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  labelText: {
    fontFamily: FONTS.display_regular,
    fontSize: 12,
    color: theme.textSecondary,
  },
  addressRow: {
    paddingBottom: 8,
  },
  addressText: {
    fontFamily: FONTS.display_regular,
    fontSize: 13,
    color: theme.textPrimary,
    lineHeight: 18,
  },
  datesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontFamily: FONTS.display_semi_bold,
    fontSize: 12,
    color: theme.textSecondary,
  },
  dateValue: {
    fontFamily: FONTS.display_regular,
    fontSize: 12,
    color: theme.textPrimary,
  },
  emailText: {
    color: colors.secondary,
  },
  websiteText: {
    color: theme.textPrimary,
  },
  closeButton: {
    width: '100%',
  },
});
