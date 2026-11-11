import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddServiceRecordsStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  notesInput: {
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 15,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    borderWidth: 1,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error || '#FF3B30',
    fontFamily: FONTS.display_regular,
    marginTop: 4,
    marginLeft: 4,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    backgroundColor: theme.surface,
  },
  uploadText: {
    fontSize: 15,
    fontFamily: FONTS.display_regular,
  },
  addRecordButton: {
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  addVehicleButton: {
    marginTop: 8,
  },
  skipButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
    alignSelf: 'flex-end',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    marginRight: 16,
  },
  skipButtonText: {
    fontSize: 15,
    fontFamily: FONTS.display_medium,
    textAlign: 'center',
    fontWeight: '600',
  },
  skipText: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
  },
  recordsListContainer: {
    marginBottom: 20,
  },
  recordCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: theme.surface,
  },
  recordCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recordHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  recordCardTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  costBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  costBadgeText: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  recordCardSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  recordCardOdometer: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    marginBottom: 6,
  },
  recordCardNotes: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  recordCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    padding: 4,
  },
});