import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = require('react-native').Dimensions.get('window');

export const makeMixedMediaUploaderStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: { marginBottom: 16 },
    label: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, marginBottom: 8 },
    loadingContainer: { height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed' },
    loadingText: { marginTop: 8, fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }, // Added marginBottom
    documentsSection: {
        width: '100%',
        marginBottom: 16,
        gap: 8, // Adds spacing between document items
    },
    thumbnailWrapper: { position: 'relative', borderRadius: 8 },
    thumbnail: { width: '100%', height: '100%', borderRadius: 8, resizeMode: 'cover' },
    thumbnailPlaceholder: { width: '100%', height: '100%', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    thumbnailRemoveBtn: {
        position: 'absolute',
        top: 4,  // Changed from -8 to 4
        right: 4, // Changed from -8 to 4
        backgroundColor: theme.surface,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        zIndex: 1, // Ensure it's above the image
    }, documentEntry: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.border, borderRadius: 10, backgroundColor: theme.surface, padding: 12, gap: 12 },
    documentInfo: { flex: 1 },
    documentName: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, marginBottom: 4, flex: 1 },
    uploadingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    uploadingText: { fontSize: 11, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    errorText: { fontSize: 11, fontFamily: FONTS.display_regular, color: colors.error },
    removeBtn: { padding: 4 },
    uploadAddButton: { height: 110, borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.border, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface, gap: 8 },
    uploadAddText: { fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    disabled: { opacity: 0.5 },
    modalContainer: { flex: 1, backgroundColor: theme.surface },
    modalContent: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
    modalTitle: { fontSize: 18, fontFamily: FONTS.display_bold, color: theme.textPrimary },
    modalCloseBtn: { padding: 4 },
    modalOptions: { paddingHorizontal: 16, paddingVertical: 24, gap: 16 },
    modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.background, gap: 16 },
    modalOptionText: { fontSize: 16, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
    previewCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
    previewImg: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.75 },
});
