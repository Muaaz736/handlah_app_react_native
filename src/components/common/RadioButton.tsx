import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';
import { useUserRole } from '../../hooks/useUserRole';
import { makeRadioButtonDefaultStyles } from './RadioButton.styles';
import { RoleTheme } from '../../types/roleManager.types';

interface RadioButtonProps {
  selected: boolean;
  onPress: () => void;
  label?: string;
  size?: number;
  borderColor?: string;
  selectedBorderColor?: string;
  outerBackgroundColor?: string;
  fillColor?: string;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  innerSizeRatio?: number;
  disabled?: boolean;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  selected,
  onPress,
  label,
  size = 20,
  borderColor = '#D1D1D1',
  selectedBorderColor,
  outerBackgroundColor,
  fillColor,
  style,
  containerStyle,
  labelStyle,
  innerSizeRatio = 0.5,
  disabled = false,
}) => {
  const { themeColors } = useUserRole();
  const defaultStyles = useMemo(() => makeRadioButtonDefaultStyles(themeColors as RoleTheme), [themeColors]);
  const resolvedFillColor = fillColor || themeColors.darkGreen;
  const innerSize = size * innerSizeRatio;
  const resolvedSelectedBorderColor = selectedBorderColor ?? resolvedFillColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      style={[defaultStyles.container, containerStyle]}
    >
      <View
        style={[
          defaultStyles.outerCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: selected ? resolvedSelectedBorderColor : borderColor,
            backgroundColor: outerBackgroundColor ?? 'transparent',
          },
          style,
        ]}
      >
        {selected && (
          <View
            style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: resolvedFillColor,
            }}
          />
        )}
      </View>
      {label ? (
        <Text style={[defaultStyles.label, labelStyle]}>{label}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

export default RadioButton;
