import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeViewVehicleModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalWrapper: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        marginTop: 100,
    },
    xCloseButton: {
        position: 'absolute',
        top: 22,
        right: 22,
        zIndex: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    xCloseButtonText: {
        fontSize: 14,
        color: colors.black,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.surface,
        margin: 16,
        borderRadius: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 30,
    },
    vehicleCard: {
        backgroundColor: theme.surface,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    vehicleImage: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        backgroundColor: '#E5E5E5',
        marginRight: 12,
    },
    vehicleHeaderText: {
        flex: 1,
        paddingTop: 4,
    },
    vehicleTitle: {
        fontSize: 20,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
        marginBottom: 8,
        writingDirection: 'ltr',
        textAlign: 'left',
    },
    vehicleSubtitle: {
        fontSize: 15,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    modelBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    modelBadgeText: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    detailsGrid: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 20,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 4,
        textAlign: 'left',
    },
    detailValue: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        textAlign: 'left',
    },
    detailValueMuted: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    detailRow: {
        marginBottom: 16,
    },
    section: {
        borderTopWidth: 1,
        borderTopColor: '#9b9b9b',
        paddingTop: 16,
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
        textAlign: 'left',
    },
    previousTransferTitle: {
        fontSize: 14,
        marginTop: 12,
        marginBottom: 8,
    },
    totalAmount: {
        fontSize: 14,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    itemCard: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderColor: theme.textSecondary,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        flex: 1,
        marginRight: 8,
        textAlign: 'left',
    },
    amountBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        // position: 'absolute',
        // right: I18nManager.isRTL ? undefined : 55,
        // left: I18nManager.isRTL ? 50 : undefined,
        // top: 0,
    },
    amountText: {
        fontSize: 13,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
    },
    dateBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateBadgeText: {
        fontSize: 13,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        padding: 4,
    },
    itemDetail: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: '#666666',
        marginBottom: 3,
        lineHeight: 18,
        textAlign: 'left',
    },
    itemDetailGreen: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        marginBottom: 3,
        textAlign: 'left',
    },
    itemNotes: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: '#999999',
        marginTop: 4,
        textAlign: 'left',
    },
    attachmentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    attachmentText: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        textAlign: 'left',
    },
    attachmentLabel: {
        fontSize: 12,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textSecondary,
        marginTop: 8,
        textAlign: 'left',
    },
    cardAttachment: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginTop: 8,
        resizeMode: 'cover',
        overflow: 'hidden',
    },
    actionButtonsContainer: {
        gap: 12,
        marginTop: 24,
        marginBottom: 16,
    },
    sellButton: {
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    sellButtonText: {
        fontSize: 17,
        fontFamily: FONTS.display_semi_bold,
        color: theme.surface,
    },
    closeButton: {
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 17,
        fontFamily: FONTS.display_semi_bold,
        color: theme.surface,
    },
    sectionTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 4 },
    addBtn: {
        height: 22,
        width: 22,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
