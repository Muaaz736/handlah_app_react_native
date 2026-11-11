import { StyleSheet } from 'react-native';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeComplianceVaultStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    safeArea: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { alignItems: 'center', paddingBottom: 30 },
    iconContainer: { marginBottom: 10, alignItems: 'center' },
    title: { fontSize: 28, color: theme.background, fontFamily: FONTS.display_medium, marginTop: 10, textAlign: 'center' },
    addButton: { backgroundColor: theme.background, width: 'auto', paddingHorizontal: 30, paddingVertical: 12, marginTop: 10, marginBottom: 20 },
    addButtonText: { color: theme.textPrimary, fontSize: 14 },
    emptyStateContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, width: '100%' },
    emptyIconContainer: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    emptyStateTitle: { fontSize: 16, fontFamily: FONTS.display_regular, color: theme.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
    foldersList: { width: '100%', gap: 12, marginVertical: 20 },
    folderCard: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: theme.surface, borderRadius: 12, padding: 16,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1, shadowRadius: 20, elevation: 2, marginHorizontal: 16,
    },
    folderContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    buttonsRow: { flexDirection: 'row', gap: 12, marginTop: 10, marginBottom: 20 },
    shareIconBlack: { width: 20, height: 20, resizeMode: 'contain', tintColor: theme.textPrimary },
    folder_icon: { width: 20, height: 20, tintColor: theme.primary, marginRight: 10 },
    folderInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    folderName: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.textPrimary, textAlign: 'left' },
    folderDescription: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, textAlign: 'left', marginTop: 4 },
    chevronIcon: { marginLeft: 8 },
    folderActions: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 16 },
    actionButton: {},
    actionIcon: { width: 18, height: 18, resizeMode: 'contain' },
    loadingOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    gradientContainer: { flex: 1 },
    headerContainerStyle: { paddingHorizontal: 16, marginBottom: 0 },
    headerIcon: { width: 78, height: 78, resizeMode: 'contain', alignSelf: 'center', tintColor: theme.background },
    fullWidthFlex: { width: '100%', flex: 1 },
  });
