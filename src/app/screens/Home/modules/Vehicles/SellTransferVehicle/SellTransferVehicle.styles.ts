import { StyleSheet } from 'react-native';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import type { RoleTheme } from '../../../../../../types/roleManager.types';

export const makeSellTransferVehicleStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  fullWidthInput: {
    marginBottom: 16,
  },
  markAsSoldButton: {
    marginTop: 24,
    borderRadius: 30,
    paddingVertical: 16,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 8,
  },
  halfButton: {
    flex: 1,
    borderRadius: 30,
    paddingVertical: 16,
  },
});

export const makeDropdownStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
    maxHeight: 200,
    marginTop: 4,
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 10,
  },
  list: {
    maxHeight: 200,
    position: 'absolute',
    backgroundColor: theme.surface,
    top: 0,
    left: 0,
    right: 0,
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  itemUsername: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    color: theme.textPrimary,
  },
  itemFullname: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    padding: 12,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export const makeOwnBizStyles = (theme: RoleTheme) =>
  StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 4,
  },
  toggleLabel: {
    fontFamily: FONTS.display_medium,
    fontSize: 14,
    color: theme.textPrimary,
    flex: 1,
    marginRight: 12,
  },
});
;