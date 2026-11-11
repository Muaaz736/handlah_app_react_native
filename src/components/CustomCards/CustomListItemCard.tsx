import React, { memo, useMemo } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  I18nManager,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import colors from '../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import type { CustomListItemCardProps, ListItem } from '../../types/customListItemCard.types';
import { iconWithRespectToModuleName } from '../../utils/Images';
import { makeCustomListItemCardStyles } from './CustomListItemCard.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CustomListItemCard: React.FC<CustomListItemCardProps> = memo(
  ({
    item,
    onPress,
    showRightIcon = true,
    rightIcon = null,
    rightIconName = 'chevron-right',
    rightIconSize = 20,
    rightIconColor = colors.black,
    onRightIconPress = null,
    isLast = false,
    accentColor,
    count,
  }) => {
    const { t } = useTranslation();
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(() => makeCustomListItemCardStyles(themeColors as RoleTheme), [themeColors]);

    const handleRightIconPress = (e: any): void => {
      if (onRightIconPress) {
        if (e && e.stopPropagation) {
          e.stopPropagation();
        }
        onRightIconPress(item);
      }
    };

    const handlePress = (): void => {
      if (onPress) {
        onPress(item);
      }
    };

    const renderRightIcon = (): React.ReactElement | null => {
      if (!showRightIcon) return null;

      // If custom right icon component is provided
      if (rightIcon) {
        return <>{rightIcon}</>;
      }

      // Default arrow icon based on RTL
      const iconName = I18nManager.isRTL ? 'chevron-left' : rightIconName;

      return onRightIconPress ? (
        <TouchableOpacity
          onPress={handleRightIconPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather
            name={iconName}
            size={rightIconSize}
            color={rightIconColor}
          />
        </TouchableOpacity>
      ) : (
        <Feather name={iconName} size={rightIconSize} color={themeColors.textPrimary} />
      );
    };

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={[styles.container]}
      >
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <Image
              source={
                item.icon ||
                iconWithRespectToModuleName[
                item.modulename as keyof typeof iconWithRespectToModuleName
                ]
              }
              style={[styles.icon, { tintColor: accentColor || themeColors.primary }]}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {item.titleKey ? t(item.titleKey) : item.displayname && (item.displayname === 'PersonalProperty_shared' && isBusinessRole()) ? t('BusinessProperty_shared') : t(item.displayname)}
            </Text>
            {item.subtitleKey && (
              <Text style={styles.subtitle}>{t(item.subtitleKey)}</Text>
            )}
          </View>
        </View>

        {(count !== undefined && count !== null && count > 0) && (
          <View style={[styles.badge, { backgroundColor: accentColor ||themeColors.primary }]}>
            <Text style={styles.badgeText}>
              {count > 99 ? '99+' : count}
            </Text>
          </View>
        )}
        {renderRightIcon()}
      </TouchableOpacity>
    );
  },
);

CustomListItemCard.displayName = 'CustomListItemCard';

export default CustomListItemCard;
