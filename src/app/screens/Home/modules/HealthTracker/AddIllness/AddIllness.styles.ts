import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { isIOS } from '../../../../../../utils/helpers';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeAddIllnessStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 16,
        marginBottom: 0,
        paddingTop: isIOS ? 0 : 20,
    } as ViewStyle,
    headerTitle: {
        marginTop: 8,
    } as TextStyle,
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 10,
    } as ViewStyle,
    sectionTitle: {
        fontSize: 22,
        fontFamily: FONTS.display_bold,
        marginTop: 6,
        marginBottom: 4,
    } as TextStyle,
    rowContainer: {
        flexDirection: 'row',
        gap: 10,
    } as ViewStyle,
    halfInput: {
        flex: 1,
    } as ViewStyle,
    label: {
        fontSize: 14,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
        marginBottom: 8,
    } as TextStyle,
    dropdown: {
        borderColor: theme.border || '#E8E8E8',
        borderRadius: 10,
        marginBottom: 12,
    } as ViewStyle,
    inputContainer: {
        marginBottom: 6,
    } as ViewStyle,
    inputContainerNoMargin: {
        marginBottom: 0,
    } as ViewStyle,
    textAreaContainer: {
        height: 92,
        alignItems: 'flex-start',
        paddingTop: 10,
        paddingBottom: 10,
    } as ViewStyle,
    textAreaInput: {
        height: '100%',
        textAlignVertical: 'top',
    } as TextStyle,
    quickLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
    } as ViewStyle,
    quickAddButton: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 4,
    } as ViewStyle,
    quickAddText: {
        fontSize: 12,
        fontFamily: FONTS.display_medium,
    } as TextStyle,
    uploadSection: {
        marginTop: 6,
        marginBottom: 8,
    } as ViewStyle,
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        backgroundColor: theme.background,
    } as ViewStyle,
    submitButton: {
        paddingVertical: 14,
    } as ViewStyle,
    quickAddBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#f9f9f9',
    } as ViewStyle,
    quickAddBtnText: {
        fontSize: 12,
        fontFamily: FONTS.display_medium,
    } as TextStyle,
    quickAddDoctorForm: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        backgroundColor: theme.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 8,
    } as ViewStyle,
    quickAddDoctorInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        backgroundColor: theme.surface,
        color: theme.textPrimary,
    } as TextStyle,
    quickAddDoctorSaveBtn: {
        height: 40,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 70,
    } as ViewStyle,
    quickAddDoctorSaveBtnText: {
        color: theme.surface,
        fontSize: 13,
        fontFamily: FONTS.display_semi_bold,
    } as TextStyle,
});
