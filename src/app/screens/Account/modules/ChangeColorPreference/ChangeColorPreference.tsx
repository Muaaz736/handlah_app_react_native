import { Text, View, TouchableOpacity, Switch } from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import {
  AuthHeader,
  PrimaryButton,
  CustomTabs,
} from '../../../../../components/common';
import { useNavigation } from '@react-navigation/native';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';
import { USER_ACCOUNT_TYPES } from '../../../../../utils/staticData';
import colors from '../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { ROLE_THEMES } from '../../../../../utils/roleManager';
import { generateThemeFromColor } from '../../../../../utils/roleManager';
import {
  ChangeColorPreferenceNavigationProp,
  ColorSelection,
} from './ChangeColorPreference.types';
import { makeChangeColorPreferenceStyles } from './ChangeColorPreference.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';

const parseHexChannel = (hex: string, start: number, end: number): number => {
  if (!hex || hex.length < 7 || hex[0] !== '#') return 0;
  const value = parseInt(hex.slice(start, end), 16);
  return isNaN(value) ? 0 : value;
};

const getColorLightness = (hex: string): number => {
  const r = parseHexChannel(hex, 1, 3) / 255;
  const g = parseHexChannel(hex, 3, 5) / 255;
  const b = parseHexChannel(hex, 5, 7) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return ((max + min) / 2) * 100;
};

const MIN_LIGHTNESS = 20;
const MAX_LIGHTNESS = 80;

const ChangeColorPreference: React.FC = () => {
  const navigation = useNavigation<ChangeColorPreferenceNavigationProp>();
  const { t } = useTranslation();
  const {
    userRole,
    themeColors,
    customColors,
    darkMode,
    setCustomColorForRole,
    resetColorForRole,
    setDarkModeForRole,
  } = useUserRole();

  const styles = useMemo(
    () => makeChangeColorPreferenceStyles(themeColors as RoleTheme),
    [themeColors],
  );


  // Tab: 0 = Personal, 1 = Business
  const [activeType, setActiveType] = useState<number>(userRole);

  const getActiveColor = useCallback(
    (role: number): string => {
      if (customColors[role]) return customColors[role];
      const defaultPrimary =
        ROLE_THEMES[role as 0 | 1]?.primary || colors.primary;
      const clean = defaultPrimary.replace('#', '').slice(0, 6);
      return '#' + clean;
    },
    [customColors],
  );

  const [selectedColor, setSelectedColor] = useState<string>(
    getActiveColor(userRole),
  );

  const handleAccountChange = useCallback(
    (index: number): void => {
      setActiveType(index);
      setSelectedColor(getActiveColor(index));
    },
    [getActiveColor],
  );

  const updateColor = useCallback((color: string): void => {
    setSelectedColor(color);
  }, []);

  const onSelectColor = useCallback(
    (color: ColorSelection): void => {
      updateColor(color.hex);
    },
    [updateColor],
  );

  const previewTheme = useMemo(
    () => generateThemeFromColor(selectedColor),
    [selectedColor],
  );

  const handleSaveColor = (): void => {
    setCustomColorForRole(activeType, selectedColor);
    navigation.goBack();
  };

  const handleResetToDefault = (): void => {
    resetColorForRole(activeType);
    const defaultPrimary =
      ROLE_THEMES[activeType as 0 | 1]?.primary || colors.primary;
    const clean = defaultPrimary.replace('#', '').slice(0, 6);
    setSelectedColor('#' + clean);
  };

  const hasChanges = selectedColor !== getActiveColor(activeType);

  const lightness = getColorLightness(selectedColor);
  const colorWarning =
    lightness < MIN_LIGHTNESS
      ? t('change_color_preference.too_dark', {
          defaultValue: 'Color is too dark. Please pick a lighter shade.',
        })
      : lightness > MAX_LIGHTNESS
        ? t('change_color_preference.too_light', {
            defaultValue: 'Color is too light. Please pick a darker shade.',
          })
        : null;

  const isTabDark = darkMode[activeType] ?? false;

  const handleDarkModeToggle = (value: boolean): void => {
    setDarkModeForRole(activeType, value);
  };

  return (
    <ScreenWrapper
      containerStyle={styles.screenContainer}
      showShadow={false}
      scrollable
    >
      <AuthHeader
        title={t('change_color_preference.title')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        containerStyle={styles.headerContainer}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />

      <CustomTabs
        tabs={USER_ACCOUNT_TYPES.map(tab => ({
          ...tab,
          label: t(tab.label),
        }))}
        activeTab={activeType}
        onTabChange={handleAccountChange}
        showIcons={false}
        containerStyle={styles.tabsContainer}
        labelStyle={styles.tabLabel}
        activeLabelStyle={styles.activeTabLabel}
      />

      {/* Dark mode toggle */}
      <View style={styles.darkModeRow}>
        <View style={styles.darkModeLabelGroup}>
          <Text style={styles.darkModeLabel}>
            {t('change_color_preference.dark_mode', { defaultValue: 'Dark Mode' })}
          </Text>
          <Text style={styles.darkModeSubLabel}>
            {isTabDark
              ? t('change_color_preference.dark_mode_on', { defaultValue: 'Dark theme active' })
              : t('change_color_preference.dark_mode_off', { defaultValue: 'Light theme active' })}
          </Text>
        </View>
        <Switch
          value={isTabDark}
          onValueChange={handleDarkModeToggle}
          trackColor={{ false: themeColors.border, true: themeColors.primary }}
          thumbColor="#ffffff"
          style={styles.switchScale}
        />
      </View>

      <Text style={styles.pickerLabel}>
        {t('change_color_preference.pick_color')}
      </Text>

      <View style={styles.colorPickerContainer}>
        <View style={styles.pickerCard}>
          <ColorPicker
            style={styles.colorPicker}
            value={selectedColor}
            onCompleteJS={onSelectColor}
          >
            <Panel1 style={styles.panel} />
            <HueSlider style={styles.slider} />
          </ColorPicker>
        </View>

        <View style={styles.bottomNotch} />
      </View>

      {/* Live preview swatches */}
      <View style={styles.previewSection}>
        <View style={styles.previewRow}>
          <View
            style={[
              styles.previewSwatch,
              { backgroundColor: previewTheme.gradient[0] },
            ]}
          />
          <View
            style={[
              styles.previewSwatch,
              { backgroundColor: previewTheme.secondary },
            ]}
          />
          <View
            style={[styles.previewSwatch, { backgroundColor: selectedColor }]}
          />
          <View
            style={[
              styles.previewSwatch,
              { backgroundColor: previewTheme.darkGreen },
            ]}
          />
          <View
            style={[
              styles.previewSwatch,
              { backgroundColor: previewTheme.lightCGreen },
            ]}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {colorWarning ? (
          <Text style={styles.colorWarningText}>{colorWarning}</Text>
        ) : null}
        <PrimaryButton
          title={t('change_color_preference.save_color')}
          onPress={handleSaveColor}
          buttonStyle={[
            styles.saveButton,
            { backgroundColor: colorWarning ? '#aaa' : selectedColor },
          ]}
          textStyle={styles.saveButtonText}
          disabled={!hasChanges || !!colorWarning}
        />

        <TouchableOpacity
          onPress={handleResetToDefault}
          style={styles.resetButton}
        >
          <Text style={styles.resetButtonText}>
            {t('change_color_preference.reset_to_default')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default ChangeColorPreference;
