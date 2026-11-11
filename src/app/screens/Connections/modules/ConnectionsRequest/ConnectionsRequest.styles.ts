import { StyleSheet } from 'react-native';
import FONTS from '../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../types/roleManager.types';

export const makeConnectionsRequestStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    tabContainer: { marginHorizontal: 16, marginTop: 16, marginBottom: 8, height: 44 },
    tabLabel: { fontSize: 15, color: theme.textPrimary },
    activeTabLabel: { fontSize: 15 },
    tab: { borderRadius: 12 },
    activeTab: { borderRadius: 12 },
    scrollView: { flex: 1 },
    contentContainer: { paddingVertical: 16, paddingTop: 8 },
  });
