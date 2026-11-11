import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  UIManager,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import colors, { getColorWithOpacity } from '../../utils/colors';
import { isIOS } from '../../utils/helpers';
import { useUserRole } from '../../hooks/useUserRole';
import type { CustomTabsProps } from '../../types/common.types';
import { makeCustomTabsStyles } from './CustomTabs.styles';
import { RoleTheme } from '../../types/roleManager.types';

// Enable LayoutAnimation for Android
if (!isIOS && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_ICONS: Record<string, string> = {
  home: 'home',
  profile: 'user',
  settings: 'settings',
  messages: 'message-circle',
  notifications: 'bell',
  search: 'search',
  menu: 'menu',
  posts: 'file-text',
  services: 'grid',
  favorites: 'heart',
  categories: 'list',
};

const CustomTabs: React.FC<CustomTabsProps> = ({
  tabs = [],
  activeTab = 0,
  onTabChange,
  containerStyle,
  tabStyle,
  activeTabStyle,
  labelStyle,
  activeLabelStyle,
  iconStyle,
  activeIconStyle,
  showIcons = true,
  iconSize = 18,
}) => {
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomTabsStyles(themeColors as RoleTheme), [themeColors]);

  // Process tabs to ensure they have icons if showIcons is true
  const processedTabs = tabs.map(tab => {
    if (!showIcons) {
      return { ...tab, icon: null };
    }

    if (tab.icon) {
      return tab;
    }

    // If no icon provided but showIcons is true, try to use a default icon
    const iconName: string = DEFAULT_ICONS[tab.label.toLowerCase()] || 'circle';
    return {
      ...tab,
      icon: <Feather name={iconName} size={iconSize} color={colors.white} />,
    };
  });

  // Animate slider whenever activeTab changes (after initialized)
  useEffect(() => {
    if (isInitialized) {
      animateSlider(activeTab);
    }
  }, [activeTab, isInitialized]);

  // Apply initial position once tab widths are available
  useEffect(() => {
    if (tabWidths.length > 0 && !isInitialized) {
      // Calculate the initial position
      let position = 0;
      for (let i = 0; i < activeTab; i++) {
        position += tabWidths[i] || 0;
      }

      // Set the initial position without animation
      slideAnim.setValue(position);
      setIsInitialized(true);
    }
  }, [tabWidths, activeTab, isInitialized]);

  const handleContainerLayout = (event: any): void => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const handleTabLayout = (event: any, index: number): void => {
    const { width } = event.nativeEvent.layout;
    setTabWidths(prev => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
  };

  const animateSlider = (index: number): void => {
    // Calculate the position based on tab widths
    let position = 0;
    for (let i = 0; i < index; i++) {
      position += tabWidths[i] || 0;
    }

    Animated.timing(slideAnim, {
      toValue: position,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleTabPress = (index: number): void => {
    if (isInitialized) {
      animateSlider(index);
    }

    if (onTabChange) {
      onTabChange(index);
    }
  };

  const renderIcon = (tab: any, isActive: boolean): React.ReactNode => {
    if (!tab.icon || !showIcons) return null;

    // Check if the icon is an Image component (React element with type === Image)
    if (React.isValidElement(tab.icon) && tab.icon.type === Image) {
      // For Image components, just clone with the style props
      return React.cloneElement(tab.icon, {
        style: [
          tab.icon.props.style,
          styles.icon,
          iconStyle,
          isActive && activeIconStyle,
        ],
      } as any);
    }

    // For other React elements (like vector icons)
    if (React.isValidElement(tab.icon)) {
      return React.cloneElement(tab.icon, {
        color: isActive ? colors.white : colors.white,
        size: (tab.icon.props as any).size || iconSize,
        style: [styles.icon, iconStyle, isActive && activeIconStyle],
      } as any);
    }

    // Fallback - should not normally happen
    return tab.icon;
  };

  return (
    <View
      style={[styles.container, { backgroundColor: getColorWithOpacity(themeColors.primary, 0.15) }, containerStyle]}
      onLayout={handleContainerLayout}
    >
      {/* Active Tab Background - Animates smoothly */}
      {tabWidths.length > 0 && (
        <Animated.View
          style={[
            styles.activeTabBackground,
            {
              backgroundColor: themeColors?.primary || colors.darkGreen,
              width: tabWidths[activeTab] || 0,
              transform: [{ translateX: slideAnim }],
              direction: 'ltr',
            },
            activeTabStyle,
          ]}
        />
      )}

      {/* Tabs */}
      {processedTabs.map((tab, index) => {
        const isActive = index === activeTab;

        return (
          <TouchableOpacity
            key={index}
            style={[styles.tab, { flex: 1 }, tabStyle]}
            onPress={() => handleTabPress(index)}
            activeOpacity={0.7}
            onLayout={event => handleTabLayout(event, index)}
          >
            <View style={styles.tabContent}>
              {renderIcon(tab, isActive)}
              <Text
                style={[
                  styles.tabLabel,
                  { color: themeColors.secondary },
                  labelStyle,
                  isActive && styles.activeTabLabel,
                  isActive && activeLabelStyle,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomTabs;
