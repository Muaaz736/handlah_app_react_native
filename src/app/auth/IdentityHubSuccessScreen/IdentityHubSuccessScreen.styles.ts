import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeIdentityHubSuccessStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backButtonImage: {
    width: 40,
    height: 40,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 5,
  },
  successIcon: {
    width: 200,
    height: 180,
    resizeMode: 'contain',
  },
  iconBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#C5E1A5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.surface,
    fontFamily: FONTS.display_bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.surface,
    fontFamily: FONTS.display_regular,
    marginBottom: 28,
    textAlign: 'center',
    opacity: 0.95,
  },
  button: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: 35,
    paddingVertical: 16,
  },
  buttonText: {
    color: theme.textPrimary,
    fontWeight: '600',
    fontSize: 17,
  },
});
