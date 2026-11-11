import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ICONS } from '../../utils/Images';
import type { AuthHeaderProps } from '../../types/common.types';
import { makeAuthHeaderStyles } from './AuthHeader.styles';
import { useUserRole } from '../../hooks/useUserRole';
import { RoleTheme } from '../../types/roleManager.types';

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  showBackButton = true,
  containerStyle,
  titleStyle,
  subtitleStyle,
  backButtonStyle,
  backButtonIconStyle,
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAuthHeaderStyles(themeColors as RoleTheme), [themeColors]);
  return (
    <View style={[styles.container, containerStyle]}>
      {showBackButton && (
        <TouchableOpacity
          style={[styles.backButton, backButtonStyle]}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Image
            source={ICONS.BACK_ICON}
            style={[styles.backButtonIcon, backButtonIconStyle]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      <View style={styles.textContainer}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};

export default AuthHeader;
