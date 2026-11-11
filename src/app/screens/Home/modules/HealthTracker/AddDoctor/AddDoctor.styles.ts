import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeStyles = (theme: RoleTheme) => StyleSheet.create({
    HeaderTitle: {
        marginTop: 10,
    } as TextStyle,
    headerContainer: {
        paddingHorizontal: 16,
        marginBottom: 0,
        paddingTop: 20,
    } as ViewStyle,
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        marginTop: 30,
    } as ViewStyle,
    title: {
        fontSize: 26,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
        marginTop: 8,
    } as TextStyle,
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        marginBottom: 24,
    } as TextStyle,
    inputContainer: {
        marginBottom: 16,
    } as ViewStyle,
    inputContainerNoMargin: {
        marginBottom: 0,
    } as ViewStyle,
    rowContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    } as ViewStyle,
    halfInput: {
        flex: 1,
    } as ViewStyle,
    buttonContainer: {
        paddingBottom: 16,
    } as ViewStyle,
    saveButton: {
        paddingVertical: 16,
    } as ViewStyle,
});
