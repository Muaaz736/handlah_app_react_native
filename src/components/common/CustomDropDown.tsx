import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FONTS from '../../utils/fonts';
import colors, { getColorWithOpacity } from '../../utils/colors';
import { useUserRole } from '../../hooks/useUserRole';
import type {
  CustomDropDownProps,
  DropdownOption,
} from '../../types/common.types';
import { makeCustomDropDownStyles, makeCustomDropDownChipStyles } from './CustomDropDown.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CustomDropDown: React.FC<CustomDropDownProps> = ({
  options,
  onSelect,
  value,
  leftIcon,
  placeholder = 'Search...',
  searchPlaceholder = 'Search...',
  style,
  placeholderStyle,
  selectedTextStyle,
  selectedTextProps,
  inputSearchStyle,
  containerStyle,
  showArrow = true,
  handleFocus,
  handleBlur,
  error = false,
  search = true,
  maxHeight = 200,
  renderItem,
  allowAddNew = false,
  onAddNew,
  addNewText = 'Add',
  multiSelect = false,
  selectedItems = [],
  dropdownPosition = 'auto',
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomDropDownStyles(themeColors as RoleTheme), [themeColors]);
  const chipStyles = useMemo(() => makeCustomDropDownChipStyles(themeColors as RoleTheme), [themeColors]);

  // Grouped options (single select): headings above each group, and search matches the option or its group.
  const isGrouped = !multiSelect && options.some(opt => !!opt.group);
  const groupedOptions = useMemo(() => {
    if (!isGrouped) return options;
    const q = searchQuery.trim().toLowerCase();
    const result: DropdownOption[] = [];
    let current: string | undefined;
    for (const opt of options) {
      if (q && !opt.label.toLowerCase().includes(q) && !(opt.group ?? '').toLowerCase().includes(q)) continue;
      if (opt.group && opt.group !== current) {
        current = opt.group;
        result.push({ label: opt.group, value: `__group__${opt.group}`, isHeader: true });
      }
      result.push(opt as DropdownOption);
    }
    return result;
  }, [isGrouped, options, searchQuery]);

  const modifiedOptions = useMemo(() => {
    if (isGrouped) {
      return groupedOptions;
    }
    if (!allowAddNew || !searchQuery.trim()) {
      return options;
    }

    const searchLower = searchQuery.toLowerCase().trim();
    const hasMatch = options.some(
      opt => opt.label.toLowerCase() === searchLower,
    );

    if (!hasMatch) {
      return [
        {
          label: `${addNewText} "${searchQuery}"`,
          value: `__new__${searchQuery}`,
          isNew: true,
          originalText: searchQuery,
        },
        ...options,
      ];
    }

    return options;
  }, [options, searchQuery, allowAddNew, addNewText, isGrouped, groupedOptions]);

  const handleChange = (item: DropdownOption): void => {
    if (item.isHeader) {
      return;
    }
    if (item.isNew && onAddNew) {
      onAddNew(item.originalText || '');
      setSearchQuery('');
    } else {
      onSelect(item.value);
    }
  };

  const defaultRenderItem = (item: DropdownOption, selected?: boolean) => {
    if (item.isHeader) {
      return (
        <View style={[styles.item, { backgroundColor: getColorWithOpacity(themeColors.surface, 0.6), paddingVertical: 8 }]}>
          <Text style={[styles.textItem, { fontFamily: FONTS.display_semi_bold, fontSize: 12, color: themeColors.textSecondary }]}>
            {item.label.toUpperCase()}
          </Text>
        </View>
      );
    }
    const isSelected = selected || (multiSelect && selectedItems.includes(item.value));

    return (
      <View
        style={[
          styles.item,
          item.isNew && styles.addNewItem,
          item.isNew && {
            backgroundColor: getColorWithOpacity(themeColors.surface, 0.5),
          },
          isSelected && {
            backgroundColor: getColorWithOpacity(themeColors.surface, 0.9),
          },
        ]}
      >
        <Text
          style={[
            styles.textItem,
            item.isNew && styles.addNewText,
            item.isNew && { color: themeColors.primary },
            isSelected && { color: themeColors.primary },
          ]}
        >
          {item.label}
        </Text>

        {item.isNew && (
          <FontAwesome6 name="plus" size={16} color={themeColors.primary} />
        )}

        {multiSelect && isSelected && (
          <FontAwesome6 name="check" size={16} color={themeColors.primary} />
        )}
      </View>
    );
  };

  const renderLeftIconComponent = (): React.ReactElement | null => {
    if (leftIcon) return null;
    // if (leftIcon === false) {
    //   return (
    //     <FontAwesome6
    //       style={styles.icon}
    //       color="black"
    //       name="location-dot"
    //       size={20}
    //     />
    //   );
    // }
    return leftIcon as any;
  };

  // Create properly typed render function
  const renderItemWrapper = (item: any, selected?: boolean) => {
    if (renderItem && !item?.isHeader) {
      const result = renderItem(item);
      // Ensure we return a valid React element or null
      return result as React.ReactElement | null;
    }
    return defaultRenderItem(item, selected);
  };

  if (multiSelect) {
    const renderSelectedItem = (
      item: DropdownOption,
      unSelect: (item: DropdownOption) => void,
    ) => (
      <TouchableOpacity
        key={item.value}
        onPress={() => unSelect(item)}
        style={[chipStyles.chip, { backgroundColor: themeColors.primary }]}
        activeOpacity={0.7}
      >
        <Text style={chipStyles.chipLabel} numberOfLines={1}>
          {item.label}
        </Text>
        <FontAwesome6
          name="xmark"
          size={14}
          style={{
            backgroundColor: colors.white,
            padding: 3,
            paddingHorizontal: 6,
            borderRadius: 10,
          }}
          color={colors.black}
        />
      </TouchableOpacity>
    );

    return (
      <MultiSelect
        style={[
          styles.dropdown,
          { borderColor: error ? themeColors.error : themeColors.border },
          style,
        ]}
        activeColor="transparent"
        renderItem={renderItemWrapper}
        placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
        selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle]}
        inputSearchStyle={[styles.inputSearchStyle, inputSearchStyle]}
        containerStyle={[styles.dropdownContainer, containerStyle]}
        iconStyle={styles.iconStyle}
        data={modifiedOptions}
        search={search}
        maxHeight={maxHeight}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        value={selectedItems}
        onChange={(items: string[]) => {
          const newItem = items.find(val => val.startsWith('__new__'));
          if (newItem && onAddNew) {
            const originalText = newItem.replace('__new__', '');
            onAddNew(originalText);
            setSearchQuery('');
          } else {
            onSelect(items);
          }
        }}
        onChangeText={setSearchQuery}
        onFocus={handleFocus}
        onBlur={handleBlur}
        // autoScroll={false}
        dropdownPosition="auto"
        mode="default"
        flatListProps={{
          nestedScrollEnabled: true,
          keyboardShouldPersistTaps: 'handled',
        }}
        renderLeftIcon={() => renderLeftIconComponent()}
        renderSelectedItem={renderSelectedItem as any}
      />
    );
  }

  return (
    <Dropdown
      style={[
        styles.dropdown,
        { borderColor: error ? themeColors.error : themeColors.border },
        style,
      ]}
      activeColor="transparent"
      renderItem={renderItemWrapper}
      placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
      selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle]}
      selectedTextProps={selectedTextProps || { numberOfLines: 1 }}
      inputSearchStyle={[styles.inputSearchStyle, inputSearchStyle]}
      containerStyle={[styles.dropdownContainer, containerStyle]}
      iconStyle={styles.iconStyle}
      data={modifiedOptions}
      search={search}
      maxHeight={maxHeight}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      value={value}
      onChange={handleChange}
      onChangeText={setSearchQuery}
      {...(isGrouped ? { searchQuery: () => true } : {})}
      onFocus={handleFocus}
      onBlur={handleBlur}
      autoScroll={false}
      dropdownPosition={dropdownPosition}
      mode="default"
      flatListProps={{
        nestedScrollEnabled: true,
        keyboardShouldPersistTaps: 'handled',
      }}
      renderLeftIcon={() => renderLeftIconComponent()}
    />
  );
};

export default CustomDropDown;
