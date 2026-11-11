import { StyleSheet } from 'react-native';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddServicesWorkHistoryStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    descriptionInput: {
        borderRadius: 12,
        paddingTop: 10,
        height: 120,
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
    addServiceButton: {
        marginTop: 16,
        marginBottom: 16,
    },
    addPropertyButton: {
        marginTop: 8,
    },
    skipText: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
    },
    servicesListContainer: {
        marginBottom: 20,
    },
    serviceCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        backgroundColor: theme.surface,
    },
    serviceCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    serviceHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    serviceCardTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        textTransform: 'capitalize',
    },
    costBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    costBadgeText: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    serviceCardSubtitle: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 6,
    },
    serviceCardDescription: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        lineHeight: 18,
    },
    serviceCardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionIcon: {
        padding: 4,
    },
});