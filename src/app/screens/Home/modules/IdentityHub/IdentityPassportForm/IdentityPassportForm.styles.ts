import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

const { height } = require('react-native').Dimensions.get('window');

export const makeTutorialHintStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.65)',
        zIndex: 100,
        justifyContent: 'flex-end',
        paddingBottom: 40,
    },
    card: {
        // marginHorizontal: 24,
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 24,
        marginBottom: height * -0.043,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: FONTS.display_bold,
        color: theme.textPrimary,
        marginBottom: 8,
    },
    body: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: '#444',
        lineHeight: 20,
        marginBottom: 20,
    },
    btn: {
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },
    btnText: {
        color: theme.surface,
        fontSize: 15,
        fontFamily: FONTS.display_medium,
        fontWeight: '600',
    },
});

export const makeIdentityPassportFormStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    sectionTitle: {
        fontSize: 17,
        fontFamily: FONTS.display_bold,
        fontWeight: 'bold',
        color: theme.textPrimary,
        marginBottom: 8,
    },
    sectionCard: {
        // backgroundColor: theme.surface,
        borderRadius: 12,
        paddingVertical: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.textPrimary,
        fontFamily: FONTS.display_medium,
        marginBottom: 8,
        textAlign: 'left',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        paddingHorizontal: 14,
        height: 52,
    },
    halfWidth: {
        flex: 1,
    },
    walletRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    walletText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    uploadSection: {
        marginTop: 24,
    },
    uploadTitle: {
        fontSize: 14,
        fontFamily: FONTS.display_medium,
        color: theme.textPrimary,
        marginBottom: 12,
    },
    uploadContainer: {
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.surface,
    },
    uploadPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    uploadText: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textPrimary,
    },
    uploadedImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    continueButton: {
        marginTop: 10,
    },
});
