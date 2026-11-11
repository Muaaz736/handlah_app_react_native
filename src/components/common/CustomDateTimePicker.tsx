import React, { useState, useRef, forwardRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { getColorWithOpacity } from '../../utils/colors';
import { useUserRole } from '../../hooks/useUserRole';
import type { CustomDateTimePickerProps, CustomDateTimePickerRef } from '../../types/common.types';
import { makeCustomDateTimePickerStyles } from './CustomDateTimePicker.styles';
import { RoleTheme } from '../../types/roleManager.types';

interface PickerItem {
  value: number | string;
  label: string;
}

const parseDateValue = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      // Bare calendar date (no time component) — parse as local midnight.
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const parsedDate = new Date(`${value}T00:00:00`);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
      }

      const parsedDate = new Date(value);
      if (isNaN(parsedDate.getTime())) {
        return null;
      }

      const isUtcMidnight =
        parsedDate.getUTCHours() === 0 &&
        parsedDate.getUTCMinutes() === 0 &&
        parsedDate.getUTCSeconds() === 0 &&
        parsedDate.getUTCMilliseconds() === 0;

      if (isUtcMidnight) {
        return new Date(
          parsedDate.getUTCFullYear(),
          parsedDate.getUTCMonth(),
          parsedDate.getUTCDate(),
        );
      }

      return parsedDate;
    } catch (err) {
      console.warn('Error parsing date string:', err);
    }
  }

  return null;
};

// Helper function to format date based on custom format string
const formatDateWithCustomFormat = (date: Date, format: string): string => {
  if (!date || !format) return '';

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  const patterns: Record<string, string> = {
    YYYY: year.toString(),
    YY: year.toString().slice(-2),
    MM: month.toString().padStart(2, '0'),
    M: month.toString(),
    DD: day.toString().padStart(2, '0'),
    D: day.toString(),
    HH: hours24.toString().padStart(2, '0'),
    H: hours24.toString(),
    hh: hours12.toString().padStart(2, '0'),
    h: hours12.toString(),
    mm: minutes.toString().padStart(2, '0'),
    m: minutes.toString(),
    ss: seconds.toString().padStart(2, '0'),
    s: seconds.toString(),
    A: ampm,
    a: ampm.toLowerCase(),
  };

  let formattedDate = format;
  Object.keys(patterns).forEach(pattern => {
    const regex = new RegExp(pattern, 'g');
    formattedDate = formattedDate.replace(regex, patterns[pattern]);
  });

  return formattedDate;
};

// Helper function to determine picker column order from displayFormat
const getPickerColumnOrder = (displayFormat: string | undefined, mode: string): string[] => {
  if (!displayFormat) {
    if (mode === 'date' || mode === 'datetime') {
      return ['month', 'day', 'year'];
    }
    return [];
  }

  const components: Array<{ type: string; index: number }> = [];

  const dayIndex = displayFormat.search(/D+/);
  const monthIndex = displayFormat.search(/M+/);
  const yearIndex = displayFormat.search(/Y+/);

  if (dayIndex !== -1) components.push({ type: 'day', index: dayIndex });
  if (monthIndex !== -1) components.push({ type: 'month', index: monthIndex });
  if (yearIndex !== -1) components.push({ type: 'year', index: yearIndex });

  components.sort((a, b) => a.index - b.index);

  return components.map(c => c.type);
};

// Helper functions for date/time generation
const generateHours = (is24Hour: boolean = false): PickerItem[] => {
  if (is24Hour) {
    return Array.from({ length: 24 }, (_, i) => ({
      value: i,
      label: String(i).padStart(2, '0'),
    }));
  }
  return Array.from({ length: 12 }, (_, i) => ({
    value: i === 0 ? 12 : i,
    label: String(i === 0 ? 12 : i).padStart(2, '0'),
  }));
};

const generateMinutes = (): PickerItem[] => {
  return Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
  }));
};

const generateDays = (year: number, month: number): PickerItem[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: String(i + 1).padStart(2, '0'),
  }));
};

const generateMonths = (): PickerItem[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: String(i + 1).padStart(2, '0'),
  }));
};

const generateYears = (startYear: number = 1950, endYear: number = 2050): PickerItem[] => {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
    value: startYear + i,
    label: String(startYear + i),
  }));
};

const PERIODS: PickerItem[] = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
];

