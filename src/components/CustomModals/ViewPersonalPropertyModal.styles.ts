import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewPersonalPropertyModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 24,
    maxHeight: '60%',
    width: '95%',
    paddingBottom: 20,
    alignSelf: 'center',
    position: 'relative',
  },
  closeIconButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary || '#888',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
    marginTop: 50,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  propertyCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 6,
  },
  propertyHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 22,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  propertyCategory: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary || '#888',
    marginTop: 1,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priceText: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
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
  singleInfoRow: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.textSecondary,
    gap: 4,
    marginBottom: 8,
  },
  addBtn: {
    height: 22,
    width: 22,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    paddingBottom: 8,
  },
  itemCard: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 12,
    paddingBottom: 0,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    flex: 1,
  },
  amountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  amountText: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  dateBadgeText: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 2,
  },
  actionIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  itemSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: '#666666',
    marginBottom: 3,
    lineHeight: 18,
  },
  closeButton: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 17,
    fontFamily: FONTS.display_semi_bold,
    color: theme.surface,
  },
  propertyImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#E5E5E5',
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  attachmentText: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
  },
  linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  emptySectionText: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary || '#888',
    marginTop: 2,
    marginBottom: 8,
  },
});
