import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomDropDown from './CustomDropDown';
import { useUserRole } from '../../hooks/useUserRole';
import { makeAssignmentDropdownFieldStyles } from './AssignmentDropdownField.styles';
import type { AssignmentOption, AssignmentSlotState } from '../../hooks/useAssignmentFields';
import type { RoleTheme } from '../../types/roleManager.types';
import colors from '../../utils/colors';

interface AssignmentDropdownFieldProps {
  slot: AssignmentSlotState;
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  emptyOptionLabel?: string;
  loading?: boolean;
  search?: boolean;
}

const AssignmentDropdownField: React.FC<AssignmentDropdownFieldProps> = ({
  slot,
  value,
  onSelect,
  placeholder,
  emptyOptionLabel,
  loading = false,
  search = true,
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAssignmentDropdownFieldStyles(themeColors as RoleTheme), [themeColors]);
  const options: AssignmentOption[] = emptyOptionLabel
    ? [{ label: emptyOptionLabel, value: '' }, ...slot.options]
    : slot.options;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.lockedBox}>
          <ActivityIndicator size="small" color={colors.gray} />
          <Text style={styles.lockedText}>Loading…</Text>
        </View>
      </View>
    );
  }

  if (slot.mode === 'locked') {
    return (
      <View style={styles.container}>
        <View style={styles.lockedBox}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.gray} />
          <Text style={styles.lockedText} numberOfLines={2}>
            {slot.lockedText}
          </Text>
        </View>
      </View>
    );
  }

  const handleSelect = (val: any): void => {
    const v = Array.isArray(val) ? val[0] : val;
    if (!v) {
      onSelect('');
      return;
    }
    const option = slot.options.find(o => o.value === v);
    if (option?.disabled) return; // ignore taps on read-only options
    onSelect(v);
  };

  const renderItem = (item: AssignmentOption): React.ReactElement => {
    const row = (
      <View style={[styles.item, item.disabled && styles.itemDisabled]}>
        <Text style={styles.itemText} numberOfLines={1}>
          {item.label}
        </Text>
        {item.disabled && (
          <View style={styles.readOnlyBadge}>
            <Text style={styles.readOnlyBadgeText}>Read only</Text>
          </View>
        )}
      </View>
    );

    if (!item.disabled) return row;

    return (
      <TouchableWithoutFeedback onPress={() => {}}>
        {row}
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={styles.container}>
      <View pointerEvents={slot.disabled ? 'none' : 'auto'} style={slot.disabled ? styles.disabledOverlay : undefined}>
        <CustomDropDown
          options={options}
          value={value}
          onSelect={handleSelect}
          renderItem={renderItem as any}
          placeholder={placeholder}
          leftIcon
          search={search}
        />
      </View>
    </View>
  );
};

export default AssignmentDropdownField;
