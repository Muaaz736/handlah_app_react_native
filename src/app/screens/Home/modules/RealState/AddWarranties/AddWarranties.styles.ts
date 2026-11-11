import { StyleSheet } from 'react-native';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddWarrantiesStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    tabContainer: {
        marginTop: 24,
        marginBottom: 20,
    },
    activeTab: {
        borderBottomWidth: 1,
        borderBottomColor: theme.border || '#E0E0E0',
        paddingBottom: 8,
    },
    activeTabText: {
        fontSize: 18,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        paddingHorizontal: 16,
        textAlign: 'left',
    },
    formContainer: {
        borderRadius: 16,
        paddingHorizontal: 0,
    },
    inputContainer: {
        marginBottom: 0,
    },
    datesRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    dateColumn: {
        flex: 1,
    },
    notesInput: {
        height: 100,
        paddingTop: 10,
    },
    attachmentsList: {
        marginTop: 12,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    attachmentName: {
        flex: 1,
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        marginRight: 8,
    },
    addWarrantyButton: {
        marginTop: 16,
        marginBottom: 16,
    },
    warrantiesListContainer: {
        marginBottom: 20,
    },
    warrantyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    warrantyCardContent: {
        flex: 1,
        gap: 4,
    },
    warrantyCardTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    warrantyCardSubtitle: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    warrantyCardDate: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
        marginTop: 2,
    },
    warrantyCardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
});
