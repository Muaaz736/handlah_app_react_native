import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';
import colors from '../../utils/colors';
import { useUserRole } from '../../hooks/useUserRole';
import type { PrimaryButtonProps } from '../../types/common.types';
import { makePrimaryButtonStyles } from './PrimaryButton.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { darkenColor } from '../../utils/roleManager';

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  buttonStyle,
  textStyle,
  ...rest
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makePrimaryButtonStyles(themeColors as RoleTheme), [themeColors]);

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          ...styles.secondaryButton,
          backgroundColor: themeColors.secondary,
        };
      case 'outline':
        return { ...styles.outlineButton, borderColor: themeColors.primary };
      case 'transparent':
        return styles.transparentButton;
      default:
        return {
          ...styles.primaryButton,
          backgroundColor: themeColors.primary,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return { ...styles.outlineText, color: themeColors.primary };
      case 'transparent':
        return styles.transparentText;
      default:
        return { ...styles.buttonText, color: themeColors.text };
    }
  };

  const isDisabled: boolean = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        isDisabled && styles.buttonDisabled,
        buttonStyle,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? themeColors.primary : colors.white}
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
