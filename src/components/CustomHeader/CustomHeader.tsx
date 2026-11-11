import React, { memo, useMemo } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import CustomTabs from '../common/CustomTabs';
import { CustomInput } from '../common';
import HandlahWordmark from '../common/HandlahWordmark';
import { ICONS } from '../../utils/Images';
import colors from '../../utils/colors';
import { USER_ACCOUNT_TYPES } from '../../utils/staticData';
import { USER_ROLES } from '../../utils/roleManager';
import CustomSeparator from '../common/CustomSeparator';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import { useSubscriptionGate } from '../../hooks/useSubscriptionGate';
import type { CustomHeaderProps } from '../../types/customHeader.types';
import { makeCustomHeaderStyles } from './CustomHeader.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CustomHeader: React.FC<CustomHeaderProps> = memo(
  ({
    onSearchChange,
    searchValue = '',
    handleAccountChange,
    isShowSearchedInput = false,
    headerText = '',
    showNotificationIcon = true,
    notificationCount = 0,
    onNotificationPress,
    variant = 'default',
  }) => {
    const overPhoto = variant === 'overPhoto';
    const { t } = useTranslation();
    const { themeColors, userRole } = useUserRole();
    const { switchRole, GateModal } = useSubscriptionGate();
    const styles = useMemo(() => makeCustomHeaderStyles(themeColors as RoleTheme), [themeColors]);

    const handleTabChange = (index: number): void => {
      // A Personal-only plan gets the paywall here instead of the Business side.
      if (!switchRole(index)) {
        return;
      }
      if (handleAccountChange) {
        handleAccountChange(index);
      }
    };

    const handleSearchTextChange = (text: string): void => {
      if (onSearchChange) {
        onSearchChange(text);
      }
    };

    return (
      <View style={styles.container}>
        <View style={[styles.header, overPhoto && styles.headerOverPhoto]}>
          <HandlahWordmark
            variant={userRole === USER_ROLES.BUSINESS ? 'business' : 'personal'}
            height={22}
            isDark={overPhoto || themeColors?.isDark}
          />

          <CustomTabs
            tabs={USER_ACCOUNT_TYPES.map(tab => ({
              ...tab,
              label: t(tab.label),
            }))}
            activeTab={userRole}
            onTabChange={handleTabChange}
            showIcons={false}
            containerStyle={overPhoto ? { ...styles.tabsContainer, ...styles.tabsContainerOverPhoto } : styles.tabsContainer}
            labelStyle={overPhoto ? { ...styles.tabLabel, ...styles.tabLabelOverPhoto } : styles.tabLabel}
            activeLabelStyle={styles.activeTabLabel}
            activeTabStyle={[styles.activeTab, { backgroundColor: themeColors.primary }]}
          />

          {showNotificationIcon && (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={onNotificationPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={22} color={overPhoto ? '#fff' : themeColors.textPrimary} />
              {notificationCount > 0 && (
                <View
                  style={[
                    styles.notificationBadge,
                    { backgroundColor: themeColors.primary },
                  ]}
                >
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

        </View>
        {!isShowSearchedInput && !overPhoto && <CustomSeparator marginVertical={0} />}
        {GateModal}

        {isShowSearchedInput && (
          <View style={styles.searchWrapper}>
            <CustomInput
              placeholder={t('home.header_search_placeholder')}
              value={searchValue}
              onChangeText={handleSearchTextChange}
              icon={ICONS.SEARCH_ICON}
              startIconStyle={styles.searchStartIcon}
              placeholderTextColor={colors.black}
              endIcon={
                <Image
                  source={ICONS.VOICE_ICON}
                  style={styles.voiceIcon}
                />
              }
              inputContainerStyle={styles.searchInputContainer}
              containerStyle={styles.searchContainer}
            />
          </View>
        )}
      </View>
    );
  },
);

CustomHeader.displayName = 'CustomHeader';

export default CustomHeader;
