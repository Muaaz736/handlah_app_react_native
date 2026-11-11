import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomHeaderStyles = (theme: RoleTheme) => StyleSheet.create({
  container: {
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
    backgroundColor: theme.background,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
    fontWeight: '800',
  },
  tabsContainer: {
    width: '50%',
    padding: 0,
    backgroundColor: theme.surface,
    height: 40,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerOverPhoto: {
    backgroundColor: 'transparent',
    paddingTop: 6,
    paddingBottom: 10,
  },
  tabsContainerOverPhoto: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderColor: 'rgba(255,255,255,0.45)',
  },
  tabLabelOverPhoto: {
    color: '#fff',
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_bold,
    color: theme.textPrimary,
  },
  activeTabLabel: {
    color: theme.surface,
  },
  activeTab: {},
  searchWrapper: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  searchStartIcon: {
    tintColor: theme.textPrimary,
    width: 20,
    height: 20,
  },
  voiceIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  searchInputContainer: {
    borderRadius: 14,
    height: 48,
  },
  searchContainer: {
    marginBottom: 5,
  },
  notificationButton: {
    position: 'relative',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    fontSize: 9,
    fontFamily: FONTS.display_bold,
    color: theme.surface,
    lineHeight: 12,
  },
});
