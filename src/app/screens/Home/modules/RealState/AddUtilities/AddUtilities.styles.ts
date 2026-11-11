import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddUtilitiesStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    tabContainer: {
        marginTop: 24,
        marginBottom: 20,
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
        borderRadius: 16,
        paddingHorizontal: 0,
    },
    inputContainer: {
        marginBottom: 0,
    },
    inputContainerNoMargin: {
        marginBottom: 0,
    },
    notesSection: {
        marginBottom: 20,
    },
    notesInput: {
        height: 100,
        paddingTop: 12,
    },
    notesInputContainer: {
        height: 120,
        alignItems: 'flex-start',
    },
    addUtilityButton: {
        marginTop: 16,
        marginBottom: 16,
    },
    utilitiesListContainer: {
        marginBottom: 20,
    },
    utilityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    utilityCardContent: {
        flex: 1,
        gap: 4,
    },
    utilityCardTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    utilityCardSubtitle: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    utilityCardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
});