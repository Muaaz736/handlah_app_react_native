import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddVehicleStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    radioGroup: {
        flexDirection: 'row',
        gap: 24,
        alignItems: 'center',
    },
    radioLabel: {
        fontSize: 15,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 20,
        backgroundColor: theme.surface,
    },
    uploadText: {
        fontSize: 15,
        fontFamily: FONTS.display_regular,
    },
    continueButton: {
        marginTop: 8,
    },
});