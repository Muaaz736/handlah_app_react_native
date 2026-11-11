import React, { useMemo } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import {
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../../utils/colors';
import type { SocialButtonProps } from '../../types/common.types';
import { makeSocialButtonStyles } from './SocialButton.styles';
import { RoleTheme } from '../../types/roleManager.types';

const SocialButton: React.FC<SocialButtonProps> = ({
  title,
  icon,
  iconSource,
  onPress,
  loading = false,
  disabled = false,
  buttonStyle,
  textStyle,
  iconStyle,
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeSocialButtonStyles(themeColors as RoleTheme), [themeColors]);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled, buttonStyle]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color={themeColors.primary} />
      ) : (
        <>
          <View style={styles.iconContainer}>
            {icon === 'google' && iconSource && (
              <Image
                source={iconSource}
                style={[styles.icon, iconStyle]}
                resizeMode="contain"
              />
            )}
            {icon === 'apple' && (
              <FontAwesome name="apple" size={25} color={themeColors.textPrimary} />
            )}
          </View>
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default SocialButton;
