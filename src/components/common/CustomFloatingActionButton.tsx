import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import colors, { getColorWithOpacity } from '../../utils/colors';
import { isIOS } from '../../utils/helpers';
import { useUserRole } from '../../hooks/useUserRole';
import type { CustomFloatingActionButtonProps } from '../../types/common.types';
import { makeCustomFloatingActionButtonStyles } from './CustomFloatingActionButton.styles';
import { RoleTheme } from '../../types/roleManager.types';

const { width, height } = Dimensions.get('window');

const CustomFloatingActionButton: React.FC<CustomFloatingActionButtonProps> = ({
  onPress,
  style,
  size = 55,
  color,
  icon = 'plus',
  iconSize = 30,
  shadow = true,
  animated = true,
  customIcon = null,
  rightAligned = true,
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomFloatingActionButtonStyles(themeColors as RoleTheme), [themeColors]);
  const buttonColor: string = color || themeColors.primary;

  const scaleAnimation = new Animated.Value(1);

  const handlePressIn = (): void => {
    if (animated) {
      Animated.timing(scaleAnimation, {
        toValue: 0.9,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = (): void => {
    if (animated) {
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        shadow && styles.shadow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: buttonColor,
          transform: [{ scale: scaleAnimation }],
        },
        rightAligned ? { right: width * 0.05 } : { left: width * 0.05 },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={animated ? 1 : 0.8}
      >
        {customIcon ? (
          customIcon()
        ) : (
          <Feather name={icon} size={iconSize} color={themeColors.black} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CustomFloatingActionButton;
