import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeImageUploaderStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  imageContainer: {
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  uploadedImageBox: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.surface,
    borderRadius: 14,
  },
  previewBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.display_regular,
    color: theme.surface,
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
  fileName: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  uploadBox: {
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  uploadTextBox: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  uploadPlaceholder: {
    minHeight: 100,
    borderRadius: 8,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadPlaceholderContent: {
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
  },
  uploadCountHint: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
  },
  disabled: {
    opacity: 0.5,
  },
  thumbnailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  thumbnailWrapper: {
    position: 'relative',
  },
  thumbnail: {
    borderRadius: 8,
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailRemoveBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.surface,
    borderRadius: 11,
  },
  multiAddButton: {
    minHeight: 80,
  },
});
