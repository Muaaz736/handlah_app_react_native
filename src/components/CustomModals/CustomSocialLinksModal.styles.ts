import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeCustomSocialLinksModalStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  socialIconButton: {
    width: 56,
    height: 56,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIconImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
