import { View } from 'react-native';
import React from 'react';
import colors, { getColorWithOpacity } from '../../utils/colors';
import type { CustomSeparatorProps } from '../../types/common.types';

const CustomSeparator: React.FC<CustomSeparatorProps> = ({
  style,
  orientation = 'horizontal', // 'horizontal' or 'vertical'
  thickness = 0.5,
  color = getColorWithOpacity(colors.gray, 0.4),
  length,
  margin = 15,
  marginHorizontal,
  marginVertical,
  ...props
}) => {
  // Determine styles based on orientation
  const getSeparatorStyle: any = () => {
    const baseStyle = {
      backgroundColor: color,
    };

    if (orientation === 'vertical') {
      return {
        ...baseStyle,
        width: thickness,
        height: length || '100%',
        marginHorizontal:
          marginHorizontal !== undefined ? marginHorizontal : margin,
        marginVertical: marginVertical !== undefined ? marginVertical : 0,
      };
    } else {
      // Default horizontal
      return {
        ...baseStyle,
        width: length || '100%',
        height: thickness,
        marginVertical: marginVertical !== undefined ? marginVertical : margin,
        marginHorizontal: marginHorizontal !== undefined ? marginHorizontal : 0,
      };
    }
  };

  return <View style={[getSeparatorStyle(), style]} {...props} />;
};

export default CustomSeparator;
