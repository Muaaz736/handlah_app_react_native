import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { isIOS } from '../../../../../../utils/helpers';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeEditMedicationStyles = (theme: RoleTheme) =>
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
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,
    infoIconButton: {
        padding: 2,
    } as ViewStyle,
    dropdown: {
        borderColor: theme.border || '#E8E8E8',
        borderRadius: 8,
    } as ViewStyle,
    inputContainer: {
        marginBottom: 16,
    } as ViewStyle,
    inputContainerNoMargin: {
        marginBottom: 0,
    } as ViewStyle,
    rowContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    } as ViewStyle,
    halfInput: {
        flex: 1,
    } as ViewStyle,
    smallInput: {
        width: 70,
    } as ViewStyle,
    flexInput: {
        flex: 1,
    } as ViewStyle,
    highlightedInput: {
        borderColor: colors.primary,
        borderWidth: 1.5,
    } as ViewStyle,
    textAreaContainer: {
        height: 80,
        alignItems: 'flex-start',
        paddingTop: 12,
        paddingBottom: 12,
    } as ViewStyle,
    textAreaInput: {
        height: '100%',
        textAlignVertical: 'top',
    } as TextStyle,
    reminderContainer: {
        marginBottom: 16,
    } as ViewStyle,
    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.border,
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
    timeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: theme.border,
    } as ViewStyle,
    timeChipText: {
        flex: 1,
        fontSize: 14,
        fontFamily: FONTS.display_medium,
    } as TextStyle,
    timeChipRemove: {
        padding: 2,
    } as ViewStyle,
    inlineTimePicker: {
        marginBottom: 8,
    } as ViewStyle,
    addTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingVertical: 10,
        gap: 6,
        marginTop: 4,
    } as ViewStyle,
    addTimeButtonText: {
        fontSize: 14,
        fontFamily: FONTS.display_medium,
    } as TextStyle,
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    } as ViewStyle,
    dayChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border || '#E8E8E8',
        backgroundColor: theme.surface,
    } as ViewStyle,
    dayChipText: {
        fontSize: 13,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    } as TextStyle,
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    } as ViewStyle,
    monthChip: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border || '#E8E8E8',
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    monthChipText: {
        fontSize: 13,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    } as TextStyle,
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderStyle: 'dashed',
        gap: 8,
    } as ViewStyle,
    uploadText: {
        fontSize: 14,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
    } as TextStyle,
    buttonContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    } as ViewStyle,
    saveButton: {
        paddingVertical: 16,
    } as ViewStyle,
    errorText: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: colors.error,
        marginTop: 4,
        textAlign: 'left',
    } as TextStyle,
});
