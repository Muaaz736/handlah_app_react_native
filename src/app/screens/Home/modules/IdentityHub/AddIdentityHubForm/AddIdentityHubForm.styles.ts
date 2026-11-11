import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddIdentityHubFormStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    sectionTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 12,
    },
    sectionCard: {
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
    },
    passportCard: {
        borderWidth: 2,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
        marginBottom: 8,
    },
    halfWidth: {
        flex: 1,
    },
    dropdown: {
        height: 52,
        marginBottom: 12,
    },
    stateDropdownContainer: {
        borderRadius: 12,
        borderWidth: 1,
        maxHeight: 200,
        bottom: 0,
        top: undefined,
    },
    photoSection: {
        alignItems: 'center',
        marginTop: 20,
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    passportImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 20,
        borderStyle: 'dashed',
        gap: 8,
    },
    uploadText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: FONTS.display_medium,
        color: theme.primary,
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
    },
});
