import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// styles shared by multiple vehicle-related screens
export const makeCommonStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingTop: 16,
        marginBottom: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    skipButtonText: {
        fontSize: 15,
        fontFamily: FONTS.display_medium,
        textAlign: 'center',
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    tabContainer: {
        marginTop: 24,
    },
    activeTab: {
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        paddingBottom: 8,
    },
    activeTabText: {
        fontSize: 18,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        paddingHorizontal: 16,
    },
    formContainer: {
        backgroundColor: theme.background,
        borderRadius: 16,
        paddingHorizontal: 0,
        marginTop: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 8,
    },
    inputContainer: {
        marginBottom: 0,
    },
    inputContainerNoMargin: {
        marginBottom: 0,
    },
    rowContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    halfInput: {
        flex: 1,
        marginVertical: 10,
    },
});

// styles specific to the Vehicles screen
export const makeVehiclesStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    safeArea: {
        flex: 1,
    },
    iconContainer: {
        marginBottom: 0,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        color: theme.surface,
        fontFamily: FONTS.display_bold,
        marginTop: 8,
        textAlign: 'center',
    },
    buttonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
    },
    vehiclesSection: {
        width: '100%',
        marginTop: 32,
    },
    soldToggleRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    soldToggleLabel: {
        fontSize: 14,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    },
    vehicleCard: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    vehicleCardSold: {
        marginBottom: 20,
    },
    vehicleInfo: {
        marginBottom: 12,
    },
    vehicleName: {
        fontSize: 18,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 4,
    },
    vehicleModel: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        marginBottom: 4,
    },
    vehicleVin: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        marginBottom: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    shareActionButton: {
        width: 'auto',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        opacity: 0.5,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        textAlign: 'center',
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingBottom: 40,
        gap: 16,
    },
    emptyIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#E5E5E5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 220,
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 13,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        flexShrink: 0,
    },
    actionBtn: {
        padding: 4,
    },
    soldBanner: {
        position: 'absolute',
        bottom: -9,
        left: 0,
        right: 0,
        paddingVertical: 8,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        alignItems: 'center',
        zIndex: -1001
    },
    soldText: {
        fontSize: 14,
        fontFamily: FONTS.display_bold,
        color: theme.text,
        textTransform: 'uppercase',
    },
    soldTextColor:{
        color: colors.text
    },
    vehicleCardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    actionIcon: {
        width: 16,
        height: 16,
    },
    gradientContainer: {
        flex: 1,
    },
    headerContainerStyle: {
        paddingHorizontal: 16,
        marginBottom: 0,
    },
    vehicleIcon: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
        tintColor: theme.background,
    },
    whiteButton: {
        backgroundColor: theme.surface,
        width: 'auto',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    blackText: {
        color: theme.textPrimary,
    },
});
