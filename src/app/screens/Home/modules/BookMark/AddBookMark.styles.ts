import { StyleSheet } from 'react-native';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// Common styles (container, header, form layout, modal) are in BookMarks.styles.ts

export const makeAddBookMarkStyles = (theme: RoleTheme) => StyleSheet.create({
    notesInput: {
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
    },
    addCredentialsButton: {
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 2,
    },
    addCredentialsText: {
        color: theme.textPrimary,
        fontFamily: FONTS.display_semi_bold,
        fontSize: 16,
    },
});
