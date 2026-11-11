import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  UIManager,
} from 'react-native';
import { getColorWithOpacity } from '../../utils/colors';
import { isIOS } from '../../utils/helpers';
import LinearGradient from 'react-native-linear-gradient';
import { useUserRole } from '../../hooks/useUserRole';
import type { CustomScrollableTabsProps } from '../../types/common.types';
import { makeCustomScrollableTabsStyles } from './CustomScrollableTabs.styles';
import { RoleTheme } from '../../types/roleManager.types';

// Enable LayoutAnimation for Android
if (!isIOS && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const CustomScrollableTabs: React.FC<CustomScrollableTabsProps> = ({
  tabs = [],
  activeTab = 0,
  onTabChange,
  onViewAllPress,
  style,
  tabStyle,
  innerTabStyle,
  activeTabStyle,
  labelStyle,
  activeLabelStyle,
  viewAllLabel = 'View All',
  showViewAll = true,
}) => {
  const [selectedTab, setSelectedTab] = useState<number>(activeTab);
  const scrollViewRef = useRef<ScrollView>(null);
  const tabRefs = useRef<any>([]);
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomScrollableTabsStyles(themeColors as RoleTheme), [themeColors]);

  useEffect(() => {
    if (activeTab !== selectedTab) {
      setSelectedTab(activeTab);
      scrollToTab(activeTab);
    }
  }, [activeTab]);

  // Scroll to make the active tab visible
  const scrollToTab = (index: number): void => {
    if (scrollViewRef.current && tabRefs.current[index]) {
      // Wait for the next frame to ensure layout is complete
      setTimeout(() => {
        tabRefs.current[index]?.measureLayout(
          scrollViewRef.current as any,
          (x: number, y: number, width: number, height: number) => {
            scrollViewRef.current?.scrollTo({
              x: x - 20, // Add some padding
              animated: true,
            });
          },
          () => { },
        );
      }, 100);
    }
  };

  const handleTabPress = (index: number): void => {
    setSelectedTab(index);
    scrollToTab(index);

    if (onTabChange) {
      onTabChange(index);
    }
  };

  const handleViewAllPress = (): void => {
    if (onViewAllPress) {
      onViewAllPress();
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
    >
      {tabs.map((tab, index) => {
        const isActiveTab = selectedTab === index;
        const grediantsColor = isActiveTab
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
            key={index}
            colors={grediantsColor}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.tab,
              tabStyle,
              isActiveTab && styles.activeTab,
              isActiveTab && activeTabStyle,
            ]}
          >
            <TouchableOpacity
              ref={(ref: any) => {
                tabRefs.current[index] = ref;
              }}
              style={[styles.gradient, innerTabStyle]}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabLabel,
                  labelStyle,
                  isActiveTab && styles.activeTabLabel,
                  isActiveTab && activeLabelStyle,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        );
      })}

      {/* View All button */}
      {showViewAll && (
        <TouchableOpacity
          style={[styles.viewAllTab, tabStyle]}
          onPress={handleViewAllPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewAllLabel, labelStyle]} numberOfLines={1}>
            {viewAllLabel}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default CustomScrollableTabs;
