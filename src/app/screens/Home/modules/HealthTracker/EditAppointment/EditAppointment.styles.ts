import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { isIOS } from '../../../../../../utils/helpers';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeEditAppointmentStyles = (theme: RoleTheme) =>
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
        marginTop: 8,
    } as TextStyle,
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary || '#888',
        marginBottom: 24,
    } as TextStyle,
    inputGroup: {
        marginBottom: 16,
    } as ViewStyle,
    dropdown: {
        borderColor: theme.border || '#E8E8E8',
        borderRadius: 8,
    } as ViewStyle,
    doctorDropdownWrapper: {
        position: 'relative',
    } as ViewStyle,
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
    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.border,
        marginBottom: 16,
    } as ViewStyle,
    reminderText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    } as TextStyle,
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: theme.border || '#E8E8E8',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    uploadContainer: {
        marginBottom: 16,
    } as ViewStyle,
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 16,
    } as ViewStyle,
    sectionTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 16,
    } as TextStyle,
    datePickerContainer: {
        marginBottom: 16,
    } as ViewStyle,
    buttonContainer: {
        paddingBottom: 16,
        paddingHorizontal: 16,
    } as ViewStyle,
    saveButton: {
        paddingVertical: 16,
    } as ViewStyle,
    errorTextRow: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: '#FF0000',
        marginTop: -12,
        textAlign: 'left',
    } as TextStyle,
    errorTextLocation: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: '#FF0000',
        marginTop: 4,
        marginBottom: 16,
        textAlign: 'left',
    } as TextStyle,
});
