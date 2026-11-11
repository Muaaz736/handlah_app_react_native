import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewBankAccountModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  accountTitle: {
    fontSize: 22,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  balanceBadge: {
    // backgroundColor: themeColors.lightCGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  balanceText: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  bankName: {
    fontSize: 16,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    marginBottom: 24,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: '#888888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  singleDetailRow: {
    marginBottom: 20,
  },
  memoSection: {
    marginBottom: 20,
  },
  memoText: {
    fontSize: 15,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    lineHeight: 22,
  },
  plannedPaymentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    marginBottom: 16,
  },
  paymentCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    backgroundColor: theme.textPrimary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: 17,
    fontFamily: FONTS.display_semi_bold,
    color: theme.surface,
  },
  attachmentsSection: {
    marginBottom: 20,
  },
  attachmentImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
});
