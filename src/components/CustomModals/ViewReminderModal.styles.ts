import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewReminderModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONTS.display_semi_bold,
  },
  closeIcon: {
    padding: 4,
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border || '#E5E7EB',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border || '#E5E7EB',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  closeButton: {
    flex: 1,
    margin: 0,
    borderRadius: 25,
    paddingVertical: 14.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: FONTS.display_bold,
    fontSize: 16,
    color: theme.surface,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    gap: 10,
  },
  markCompletedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3.5,
    borderWidth: 1.5,
    borderRadius: 25,
    paddingVertical: 13,
  },
  markCompletedText: {
    fontFamily: FONTS.display_bold,
    fontSize: 13,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 25,
    paddingVertical: 13,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  viewDetailsText: {
    fontFamily: FONTS.display_bold,
    fontSize: 14,
    color: theme.surface,
  },
});
