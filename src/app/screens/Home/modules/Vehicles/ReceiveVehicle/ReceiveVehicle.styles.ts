import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeReceiveVehicleStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    transferCard: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    vehicleHeader: {
        marginBottom: 16,
    },
    vehicleName: {
        fontSize: 20,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
        marginBottom: 12,
    },
    vehicleModel: {
        fontSize: 16,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    plateBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-end',
        position: 'absolute',
        right: 0,
        top: 0,
    },
    plateText: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    fromText: {
        fontSize: 15,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        marginBottom: 24,
    },
    emailText: {
        fontFamily: FONTS.display_semi_bold,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 2,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.surface,
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
    },
    acceptButton: {
        flex: 1,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButtonText: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.surface,
    },
});