const CustomDateTimePicker = forwardRef<CustomDateTimePickerRef, CustomDateTimePickerProps>(
  (
    {
      placeholder = 'Select date',
      value = null,
      onChange,
      error,
      label,
      required = false,
      prefixIcon,
      suffixIcon,
      containerStyle,
      inputContainerStyle,
      textStyle,
      mode = 'date',
      minimumDate,
      maximumDate,
      is24Hour = false,
      disabled = false,
      confirmText = 'OK',
      cancelText = 'Cancel',
      returnISO = false,
      labelStyle,
      displayFormat,
      clearable = true,
      ...restProps
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeCustomDateTimePickerStyles(themeColors as RoleTheme), [themeColors]);

    const initialDate = parseDateValue(value) || new Date();
    const [selectedDate, setSelectedDate] = useState<Date | null>(parseDateValue(value));

    const [tempYear, setTempYear] = useState<number>(initialDate.getFullYear());
    const [tempMonth, setTempMonth] = useState<number>(initialDate.getMonth());
    const [tempDay, setTempDay] = useState<number>(initialDate.getDate());
    const [tempHour, setTempHour] = useState<number>(initialDate.getHours());
    const [tempMinute, setTempMinute] = useState<number>(initialDate.getMinutes());
    const [tempPeriod, setTempPeriod] = useState<string>(
      initialDate.getHours() >= 12 ? 'PM' : 'AM',
    );

    const hours = generateHours(is24Hour);
    const minutes = generateMinutes();
    const days = generateDays(tempYear, tempMonth);
    const months = generateMonths();
    const years = generateYears(1950, 2050);

    const yearRef = useRef<any>(null);
    const monthRef = useRef<any>(null);
    const dayRef = useRef<any>(null);
    const hourRef = useRef<any>(null);
    const minuteRef = useRef<any>(null);
    const periodRef = useRef<any>(null);

    const dateColumnOrder = getPickerColumnOrder(displayFormat, mode);

    useEffect(() => {
      const parsedDate = parseDateValue(value);

      if (parsedDate) {
        setSelectedDate(parsedDate);
        setTempYear(parsedDate.getFullYear());
        setTempMonth(parsedDate.getMonth());
        setTempDay(parsedDate.getDate());
        setTempHour(parsedDate.getHours());
        setTempMinute(parsedDate.getMinutes());
        setTempPeriod(parsedDate.getHours() >= 12 ? 'PM' : 'AM');
      } else {
        setSelectedDate(null);
      }
    }, [value]);

    const handleOpenPicker = (): void => {
      if (disabled) return;

      if (selectedDate) {
        setTempYear(selectedDate.getFullYear());
        setTempMonth(selectedDate.getMonth());
        setTempDay(selectedDate.getDate());
        setTempHour(selectedDate.getHours());
        setTempMinute(selectedDate.getMinutes());
        setTempPeriod(selectedDate.getHours() >= 12 ? 'PM' : 'AM');
      } else {
        const now = new Date();
        setTempYear(now.getFullYear());
        setTempMonth(now.getMonth());
        setTempDay(now.getDate());
        setTempHour(now.getHours());
        setTempMinute(now.getMinutes());
        setTempPeriod(now.getHours() >= 12 ? 'PM' : 'AM');
      }

      setIsOpen(true);
      setIsFocused(true);

      setTimeout(() => {
        scrollToSelectedValues();
      }, 100);
    };

    const scrollToSelectedValues = (): void => {
      const yearIndex = years.findIndex(y => y.value === tempYear);
      const monthIndex = months.findIndex(m => m.value === tempMonth);
      const dayIndex = days.findIndex(d => d.value === tempDay);

      let hourIndex: number;
      if (is24Hour) {
        hourIndex = hours.findIndex(h => h.value === tempHour);
      } else {
        const hour12 = tempHour % 12 === 0 ? 12 : tempHour % 12;
        hourIndex = hours.findIndex(h => h.value === hour12);
      }

      const minuteIndex = minutes.findIndex(m => m.value === tempMinute);
      const periodIndex = PERIODS.findIndex(p => p.value === tempPeriod);

      try {
        if (mode === 'date' || mode === 'datetime') {
          if (yearRef.current)
            yearRef.current.scrollToIndex({
              index: Math.max(0, yearIndex),
              animated: false,
            });
          if (monthRef.current)
            monthRef.current.scrollToIndex({
              index: Math.max(0, monthIndex),
              animated: false,
            });
          if (dayRef.current)
            dayRef.current.scrollToIndex({
              index: Math.max(0, dayIndex),
              animated: false,
            });
        }

        if (mode === 'time' || mode === 'datetime') {
          if (hourRef.current)
            hourRef.current.scrollToIndex({
              index: Math.max(0, hourIndex),
              animated: false,
            });
          if (minuteRef.current)
            minuteRef.current.scrollToIndex({
              index: Math.max(0, minuteIndex),
              animated: false,
            });
          if (!is24Hour && periodRef.current) {
            periodRef.current.scrollToIndex({
              index: Math.max(0, periodIndex),
              animated: false,
            });
          }
        }
      } catch (error) {
        console.warn('Error scrolling picker to values:', error);
      }
    };

    const handleCancel = (): void => {
      setIsOpen(false);
      setIsFocused(false);
    };

    const handleClear = (): void => {
      setSelectedDate(null);
      if (onChange) {
        onChange(null);
      }
    };

    const handleConfirm = (): void => {
      const newDate = new Date();

      if (mode === 'date' || mode === 'datetime') {
        newDate.setFullYear(tempYear);
        newDate.setMonth(tempMonth);
        newDate.setDate(tempDay);
      }

      if (mode === 'date') {
        newDate.setHours(12, 0, 0, 0);
      }

      if (mode === 'time' || mode === 'datetime') {
        let hour = tempHour;

        if (!is24Hour) {
          if (tempPeriod === 'PM') {
            hour = tempHour === 12 ? 12 : tempHour + 12;
          } else {
            hour = tempHour === 12 ? 0 : tempHour;
          }
        }

        newDate.setHours(hour);
        newDate.setMinutes(tempMinute);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
      }

      setSelectedDate(newDate);
      setIsOpen(false);
      setIsFocused(false);

      if (onChange) {
        if (returnISO) {
          onChange(newDate.toISOString());
        } else {
          onChange(newDate);
        }
      }
    };

    const getFormattedDate = (): string => {
      if (!selectedDate) return '';

      try {
        if (displayFormat) {
          return formatDateWithCustomFormat(selectedDate, displayFormat);
        }

        const day = selectedDate.getDate().toString().padStart(2, '0');
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = selectedDate.getFullYear();
        const hours = selectedDate.getHours();
        const minutes = selectedDate.getMinutes();

        switch (mode) {
          case 'time':
            const timeHours = is24Hour
              ? hours.toString().padStart(2, '0')
              : (hours % 12 || 12).toString().padStart(2, '0');
            const timeMinutes = minutes.toString().padStart(2, '0');
            const period = is24Hour ? '' : hours >= 12 ? ' PM' : ' AM';
            return `${timeHours}:${timeMinutes}${period}`;

          case 'datetime':
            const dtHours = is24Hour
              ? hours.toString().padStart(2, '0')
              : (hours % 12 || 12).toString().padStart(2, '0');
            const dtMinutes = minutes.toString().padStart(2, '0');
            const dtPeriod = is24Hour ? '' : hours >= 12 ? ' PM' : ' AM';
            return `${month}/${day}/${year} ${dtHours}:${dtMinutes}${dtPeriod}`;

          case 'date':
          default:
            return `${month}/${day}/${year}`;
        }
      } catch (err) {
        console.error('Error formatting date:', err);
        return selectedDate.toString();
      }
    };

    const getDisplayText = (): string => {
      if (selectedDate) {
        return getFormattedDate();
      }
      return placeholder;
    };

    const showError = error;

    React.useImperativeHandle(ref, () => ({
      getDate: () => selectedDate,
      getISOString: () => (selectedDate ? selectedDate.toISOString() : null),
      getFormattedDate: (format?: string) => {
        if (!selectedDate) return null;
        return format
          ? formatDateWithCustomFormat(selectedDate, format)
          : getFormattedDate();
      },
      setDate: (date: Date | string) => {
        const parsedDate = parseDateValue(date);
        setSelectedDate(parsedDate);
      },
      clearDate: () => {
        setSelectedDate(null);
      },
      openPicker: () => {
        handleOpenPicker();
      },
    }));

    const renderPickerItem = ({ 
      item, 
      isSelected, 
      columnType 
    }: { 
      item: PickerItem; 
      isSelected: boolean; 
      columnType: string;
    }) => (
      <TouchableOpacity
        style={[styles.pickerItem, isSelected && styles.selectedPickerItem]}
        onPress={() => {
          switch (columnType) {
            case 'year':
              setTempYear(item.value as number);
              break;
            case 'month':
              setTempMonth(item.value as number);
              break;
            case 'day':
              setTempDay(item.value as number);
              break;
            case 'hour':
              setTempHour(item.value as number);
              break;
            case 'minute':
              setTempMinute(item.value as number);
              break;
            case 'period':
              setTempPeriod(item.value as string);
              break;
          }
        }}
      >
        <Text
          style={[
            styles.pickerItemText,
            isSelected && {
              ...styles.selectedPickerItemText,
              color: themeColors.primary,
            },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );

    const renderPickerColumn = (
      data: PickerItem[], 
      columnType: string, 
      columnRef: React.RefObject<FlatList>
    ) => {
      let selectedValue: number | string;
      switch (columnType) {
        case 'year':
          selectedValue = tempYear;
          break;
        case 'month':
          selectedValue = tempMonth;
          break;
        case 'day':
          selectedValue = tempDay;
          break;
        case 'hour':
          selectedValue = is24Hour
            ? tempHour
            : tempHour % 12 === 0
            ? 12
            : tempHour % 12;
          break;
        case 'minute':
          selectedValue = tempMinute;
          break;
        case 'period':
          selectedValue = tempPeriod;
          break;
        default:
          selectedValue = 0;
      }

      return (
        <View style={styles.pickerColumn}>
          <FlatList
            ref={columnRef}
            data={data}
            renderItem={({ item }) =>
              renderPickerItem({
                item,
                isSelected: item.value === selectedValue,
                columnType,
              })
            }
            keyExtractor={(item, index) =>
              `${columnType}-${item.value}-${index}`
            }
            showsVerticalScrollIndicator={false}
            snapToInterval={40}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: 40,
              offset: 40 * index,
              index,
            })}
            contentContainerStyle={styles.pickerListContent}
            onMomentumScrollEnd={event => {
              const y = event.nativeEvent.contentOffset.y;
              const index = Math.round(y / 40);
              if (index >= 0 && index < data.length) {
                switch (columnType) {
                  case 'year':
                    setTempYear(data[index].value as number);
                    break;
                  case 'month':
                    setTempMonth(data[index].value as number);
                    break;
                  case 'day':
                    setTempDay(data[index].value as number);
                    break;
                  case 'hour':
                    setTempHour(data[index].value as number);
                    break;
                  case 'minute':
                    setTempMinute(data[index].value as number);
                    break;
                  case 'period':
                    setTempPeriod(data[index].value as string);
                    break;
                }
              }
            }}
            initialNumToRender={20}
            windowSize={5}
          />
        </View>
      );
    };

    const renderDateColumns = () => {
      const columnsMap: any = {
        day: renderPickerColumn(days, 'day', dayRef),
        month: renderPickerColumn(months, 'month', monthRef),
        year: renderPickerColumn(years, 'year', yearRef),
      };

      if (dateColumnOrder.length > 0) {
        return dateColumnOrder.map(columnType => columnsMap[columnType]);
      }

      return [columnsMap.day, columnsMap.month, columnsMap.year];
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text
            style={[
              styles.label,
              showError && styles.errorLabel,
              isFocused && styles.focusedLabel,
              isFocused && { color: themeColors.secondary },
              // selectedDate && styles.activeLabel,
              labelStyle,
            ]}
          >
            {label}
            {required && <Text style={styles.requiredStar}>*</Text>}
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.inputContainer,
            showError && styles.errorContainer,
            isFocused && styles.focusedContainer,
            disabled && styles.disabledContainer,
            inputContainerStyle,
          ]}
          onPress={handleOpenPicker}
          activeOpacity={0.7}
          disabled={disabled}
        >
          {prefixIcon && (
            <View style={styles.prefixIconContainer}>{prefixIcon}</View>
          )}

          <Text
            style={[
              styles.displayText,
              !selectedDate && styles.placeholderText,
              disabled && styles.disabledText,
              prefixIcon ? styles.textWithPrefixIcon : null,
              textStyle,
            ]}
          >
            {getDisplayText()}
          </Text>

          {clearable && selectedDate && !disabled && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}

          <View style={styles.suffixIconContainer}>{suffixIcon}</View>
        </TouchableOpacity>

        <Modal
          transparent={true}
          animationType="fade"
          visible={isOpen}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalContainer}>
            <View style={styles.centeredPickerContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancel}
              >
                <Text
                  style={[
                    styles.closeButtonText,
                    { color: themeColors.primary },
                  ]}
                >
                  ✕
                </Text>
              </TouchableOpacity>

              <View style={styles.pickerWrapper}>
                <View
                  style={[
                    styles.selectionHighlight,
                    {
                      backgroundColor: getColorWithOpacity(
                        themeColors.primary,
                        0.2,
                      ),
                    },
                  ]}
                />

                <View style={styles.pickerColumnsContainer}>
                  {(mode === 'date' || mode === 'datetime') &&
                    renderDateColumns()}

                  {(mode === 'time' || mode === 'datetime') && (
                    <>
                      {renderPickerColumn(hours, 'hour', hourRef)}
                      {renderPickerColumn(minutes, 'minute', minuteRef)}
                      {!is24Hour &&
                        renderPickerColumn(PERIODS, 'period', periodRef)}
                    </>
                  )}
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { borderColor: themeColors.primary },
                  ]}
                  onPress={handleCancel}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      { color: themeColors.primary },
                    ]}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: themeColors.primary }]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {showError && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  },
);

export default CustomDateTimePicker;
