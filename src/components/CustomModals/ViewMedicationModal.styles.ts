import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewMedicationModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  modalContainer: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 40,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    flex: 1
  },
  topIconContainer: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  topIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.surface,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationImage: {
    width: 65,
    height: 65,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  medicationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  medicationName: {
    fontSize: 22,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  medicationType: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary || '#888',
    marginTop: 2,
    textAlign: 'left',
  },
  doseBadge: {
    backgroundColor: colors.secondary || '#333',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  doseText: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
    color: theme.surface,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  scheduleType: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: colors.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary || '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  infoValueHighlight: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: colors.primary,
  },
  singleInfoRow: {
    marginBottom: 16,
  },
  websiteLink: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  notesBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  notesText: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 18,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 14,
  },
});
