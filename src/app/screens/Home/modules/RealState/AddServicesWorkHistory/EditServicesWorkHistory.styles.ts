import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { sharedStyles } from '../RealState.styles';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeEditServicesWorkHistoryStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    ...sharedStyles,
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
    },
    activeTab: {
        borderBottomWidth: 1,
        borderBottomColor: theme.textPrimary,
        paddingBottom: 8,
        marginTop: 24,
        marginBottom: 20,
    },
    activeTabText: {
        fontSize: 18,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        paddingHorizontal: 16,
    },
    formContainer: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        paddingHorizontal: 0,
    },
    inputContainer: {
        marginBottom: 0,
        flex: 1,
    },
    inputContainerNoMargin: {
        marginBottom: 0,
    },
    updateButton: {
        marginTop: 24,
    },
    skipButton: {
        marginTop: 12,
    },
});