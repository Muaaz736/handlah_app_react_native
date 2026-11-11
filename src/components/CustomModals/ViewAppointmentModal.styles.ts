import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewAppointmentModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginTop: -60,
    marginBottom: 12,
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
  title: {
    fontFamily: FONTS.display_bold,
    fontSize: 20,
    color: theme.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    width: '100%',
    maxHeight: 400,
  },
  contentContainer: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontFamily: FONTS.display_medium,
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontFamily: FONTS.display_regular,
    fontSize: 14,
    color: theme.textPrimary,
  },
  closeButton: {
    width: '100%',
    marginTop: 20,
  },
});
