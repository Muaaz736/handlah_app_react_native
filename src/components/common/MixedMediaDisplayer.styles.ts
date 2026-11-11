import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeMixedMediaDisplayerStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  sliderContainer: {
    position: 'relative',
    backgroundColor: theme.textPrimary,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  scrollItem: {
    overflow: 'hidden',
  },
  image: {
    backgroundColor: theme.surface,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
  },
  documentsContainer: {
    marginTop: 8,
  },
  documentsTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 8,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  documentType: {
    fontSize: 11,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.surface,
  },
  downloadText: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
  },
  previewModal: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 64,
    right: 16,
    zIndex: 99,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});
