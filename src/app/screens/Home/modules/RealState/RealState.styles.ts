import { StyleSheet } from 'react-native';
import FONTS from '../../../../../utils/fonts';
import { isIOS } from '../../../../../utils/helpers';
import type { RoleTheme } from '../../../../../types/roleManager.types';

// styles shared across all RealState sub-components
export const makeSharedStyles = (theme: RoleTheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        safeArea: {
            flex: 1,
            backgroundColor: theme.background,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: 16,
            paddingBottom: 30,
        },
        headerContainer: {
            paddingHorizontal: 16,
            marginBottom: 0,
            paddingTop: isIOS ? 0 : 20,
        },
        header: {
            paddingTop: 16,
            marginBottom: 6,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        backButton: {
            marginBottom: 0,
        },
        headerTitle: {
            marginBottom: 0,
        },
        backButtonIcon: {
            tintColor: theme.background,
        },
        inputGroup: {
            marginBottom: 16,
        },
        label: {
            fontSize: 15,
            fontFamily: FONTS.display_semi_bold,
            color: theme.textPrimary,
            marginBottom: 8,
        },
        rowContainer: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 16,
        },
        halfInput: {
            flex: 1,
        },
        errorText: {
            fontSize: 12,
            color: '#f44336',
            marginTop: 4,
            marginLeft: 4,
            fontFamily: FONTS.display_regular,
        },
        uploadButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderRadius: 12,
            paddingVertical: 20,
            backgroundColor: theme.surface,
        },
        uploadText: {
            fontSize: 15,
            fontFamily: FONTS.display_regular,
        },
        continueButton: {
            marginTop: 8,
        },
        skipButton: {
            paddingHorizontal: 18,
            paddingVertical: 8,
            borderRadius: 20,
            marginLeft: 10,
            alignSelf: 'flex-end',
            minWidth: 60,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            backgroundColor: 'transparent',
            marginRight: 16,
        },
        skipButtonText: {
            fontSize: 15,
            fontFamily: FONTS.display_medium,
            textAlign: 'center',
            fontWeight: '600',
        },
        skipText: {
            fontSize: 15,
            fontFamily: FONTS.display_semi_bold,
        },
        actionIcon: {
            padding: 4,
        },
        tabContainer: {
            marginTop: 24,
            marginBottom: 20,
        },
        activeTab: {
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            paddingBottom: 8,
        },
        activeTabText: {
            fontSize: 18,
            fontFamily: FONTS.display_semi_bold,
            color: theme.textPrimary,
            paddingHorizontal: 16,
        },
        formContainer: {
            borderRadius: 16,
            paddingHorizontal: 0,
        },
        inputContainer: {
            marginBottom: 0,
        },
        inputContainerNoMargin: {
            marginBottom: 0,
        },
    });

// styles specific to the RealState screen
export const makeRealEstateStyles = (theme: RoleTheme) =>
    StyleSheet.create({
        mainContainer: {
            flex: 1,
        },
        mainSafeArea: {
            flex: 1,
        },
        iconContainer: {
            marginBottom: 0,
            alignItems: 'center',
        },
        icon: {
            width: 78,
            height: 78,
            resizeMode: 'contain',
            tintColor: theme.surface,
        },
        title: {
            fontSize: 28,
            color: theme.surface,
            fontFamily: FONTS.display_bold,
            marginTop: 8,
            textAlign: 'center',
        },
        buttonsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
            marginTop: 10,
        },
        addButton: {
            backgroundColor: theme.surface,
            width: 'auto',
            paddingHorizontal: 20,
            paddingVertical: 12,
        },
        addButtonText: {
            color: theme.textPrimary,
        },
        shareButton: {
            width: 'auto',
            paddingHorizontal: 20,
            paddingVertical: 12,
        },
        shareButtonText: {
            color: theme.background,
        },
        propertiesSection: {
            width: '100%',
            marginTop: 24,
        },
        propertyCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: theme.surface,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            marginBottom: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
        },
        propertyInfo: {
            flex: 1,
            marginRight: 12,
            gap: 4,
        },
        soldBadge: {
            alignSelf: 'flex-start',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 3,
            marginTop: 4,
            marginBottom: 2,
        },
        soldBadgeText: {
            fontSize: 11,
            fontFamily: FONTS.display_bold,
            color: '#ffffff',
        },
        soldToggleRow: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
            marginBottom: 6,
        },
        soldToggleLabel: {
            fontSize: 14,
            fontFamily: FONTS.display_medium,
            color: theme.textPrimary,
        },
        propertyName: {
            fontSize: 16,
            fontFamily: FONTS.display_bold,
            color: theme.textPrimary,
            textAlign: 'left',
            textTransform: 'capitalize',
        },
        propertyAddress: {
            fontSize: 12,
            fontFamily: FONTS.display_regular,
            color: theme.textPrimary,
            marginTop: 2,
            textAlign: 'left',
        },
        actionButtons: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        actionBtn: {
            padding: 4,
        },
        shareIcon: {
            width: 18,
            height: 18,
            resizeMode: 'contain',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 60,
            minHeight: 200,
        },
        loadingText: {
            fontSize: 16,
            fontFamily: FONTS.display_regular,
            color: theme.textPrimary,
            marginTop: 12,
        },
        emptyStateContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 60,
            paddingBottom: 40,
            gap: 16,
        },
        emptyIconCircle: {
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: '#E5E5E5',
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyText: {
            fontSize: 14,
            fontFamily: FONTS.display_regular,
            color: '#888',
            textAlign: 'center',
            lineHeight: 22,
            maxWidth: 220,
        },
    });

