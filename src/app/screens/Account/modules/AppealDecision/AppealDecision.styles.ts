import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';

export const makeAppealDecisionStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    marginBottom: 24,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 16,
    textAlign: 'left',
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 12,
    marginTop: 8,
    textAlign: 'left',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  inputContainer: {
    height: 'auto',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  infoText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    marginBottom: 16,
    lineHeight: 18,
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  checkboxGroup: {
    gap: 12,
  },
});

import colors from '../../../../../utils/colors';

export const makeAppealDecisionReceiveStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonImage: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  iconContainer: {
    marginBottom: 0,
  },
  iconCard: {
    width: 90,
    height: 70,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: theme.surface,
    backgroundColor: 'transparent',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.surface,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLines: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  iconLine: {
    height: 2.5,
    backgroundColor: theme.surface,
    marginVertical: 3.5,
    borderRadius: 1,
  },
  iconLineShort: {
    width: '70%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14.5,
    color: theme.textPrimary,
    fontFamily: FONTS.display_regular,
    textAlign: 'center',
    lineHeight: 21,
    opacity: 0.95,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 4,
  },
  uploadButton: {
    backgroundColor: theme.surface,
    marginBottom: 12,
  },
  uploadButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
  },
  detailsButton: {
    backgroundColor: 'rgba(139, 195, 74, 0.3)',
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    outlineColor: 'rgba(255, 255, 255, 0.2)',
    outlineWidth: 1,
  },
  detailsButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
  },
  successIcon: {
    width: 150,
    height: 150,
  },
});
