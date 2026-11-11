import React, { useState, useMemo } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { CustomInputProps } from '../../types/common.types';
import { makeCustomInputStyles } from './CustomInput.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  endIcon,
  onEndIconPress,
  password = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  placeholderTextColor = '#B8B8B8',
  editable = true,
  error,
  inputStyle,
  startIconStyle,
  labelStyle,
  containerStyle,
  inputContainerStyle,
  multiline = false,
  ...rest
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomInputStyles(themeColors as RoleTheme), [themeColors]);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const isSecure: boolean = password ? !isPasswordVisible : secureTextEntry;

  const handleEndIconPress = (): void => {
    if (password) {
      setIsPasswordVisible(!isPasswordVisible);
    } else if (onEndIconPress) {
      onEndIconPress();
    }
  };

  const renderEndIcon = (): React.ReactNode => {
    if (password) {
      return (
        <Ionicons
          name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
          size={24}
          color="#999"
        />
      );
    }
    return endIcon;
  };

  const displayEndIcon: React.ReactNode = renderEndIcon();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
          multiline && styles.inputContainerMultiline,
          inputContainerStyle,
        ]}
      >
        {icon && (
          <Image
            source={icon}
            style={[styles.icon, multiline && styles.iconMultiline, startIconStyle]}
            resizeMode="contain"
          />
        )}

        <TextInput
          style={[styles.input, !multiline && styles.inputSingleLine, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? undefined : 1}
          ellipsizeMode={multiline ? undefined : 'tail'}
          scrollEnabled
          {...rest}
        />

        {(displayEndIcon || password) && (
          <TouchableOpacity
            onPress={handleEndIconPress}
            activeOpacity={0.7}
            disabled={!password && !onEndIconPress}
            style={styles.endIconContainer}
          >
            {displayEndIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default CustomInput;
