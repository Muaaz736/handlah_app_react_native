import { StyleSheet } from 'react-native';
import colors, { getColorWithOpacity } from '../../utils/colors';
import fonts from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomRequestCardStyles = (theme: RoleTheme) => StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme?.isDark ? '#efefef' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    textAlign: 'left',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: theme.textPrimary,
    fontSize: 20,
    fontFamily: fonts.display_bold,
    textAlign: 'left',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: fonts.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 2,
    textAlign: 'left',
  },
  email: {
    fontSize: 13,
    fontFamily: fonts.display_regular,
    color: theme.textPrimary,
    marginBottom: 2,
    textTransform: 'lowercase',
    textAlign: 'left',
  },
  phone: {
    fontSize: 13,
    fontFamily: fonts.display_regular,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    marginVertical: 0,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.textPrimary,
  },
  declineButtonText: {
    fontSize: 15,
    color: theme.background,
    fontFamily: fonts.display_medium,
    textAlign: 'left',
  },
  acceptButton: {
    flex: 1,
    marginVertical: 0,
    paddingVertical: 12,
    backgroundColor: getColorWithOpacity(colors.error, 0.2),
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderColor: theme.textPrimary,
    borderWidth: 1,
  },
  rejectButtonText: {
    fontSize: 15,
    color: theme.textPrimary,
  },
  approveButton: {
    flex: 1,
    marginVertical: 0,
    paddingVertical: 12,
  },
  statusContainer: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 15,
    fontFamily: fonts.display_semi_bold,
  },
  acceptedText: {
    color: colors.success,
  },
  declinedText: {
    color: colors.error,
  },
  emergencyContainer: {
    gap: 12,
  },
  messageText: {
    fontSize: 13,
    fontFamily: fonts.display_regular,
    color: theme.textPrimary,
    lineHeight: 18,
    textAlign: 'center',
  },
});
