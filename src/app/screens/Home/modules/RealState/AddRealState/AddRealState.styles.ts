import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddRealStateStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    activeTab: {
        borderBottomWidth: 1,
        borderBottomColor: theme.textSecondary,
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
        marginTop: 24,
    },
    flexOne: {
        flex: 1,
    },
});