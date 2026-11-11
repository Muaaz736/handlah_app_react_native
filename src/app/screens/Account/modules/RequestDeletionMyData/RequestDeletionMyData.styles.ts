import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';
import colors from '../../../../../utils/colors';

export const makeRequestDeletionMyDataStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    color: theme.textPrimary,
    fontFamily: FONTS.display_bold,
    marginBottom: 16,
    textAlign: 'left',
  },
  headerText: {
    fontSize: 15,
    color: theme.textPrimary,
    fontFamily: FONTS.display_regular,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'left',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    marginBottom: 12,
    textAlign: 'left',
  },
  bulletPoint: {
    fontSize: 14,
    color: theme.textPrimary,
    fontFamily: FONTS.display_regular,
    lineHeight: 22,
    marginBottom: 6,
    textAlign: 'left',
  },
  requestDetailsTitle: {
    fontSize: 18,
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    textAlign: 'left',
  },
  label: {
    fontSize: 15,
    color: theme.textPrimary,
    fontFamily: FONTS.display_regular,
    marginBottom: 12,
    textAlign: 'left',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  notesInputContainer: {
    height: 120,
    alignItems: 'flex-start',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 15,
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    marginBottom: 6,
    textAlign: 'left',
  },
  infoText: {
    fontSize: 14,
    color: theme.textPrimary,
    fontFamily: FONTS.display_regular,
    lineHeight: 20,
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 5,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 10,
  },
  acknowledgementSection: {
    marginBottom: 20,
    marginTop: 10,
  },
  acknowledgementTitle: {
    fontSize: 15,
    color: theme.textPrimary,
    fontFamily: FONTS.display_semi_bold,
    marginBottom: 12,
    textAlign: 'left',
  },
  checkboxGroup: {
    gap: 5,
  },
});

export const makeRequestDeletionMyDataReceiveStyles = (theme: RoleTheme) =>
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
    borderColor: theme.textPrimary,
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
    borderColor: theme.textPrimary,
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
