import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';

export const makeStep00SetupChoiceStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    headerContainerStyle: {
        paddingHorizontal: 16,
        marginBottom: 0,
    },
    header: {
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
    },
    titleSection: {
        marginTop: -70,
        marginBottom: 32,
    },
    mainTitle: {
        fontSize: 28,
        fontFamily: FONTS.display_bold,
        fontWeight: '500' as const,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        lineHeight: 20,
    },
    optionsContainer: {
        gap: 16,
        marginBottom: 32,
    },
    optionCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 16,
        backgroundColor: theme.background,
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.surface,
        marginRight: 12,
    },
    optionTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        flex: 1,
        fontWeight: '500' as const,
    },
    optionDescription: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        marginTop: -6,
    },
    checkmark: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: theme.border,
    },
    continueButton: {
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: theme.background,
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
    },
  });
