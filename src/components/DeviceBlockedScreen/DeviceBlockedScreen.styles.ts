import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconText: {
    color: colors.white,
    fontSize: 48,
    fontFamily: fonts.display_bold,
    lineHeight: 56,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.display_bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 14,
  },
  message: {
    fontSize: 15,
    fontFamily: fonts.display_regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 36,
    backgroundColor: colors.error,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.display_semi_bold,
  },
});
