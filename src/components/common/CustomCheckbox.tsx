import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useUserRole } from '../../hooks/useUserRole';
import type { CustomCheckboxProps } from '../../types/common.types';
import { makeCustomCheckboxStyles } from './CustomCheckbox.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ 
  checked, 
  onPress, 
  label, 
  labelParts,
  labelStyle,
  labelContainerStyle,
  linkStyle,
  activeBgColorStyle
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomCheckboxStyles(themeColors as RoleTheme), [themeColors]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && [styles.checkboxChecked, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }, activeBgColorStyle]]}>
        {checked && <View style={styles.checkmark} />}
      </View>

      <View style={[styles.labelContainer, labelContainerStyle]}>
        {labelParts ? (
          <Text style={[styles.label, labelStyle]}>
            {labelParts.map((part, index) =>
              part.link ? (
                <Text 
                  key={index} 
                  style={[
                    styles.link, 
                    { color: themeColors.secondary },
                    linkStyle,
                    part.style
                  ]} 
                  onPress={part.onPress}
                >
                  {part.text}
                </Text>
              ) : (
                <Text 
                  key={index}
                  style={part.style}
                >
                  {part.text}
                </Text>
              ),
            )}
          </Text>
        ) : (
          <View style={styles.labelFallbackContainer}>
            <Text style={[styles.label, labelStyle]}>{label}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomCheckbox;
