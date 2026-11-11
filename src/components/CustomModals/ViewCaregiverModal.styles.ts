import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewCaregiverModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  avatarContainer: {
    marginTop: -60,
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.surface,
  },
  relationTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  relationText: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: theme.surface,
  },
  name: {
    fontSize: 24,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary || '#888',
    marginBottom: 20,
  },
  contactContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  contactText: {
    fontSize: 15,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
  emailText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  closeButton: {
    width: '100%',
    paddingVertical: 14,
  },
});
