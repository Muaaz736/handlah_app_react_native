import { StyleSheet } from 'react-native';
import colors from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import type { RoleTheme } from '../../../types/roleManager.types';

export const makeSetupIdentityHubStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: isIOS ? 50 : 30,
    left: 20,
    zIndex: 10,
  },
  backButtonImage: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  iconContainer: {
    marginBottom: 22,
  },
  identityHubIcon: {
    width: 80,
    height: 70,
  },
  iconCard: {
    width: 90,
    height: 70,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: theme.surface,
    backgroundColor: 'transparent',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.surface,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLines: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  iconLine: {
    height: 2.5,
    backgroundColor: theme.surface,
    marginVertical: 3.5,
    borderRadius: 1,
  },
  iconLineShort: {
    width: '70%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.surface,
    fontFamily: FONTS.display_bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14.5,
    color: theme.surface,
    fontFamily: FONTS.display_regular,
    textAlign: 'center',
    lineHeight: 21,
    opacity: 0.95,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 4,
  },
  uploadButton: {
    backgroundColor: theme.surface,
    marginBottom: 12,
  },
  uploadButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
  },
  detailsButton: {
    backgroundColor: 'rgba(139, 195, 74, 0.3)',
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    outlineColor: 'rgba(255, 255, 255, 0.2)',
    outlineWidth: 1,
  },
  detailsButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: FONTS.display_medium,
  },
});
