import { StyleSheet, Dimensions } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';

const { width } = Dimensions.get('window');
export const ITEM_WIDTH = (width - 80) / 2;

export const makeBusinessStep02Styles = (theme: RoleTheme) =>
  StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        backgroundColor: theme.background,
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    optionCard: {
        width: ITEM_WIDTH,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1.5,
        borderColor: '#F0F0F0',
        backgroundColor: theme.background,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    optionTitle: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        lineHeight: 16,
        opacity: 0.7,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        paddingBottom: 30,
    },
    backButtonFooter: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1.5,
    },
    continueButton: {
        flex: 2,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
    },
  });
