import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { isIOS } from '../../../../../../utils/helpers';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeEditOverviewStyles = (theme: RoleTheme) =>
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
        marginTop: 30,
    } as ViewStyle,
    title: {
        fontSize: 26,
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
        marginBottom: 24,
        marginTop: 0,
    } as TextStyle,
    inputGroup: {
        marginBottom: 20,
    } as ViewStyle,
    dropdown: {
        borderColor: theme.border || '#E8E8E8',
        borderRadius: 8,
    } as ViewStyle,
    inputContainer: {
        marginBottom: 16,
    } as ViewStyle,
    textAreaContainer: {
        height: 100,
        alignItems: 'flex-start',
        paddingTop: 12,
        paddingBottom: 12,
    } as ViewStyle,
    textAreaInput: {
        height: '100%',
        textAlignVertical: 'top',
    } as TextStyle,
    buttonContainer: {
        paddingBottom: 16,
        paddingHorizontal: 16,
    } as ViewStyle,
    saveButton: {
        paddingVertical: 16,
    } as ViewStyle,
});
