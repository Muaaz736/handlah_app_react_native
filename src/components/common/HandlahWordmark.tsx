import React, { FC } from 'react';
import { Image, ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { IMAGES } from '../../utils/Images';

interface HandlahWordmarkProps {
  variant?: 'personal' | 'business';
  height?: number;
  width?: number;
  isDark?: Boolean;
  style?: StyleProp<ImageStyle | ViewStyle>;
}

const ASPECT_RATIO = 2228 / 392;

const HandlahWordmark: FC<HandlahWordmarkProps> = ({
  height = 21,
  width,
  style,
  isDark
}) => {
  const computedWidth = width ?? height * ASPECT_RATIO;

  return (
    <Image
      source={isDark ? IMAGES?.LIGHT_LOGO : IMAGES.APP_LOGO}
      style={[{ width: computedWidth, height }, style as ImageStyle]}
      resizeMode="contain"
    />
  );
};

export default HandlahWordmark;
