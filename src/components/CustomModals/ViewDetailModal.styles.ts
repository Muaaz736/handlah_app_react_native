import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

const { width } = require('react-native').Dimensions.get('window');

export const makeViewDetailModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: width * 0.92,
    maxHeight: '80%',
    backgroundColor: theme.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.display_bold,
    color: theme.surface,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  headerBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    color: theme.surface,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 4,
  },
  imageContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 180,
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#666666',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  detailsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    color: '#999999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  secretValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secretValue: {
    flexShrink: 1,
  },
  secretToggle: {
    padding: 2,
  },
  singleRow: {
    paddingVertical: 12,
  },
  linkValue: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  sectionContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.display_bold,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#555555',
    lineHeight: 20,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  sectionRowLabel: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: '#999999',
  },
  sectionRowValue: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  bottomCloseButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  credentialsButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  credentialsButtonText: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
  },
  removeWalletButton: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    borderColor: '#E53935',
  },
  removeWalletButtonText: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    color: '#E53935',
  },
  bottomCloseButtonText: {
    fontSize: 16,
    fontFamily: FONTS.display_bold,
    color: theme.surface,
  },
});
