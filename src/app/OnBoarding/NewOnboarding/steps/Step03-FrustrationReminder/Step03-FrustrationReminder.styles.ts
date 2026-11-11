import { StyleSheet, Dimensions } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';

const { width } = Dimensions.get('window');
export const ITEM_WIDTH = (width - 65) / 2;

export const makeStep03FrustrationReminderStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    section: {
        marginBottom: 16,
    },
    sectionCard: {
        backgroundColor: theme.background,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 8,

        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,

        // Android shadow
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.display_semi_bold,
        marginBottom: 16,
        marginTop: 8,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 32,
    },
    optionCard: {
        width: ITEM_WIDTH,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 12,
        backgroundColor: theme.background,
    },
    iconContainer: {
        width: 50,
        height: 50,
        justifyContent: 'center',
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: FONTS.display_semi_bold,
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        lineHeight: 14,
        marginBottom: 4,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: theme.border,
    },
    backButtonFooter: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButton: {
        flex: 1,
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
