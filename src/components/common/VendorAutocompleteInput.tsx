import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import CustomInput from './CustomInput';
import type { CustomInputProps } from '../../types/common.types';
import { useUserRole } from '../../hooks/useUserRole';
import { makeVendorAutocompleteInputStyles } from './VendorAutocompleteInput.styles';
import {
  getVendorSuggestions,
  saveVendorSuggestion,
  removeVendorSuggestion,
  VendorSuggestionCategory,
} from '../../utils/vendorSuggestions';
import { RoleTheme } from '../../types/roleManager.types';

const MIN_QUERY_LENGTH = 2;

interface VendorAutocompleteInputProps extends CustomInputProps {
  category: VendorSuggestionCategory;
  maxSuggestionsShown?: number;
}

const VendorAutocompleteInput: React.FC<VendorAutocompleteInputProps> = ({
  category,
  maxSuggestionsShown = 6,
  onFocus,
  onBlur,
  value,
  onChangeText,
  ...rest
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(
    () => makeVendorAutocompleteInputStyles(themeColors as RoleTheme),
    [themeColors],
  );

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getVendorSuggestions(category).then(setSuggestions);
  }, [category]);

  useEffect(() => {
    return () => {
      if (blurTimeout.current) clearTimeout(blurTimeout.current);
    };
  }, []);

  const query = (value || '').trim().toLowerCase();

  const filteredSuggestions = useMemo(() => {
    if (query.length < MIN_QUERY_LENGTH) return [];
    return suggestions
      .filter(item => item.toLowerCase().startsWith(query))
      .slice(0, maxSuggestionsShown);
  }, [suggestions, query, maxSuggestionsShown]);

  const showDropdown = isFocused && filteredSuggestions.length > 0;

  const handleFocus = (e: any): void => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any): void => {
    blurTimeout.current = setTimeout(() => setIsFocused(false), 200);
    if (value && value.trim()) {
      saveVendorSuggestion(category, value);
    }
    onBlur?.(e);
  };

  const handleSelect = (item: string): void => {
    onChangeText(item);
    saveVendorSuggestion(category, item);
    setIsFocused(false);
  };

  const handleRemoveSuggestion = (item: string): void => {
    setSuggestions(prev => prev.filter(s => s !== item));
    removeVendorSuggestion(category, item);
  };

  const handleChangeText = (text: string): void => {
    setIsFocused(true);
    onChangeText(text);
  };

  return (
    <View style={styles.wrapper}>
      <CustomInput
        {...rest}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {showDropdown && filteredSuggestions.length > 0 && (
        <View style={styles.dropdownList}>
          <ScrollView
            style={styles.dropdownScroll}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={filteredSuggestions.length > 5}
          >
            {filteredSuggestions.map(item => (
              <View key={item} style={styles.dropdownItem}>
                <TouchableOpacity
                  style={styles.dropdownItemTextWrapper}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownItemText} numberOfLines={1}>
                    {item}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItemRemoveBtn}
                  onPress={() => handleRemoveSuggestion(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={16} color={themeColors.textSecondary || themeColors.secondary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default VendorAutocompleteInput;
