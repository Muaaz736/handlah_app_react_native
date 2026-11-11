import { Platform, StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../../types/roleManager.types';
import FONTS from '../../../../../../utils/fonts';
import colors from '../../../../../../utils/colors';

export const makeChatInputStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    inputContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        backgroundColor: theme.background,
    },
    imagePreviewRow: {
        flexDirection: 'row',
        paddingBottom: 8,
    },
    imagePreviewContainer: {
        width: 72,
        height: 72,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: theme.background,
        borderRadius: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: theme.surface,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 10 : 6,
        minHeight: 46,
        justifyContent: 'center',
    },
    textInput: {
        fontSize: 15,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
        maxHeight: 100,
        padding: 0,
    },
    sendButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendArrowText: {
        color: theme.surface,
        fontSize: 20,
        fontFamily: FONTS.display_bold,
        lineHeight: 22,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.40)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentPreviewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxWidth: '85%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    documentPreviewName: {
        flex: 1,
        fontSize: 13,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    },
});
