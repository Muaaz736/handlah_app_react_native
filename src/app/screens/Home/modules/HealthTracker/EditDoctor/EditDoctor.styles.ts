import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { isIOS } from '../../../../../../utils/helpers';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeEditDoctorStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 16,
        marginBottom: 0,
        paddingTop: isIOS ? 0 : 20,
    } as ViewStyle,
    HeaderTitle: {
        marginTop: 5,
    } as TextStyle,
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
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
        color: theme.textSecondary || '#888',
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
        paddingHorizontal: 16,
    } as ViewStyle,
    saveButton: {
        paddingVertical: 16,
    } as ViewStyle,
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary || '#888',
    } as TextStyle,
    errorText: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: colors.error || '#FF0000',
        marginTop: -12,
        marginBottom: 12,
    } as TextStyle,
});
