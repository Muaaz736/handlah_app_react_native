import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = require('react-native').Dimensions.get('window');

export const makeDocumentPickerStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 15,
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
    documentContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.surface,
        overflow: 'hidden',
    },
    documentContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    documentBoxContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    documentIconContainer: {
        marginRight: 12,
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
    documentSize: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    removeButton: {
        padding: 4,
        marginLeft: 8,
    },
    uploadBox: {
        height: 120,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: theme.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    uploadTextBox: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
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
        backgroundColor: '#f5f5f5',
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
    disabled: {
        opacity: 0.5,
    },
    // Multi-doc styles
    multiDocCount: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    multiDocEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        backgroundColor: theme.surface,
        padding: 12,
        marginBottom: 10,
    },
    multiDocInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    multiDocName: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 2,
    },
    multiDocSize: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    multiDocAddButton: {
        height: 110,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: theme.border,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        gap: 8,
    },
    multiDocAddText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    multiDocUploadingBox: {
        height: 110,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        gap: 8,
    },
    multiDocUploadingText: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    // Image preview modal
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewCloseBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    previewImg: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.75,
    },
});
