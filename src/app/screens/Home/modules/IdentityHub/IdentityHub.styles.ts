import { Dimensions, StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

const { width: SW } = Dimensions.get('window');

export const makeIdentityHubTutorialStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  congratsOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  congratsCard: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'absolute',
    top: -24,
    left: "50%",
  },
  stepCircleText: {
    color: theme.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.display_bold,
    fontWeight: '700',
  },
  congratsTitle: {
    fontSize: 20,
    fontFamily: FONTS.display_bold,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  congratsBody: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#555',
    lineHeight: 20,
  },
  continueBtn: {
    marginTop: 16,
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    color: theme.surface,
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    fontWeight: '700',
  },
});

// Custom Add modal styles — centred iOS-alert look
export const makeAddModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  // Full-screen dark scrim
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // The centred white card, ~270 wide like iOS
  alertBox: {
    width: 270,
    backgroundColor: '#F2F2F7', // iOS alert background
    borderRadius: 14,
    overflow: 'hidden',
  },
  alertHeader: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 17,
    fontFamily: FONTS.display_bold,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: '#555',
    textAlign: 'center',
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8', // iOS separator colour
  },
  // Each tappable row
  alertAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  alertActionText: {
    fontSize: 17,
    fontFamily: FONTS.display_regular,
    color: '#007AFF', // iOS blue
    textAlign: 'center',
  },
  // Passport row when tutorial is spotlighting it
  alertActionHighlighted: {
    backgroundColor: 'rgba(136, 214, 47, 0.12)',
  },
  alertActionTextHighlighted: {
    fontSize: 17,
    fontFamily: FONTS.display_bold,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  passportBadge: {
    position: 'absolute',
    right: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  passportBadgeText: {
    color: theme.surface,
    fontSize: 10,
    fontFamily: FONTS.display_bold,
  },
  alertCancelText: {
    fontSize: 17,
    fontFamily: FONTS.display_bold,
    fontWeight: '600',
    color: '#FF3B30', // iOS red for cancel/destructive
    textAlign: 'center',
  },
});

// Common styles shared across IdentityHub sub-form components
export const makeCommonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  // sub-form version (used by AddIdentityHubForm, IdentityDriverLicenseForm, IdentityLicenseCertificationsForm, IdentityPassportForm)
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sectionContainer: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});

// IdentityHub.tsx (main screen) specific styles
export const makeIdentityHubStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  safeArea: {
    flex: 1,
  },
  heroCard: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  heroIcon: {
    width: 78,
    height: 78,
    resizeMode: 'contain',
    tintColor: theme.surface,
  },
  title: {
    fontSize: 24,
    color: theme.surface,
    fontFamily: FONTS.display_bold,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  whiteButton: {
    backgroundColor: theme.surface,
    width: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  blackText: {
    color: theme.textPrimary,
  },
  sectionContainer: {
    width: '100%',
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    flexShrink: 1,
  },
  sectionCount: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    padding: 4,
  },
  shareIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: theme.secondary,
  },
  tabsRow: {
    marginBottom: 6,
    marginLeft: -4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardName: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 14,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EBEBEB',
    marginVertical: 12,
  },
  tripleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  tripleCol: {
    flex: 1,
  },
  cardPhotoRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 4,
  },
  cardPhotoFields: {
    flex: 1,
  },
  passportPhoto: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  licensePhoto: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  certPhoto: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 4,
  },
  passportPhotoEmpty: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    marginBottom: 10,
    marginTop: 4,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  infoLabelIcon: {
    marginTop: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    color: theme.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
  },
  halfWidthRow: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.surface,
  },
  iconContainer: { marginBottom: 0 },
  subtitle: {
    fontSize: 14,
    color: theme.surface,
    fontFamily: FONTS.display_regular,
    textAlign: 'center',
  },
  infoValueContainer: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  passportPhotoContainer: { alignItems: 'flex-start', marginTop: 8 },
  navButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  recordCounter: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  sharedUsersSection: {
    marginTop: 12,
    marginBottom: 4,
    width: '100%',
    flex: 1
  },
  sharedUsersHeading: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },
  chipsScrollView: {
    height: 44,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignSelf: 'flex-start',
  },
  chipSelected: {
    backgroundColor: theme.background,
    borderColor: theme.surface,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  chipTextSelected: {
    color: theme.primary,
  },
});
