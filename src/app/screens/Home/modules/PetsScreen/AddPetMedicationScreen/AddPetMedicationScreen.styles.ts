import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddPetMedicationScreenStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  mainTitle: {
    fontSize: 26,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  mainSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: '#666666',
    marginBottom: 20,
  },
  header: {
    paddingTop: 16,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 12,
    marginBottom: 20,
  },
  medicationCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicationName: {
    fontSize: 18,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  medicationActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 2,
  },
  smallInput: {
    width: 70,
  },
  scheduleContainer: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoIconButton: {
    padding: 2,
  },
  intervalsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalInputWrapper: {
    flex: 1,
  },
  intervalTimeWrapper: {
    flex: 1,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginTop: 8,
  },
  addMedicationButton: {
    backgroundColor: colors.lightCGreen,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  addMedicationText: {
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
  },
  skipText: {
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    textAlign: 'center',
    marginTop: 16,
  },
  actionIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.inputBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.inputBg,
  },
  timeChipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_medium,
  },
  timeChipRemove: {
    padding: 2,
  },
  inlineTimePicker: {
    marginBottom: 8,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  addTimeButtonText: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  dayChipText: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthChipText: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  reminderContainer: {
    marginBottom: 16,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  reminderText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
