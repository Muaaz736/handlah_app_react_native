import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import colors, { getColorWithOpacity } from '../../utils/colors';
import FONTS from '../../utils/fonts';
import CustomInput from './CustomInput';
import { useUserRole } from '../../hooks/useUserRole';
import { makeCustomReminderPickerStyles } from './CustomReminderPicker.styles';
import { RoleTheme } from '../../types/roleManager.types';

interface ReminderOption {
  label: string;
  value: string;
}

interface CustomReminderPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  modalTitle?: string;
  modalPlaceholder?: string;
}

const CustomReminderPicker: React.FC<CustomReminderPickerProps> = ({
  value,
  onChange,
  label,
  modalTitle = 'Enter Number of Days',
  modalPlaceholder = 'Enter days (e.g., 0 for day-of)',
}) => {
  const [showCustomDayInput, setShowCustomDayInput] = useState(false);
  const [customDayValue, setCustomDayValue] = useState('');
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomReminderPickerStyles(themeColors as RoleTheme), [themeColors]);

  const reminderOptions: ReminderOption[] = [
    { label: '90d', value: '90' },
    { label: '60d', value: '60' },
    { label: '30d', value: '30' },
    { label: '14d', value: '14' },
    { label: '7d', value: '7' },
    { label: 'Custom Number', value: 'custom' },
  ];

  const handleReminderOptionPress = (optionValue: string) => {
    if (optionValue === 'custom') {
      setShowCustomDayInput(true);
      // Remove 'd' suffix if present to get the numeric value
      const numericValue = value.replace(/d$/i, '');
      const isStandardValue = ['90', '60', '30', '14', '7'].includes(numericValue);
      setCustomDayValue(isStandardValue ? '0' : numericValue);
    } else {
      onChange(optionValue);
    }
  };

  const handleCustomDaySubmit = () => {
    const numericValue = parseInt(customDayValue, 10);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(customDayValue);
      setShowCustomDayInput(false);
    }
  };

  const getDisplayLabel = (val: string) => {
    // Remove 'd' suffix if present to avoid double 'd'
    const numericValue = val.replace(/d$/i, '');
    const option = reminderOptions.find(opt => opt.value === numericValue);
    if (option) return option.label;
    return `${numericValue}d`;
  };

  return (
    <View style={styles.reminderSection}>
      {label && <Text style={styles.reminderLabel}>{label}</Text>}
      <View style={styles.reminderOptions}>
        {reminderOptions.map(option => {
          // Normalize value by removing 'd' suffix for comparison
          const normalizedValue = value.replace(/d$/i, '');
          const isActiveOption =
            option.value === 'custom'
              ? !['90', '60', '30', '14', '7'].includes(normalizedValue)
              : normalizedValue === option.value;

          const gradientColors = isActiveOption
            ? themeColors?.isDark ? [
              getColorWithOpacity(themeColors.primary, 0.5),
              getColorWithOpacity(themeColors.primary, 0.9),
              themeColors.primary,
            ] : [
              getColorWithOpacity(themeColors.primary, 0.2),
              getColorWithOpacity(themeColors.primary, 0.8),
              themeColors.primary,
            ]
            : ['transparent', 'transparent'];

          return (
            <LinearGradient
              key={option.value}
              colors={gradientColors}
              start={{ x: 1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <TouchableOpacity
                style={[
                  styles.reminderButton,
                  isActiveOption && styles.reminderButtonActive,
                ]}
                onPress={() => handleReminderOptionPress(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.reminderButtonText,
                    isActiveOption && styles.reminderButtonTextActive,
                  ]}
                >
                  {isActiveOption && option.value === 'custom'
                    ? getDisplayLabel(value)
                    : option.label}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          );
        })}
      </View>

      {/* Custom Day Input Modal */}
      <Modal
        visible={showCustomDayInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomDayInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <CustomInput
              placeholder={modalPlaceholder}
              value={customDayValue}
              onChangeText={setCustomDayValue}
              keyboardType="number-pad"
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowCustomDayInput(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton, { backgroundColor: themeColors.primary }]}
                onPress={handleCustomDaySubmit}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomReminderPicker;
