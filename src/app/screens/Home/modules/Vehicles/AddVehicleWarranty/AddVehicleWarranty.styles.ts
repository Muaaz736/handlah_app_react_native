import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddVehicleWarrantyStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    notesInput: {
        borderRadius: 12,
        padding: 16,
        minHeight: 120,
        fontSize: 15,
        borderColor: theme.border,
        borderWidth: 1,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    addWarrantyButton: {
        marginTop: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    addVehicleButton: {
        marginTop: 8,
    },
    skipButton: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 10,
        alignSelf: 'flex-end',
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        backgroundColor: 'transparent',
        marginRight: 16,
    },
    skipButtonText: {
        fontSize: 15,
        fontFamily: FONTS.display_medium,
        textAlign: 'center',
        fontWeight: '600',
    },
    skipText: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
    },
    warrantiesListContainer: {
        marginBottom: 20,
    },
    warrantyCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        backgroundColor: theme.surface,
    },
    warrantyCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    warrantyHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    warrantyCardTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    dateBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    dateBadgeText: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    warrantyCardDescription: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        marginBottom: 8,
    },
    warrantyCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    warrantyCardText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    warrantyCardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionIcon: {
        padding: 4,
    },
});