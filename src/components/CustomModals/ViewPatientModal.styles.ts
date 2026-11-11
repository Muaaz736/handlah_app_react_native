import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewPatientModalStyles = (theme: RoleTheme) =>
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
  patientTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  patientTagText: {
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
  dob: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary || '#888',
    marginBottom: 20,
  },
  closeButton: {
    width: '100%',
    paddingVertical: 14,
    marginTop: 10,
  },
});
