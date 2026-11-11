import { Platform } from 'react-native';

export const FONTS = {
  // Use the iOS PostScript / family names on iOS, and the filename-based name on Android.
  display_regular: Platform.select({
    ios: 'SFProDisplay-Regular',
    android: 'SFPRODISPLAYREGULAR',
  }),
  display_bold: Platform.select({
    ios: 'SFProDisplay-Bold',
    android: 'SFPRODISPLAYBOLD',
  }),
  display_extra_bold: Platform.select({
    ios: 'SFProDisplay-Heavy',
    android: 'SFPRODISPLAYHEAVY',
  }),
  display_semi_bold: Platform.select({
    ios: 'SFProDisplay-Semibold',
    android: 'SFPRODISPLAYSEMIBOLD',
  }),
  display_medium: Platform.select({
    ios: 'SFProDisplay-Medium',
    android: 'SFPRODISPLAYMEDIUM',
  }),
};

export default FONTS;
