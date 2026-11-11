import { StyleSheet } from 'react-native';
import type { RoleTheme } from '../../../../../types/roleManager.types';
import FONTS from '../../../../../utils/fonts';

export const makeStep04AddDataStyles = (_theme: RoleTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F7' },

    content: { padding: 20, paddingBottom: 100 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    headerTitle: {
        fontSize: 22,
        fontFamily: FONTS.display_bold,
    },

    stepBadge: {
        backgroundColor: '#6CCF2E',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
    },

    stepText: {
        color: 'white',
        fontSize: 12,
        fontFamily: FONTS.display_semi_bold,
    },

    progressBar: {
        height: 6,
        backgroundColor: '#E5E5E5',
        borderRadius: 10,
        marginBottom: 24,
    },

    progressFill: {
        height: 6,
        borderRadius: 10,
    },

    title: {
        fontSize: 28,
        fontFamily: FONTS.display_bold,
        marginBottom: 8,
        color: '#1F2937',
    },

    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 24,
        lineHeight: 22,
    },

    sectionCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 12,

        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },

        elevation: 3,
        gap: 12,
        marginBottom: 24,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#F0F0F0',
        padding: 16,
        backgroundColor: '#FFFFFF',
    },

    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    cardTitle: {
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
        marginBottom: 4,
        color: '#1F2937',
    },

    cardSubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        lineHeight: 18,
        fontFamily: FONTS.display_regular,
    },

    aiBox: {
        borderRadius: 20,
        overflow: 'hidden',
        padding: 20,
    },

    aiGradient: {
        borderRadius: 20,
        marginBottom: 20,
    },

    aiTitle: {
        color: 'white',
        fontSize: 18,
        fontFamily: FONTS.display_semi_bold,
        marginBottom: 8,
    },

    aiDesc: {
        color: 'white',
        fontSize: 13,
        opacity: 0.9,
        marginBottom: 16,
        lineHeight: 20,
        fontFamily: FONTS.display_regular,
    },

    aiInputContainer: {
        marginBottom: 0,
    },

    aiInputWrapper: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 14,
        paddingHorizontal: 14,
        minHeight: 52,
    },

    aiInputText: {
        color: 'white',
        fontSize: 14,
        fontFamily: FONTS.display_regular,
        textAlignVertical: 'center',
    },

    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        backgroundColor: '#F7F7F7',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },

    backBtn: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#E5E5E5',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        height: 52,
        backgroundColor: 'white',
    },

    backText: {
        fontSize: 16,
        fontFamily: FONTS.display_medium,
        color: '#374151',
    },

    continueBtn: {
        flex: 1,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        height: 52,
    },

    continueText: {
        color: 'white',
        fontSize: 16,
        fontFamily: FONTS.display_semi_bold,
    },
  });
