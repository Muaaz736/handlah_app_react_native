import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';

export const makeBusinessStepSelectBusinessStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 40,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        marginBottom: 20,
        lineHeight: 20,
    },
    // Business card
    businessCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: theme.border,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        backgroundColor: theme.background,
    },
    businessCardSelected: {
        borderWidth: 2,
    },
    businessIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    businessInfo: {
        flex: 1,
    },
    businessName: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginBottom: 2,
    },
    businessDescription: {
        fontSize: 12,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        lineHeight: 16,
    },
    checkIcon: {
        marginLeft: 10,
    },
    // Empty state
    emptyBox: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: theme.surface,
        borderRadius: 16,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        color: theme.textPrimary,
        marginTop: 14,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        fontFamily: FONTS.display_regular,
        color: theme.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    // Add new CTA
    addNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        gap: 8,
    },
    addNewText: {
        fontSize: 15,
        fontFamily: FONTS.display_semi_bold,
    },
    // Footer
    footer: {
        padding: 20,
        paddingBottom: 30,
    },
    continueButton: {
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
