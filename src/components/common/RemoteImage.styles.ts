import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeRemoteImageStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.surface,
  },
  scrollItem: {
    overflow: 'hidden',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
  },
  previewModal: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 64,
    right: 16,
    zIndex: 99,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});
