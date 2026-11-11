import { StyleSheet, Dimensions } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';

const { width } = Dimensions.get('window');
export const ITEM_WIDTH = (width - 60) / 2;

export const makeStep02LifeLookLike2Styles = (theme: RoleTheme) =>
  StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
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
