import { StyleSheet } from 'react-native';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles (container, header, form layout, modal) are in BookMarks.styles.ts

export const makeEditBookMarkStyles = (theme: RoleTheme) => StyleSheet.create({
    notesInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
    },
    changeCredentialsButton: {
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 2,
    },
    changeCredentialsText: {
        color: theme.textPrimary,
        fontFamily: FONTS.display_semi_bold,
        fontSize: 16,
    },
    documentPickerButton: {
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    documentPickerText: {
        fontSize: 14,
        color: theme.textPrimary,
        fontFamily: FONTS.display_medium,
    },
});
