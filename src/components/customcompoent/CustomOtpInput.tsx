import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Keyboard,
  Pressable,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  TextInputKeyPressEvent,
} from 'react-native';
import colors from '../../utils/colors';
import fonts from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { CustomOTPInputProps } from '../../types/customOtpInput.types';
import { isIOS } from '../../utils/helpers';
import { makeCustomOtpInputStyles } from './CustomOtpInput.styles';

const CustomOTPInput: React.FC<CustomOTPInputProps> = ({
  length = 7,
  onOTPComplete,
  onChangeOTP,
  defaultValue = '',
  error = '',
  autoFocus = true,
  secureTextEntry = false,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  errorTextStyle,
  label,
  required = false,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { themeColors } = useUserRole();
  const stylesObj = useMemo(() => makeCustomOtpInputStyles(themeColors), [themeColors]);

  // Prefill default value
  useEffect(() => {
    if (defaultValue && defaultValue.length === length) {
      const otpArray = defaultValue.split('');
      setOtp(otpArray);
    }
  }, [defaultValue, length]);

  // Auto-focus first input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handleChange = (value: string, index: number): void => {
    if (value.length > 1) {
      // Handle pasting multiple digits
      const otpArray = value.split('').slice(0, length);
      const newOtp = [...otp];

      // Fill in as many inputs as we can
      for (let i = 0; i < Math.min(otpArray.length, length - index); i++) {
        newOtp[index + i] = otpArray[i];
      }

      setOtp(newOtp);

      // Focus next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
      if (nextEmptyIndex !== -1 && nextEmptyIndex < length) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[length - 1]?.focus();
        Keyboard.dismiss();
      }

      // Notify about changes
      if (onChangeOTP) {
        onChangeOTP(newOtp.join(''));
      }

      // Check if completed
      if (newOtp.every(digit => digit !== '')) {
        if (onOTPComplete) {
          onOTPComplete(newOtp.join(''));
        }
      }

      return;
    }

    // Normal single digit input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Sync with parent component
    if (onChangeOTP) {
      onChangeOTP(newOtp.join(''));
    }

    // Auto-focus next box
    if (value !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (index === length - 1 && value !== '') {
      Keyboard.dismiss();
    }

    // Call onComplete when all digits are filled
    if (newOtp.every(digit => digit !== '')) {
      if (onOTPComplete) {
        onOTPComplete(newOtp.join(''));
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ): void => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
      // Move to previous input when backspace is pressed on empty input
      if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);

        if (onChangeOTP) {
          onChangeOTP(newOtp.join(''));
        }
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleInputFocus = (index: number): void => {
    setFocusedIndex(index);
  };

  const handleInputBlur = (): void => {
    setFocusedIndex(null);
  };

  const focusInput = (index: number): void => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
    }
  };

  // Get styles without the animation state that was removing the error styling
  const getInputBoxStyle = (index: number): any => {
    const stylesArr: any = [stylesObj.otpBox, inputContainerStyle];

    // Only apply error styling if error exists and is a non-empty string
    if (error && typeof error === 'string' && error.length > 0) {
      stylesArr.push(stylesObj.errorBox);
    }

    if (focusedIndex === index) {
      stylesArr.push(stylesObj.focusedBox);
      stylesArr.push({ borderColor: themeColors.primary, backgroundColor: themeColors.primary });
    }

    if (otp[index]) {
      stylesArr.push(stylesObj.filledBox);
      stylesArr.push({ backgroundColor: themeColors.primary, borderColor: themeColors.primary });
    }

    return stylesArr;
  };

  return (
    <View style={[stylesObj.mainContainer, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[stylesObj.label, error && stylesObj.errorLabel]}>
          {label}
          {required && <Text style={stylesObj.requiredStar}>*</Text>}
        </Text>
      )}

      <Pressable
        style={stylesObj.container}
        onPress={() => {
          // Find the first empty cell or focus the last one
          const emptyIndex = otp.findIndex(digit => digit === '');
          focusInput(emptyIndex !== -1 ? emptyIndex : length - 1);
        }}
      >
        {otp.map((digit, index) => (
          <View key={index} style={getInputBoxStyle(index)}>
            <TextInput
              ref={(ref: TextInput | null) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                stylesObj.otpText,
                inputStyle,
                {
                  color:
                    otp[index] || focusedIndex === index
                      ? colors.white
                      : colors.text,
                  fontFamily: fonts.display_medium,
                },
              ]}
              value={digit}
              keyboardType="number-pad"
              maxLength={secureTextEntry ? 1 : length}
              onChangeText={(value: string) => handleChange(value, index)}
              onKeyPress={(
                e: NativeSyntheticEvent<TextInputKeyPressEventData>,
              ) => handleKeyPress(e, index)}
              secureTextEntry={secureTextEntry}
              textAlign="center"
              onFocus={() => handleInputFocus(index)}
              onBlur={handleInputBlur}
              selectionColor={colors.white}
              placeholderTextColor={colors.gray}
            />
          </View>
        ))}
      </Pressable>

      {/* Error Message - only show if error is a non-empty string */}
      {error && typeof error === 'string' && error.length > 0 ? (
        <Text style={[stylesObj.errorText, errorTextStyle]}>{error}</Text>
      ) : null}
    </View>
  );
};

// Renamed from 'styles' to 'stylesObj' to avoid conflicts
export default memo(CustomOTPInput);
