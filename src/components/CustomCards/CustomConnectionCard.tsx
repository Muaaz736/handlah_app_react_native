import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import colors, { getColorWithOpacity } from '../../utils/colors';
import { getInitials } from '../../utils/helpers';
import RemoteImage from '../common/RemoteImage';
import LinearGradient from 'react-native-linear-gradient';
import { ICONS } from '../../utils/Images';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUserRole } from '../../hooks/useUserRole';
import type { CustomConnectionCardProps } from '../../types/customConnectionCard.types';
import { makeCustomConnectionCardStyles } from './CustomConnectionCard.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CustomConnectionCard: React.FC<CustomConnectionCardProps> = memo(
  ({
    name,
    email,
    phone,
    category,
    avatar,
    isSharedAccess = false,
    isEmergencyContact = false,
    emergencyLabel,
    onPress,
    onConnectionPress,
    onNotesPress,
  }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors, userRole } = useUserRole();
    const styles = useMemo(() => makeCustomConnectionCardStyles(themeColors as RoleTheme), [themeColors]);
    const showEmergencyBadge = isEmergencyContact || !!emergencyLabel;

    const renderStatusBadgeDown = (): React.ReactElement | null => {
      if (isSharedAccess) {
        return (
          <View
            style={[
              styles.statusBadge,
              { paddingVertical: 8, paddingHorizontal: 16 },
            ]}
          >
            <Text style={[styles.statusText, { color: colors.black }]}>
              {t('connection_card.shared_access')}
            </Text>
          </View>
        );
      }

      return null;
    };

    const renderStatusBadgeAbove = (): React.ReactElement | null => {
      const grediantsColor = [
        themeColors.primary,
        getColorWithOpacity(themeColors.secondary, userRole ? 1 : 0.5),
        themeColors.secondary,
      ];
      if (showEmergencyBadge) {
        return (
          <LinearGradient
            colors={grediantsColor}
            start={{ x: 1, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={[styles.statusBadge]}
          >
            <View style={styles.badgePadding}>
              <Text style={[styles.statusText, { color: colors.white }]}>
                {emergencyLabel || t('connection_card.emergency_contact')}
              </Text>
            </View>
          </LinearGradient>
        );
      }
      return null;
    };

    const handlePress = (): void => {
      if (onPress) {
        onPress();
      }
    };

    const handleConnectionPress = (): void => {
      if (onConnectionPress) {
        onConnectionPress();
      }
    };

    const handleNotesPress = (): void => {
      if (onNotesPress) {
        onNotesPress();
      }
    };

    const truncate = (text: string, max = 20) =>
      text?.length > max ? text.slice(0, max) + "..." : text;

    return (
      <View style={[styles.container, { backgroundColor: getColorWithOpacity(themeColors.primary, 0.5) }]}>
        {/* Status Badge Above */}
        {renderStatusBadgeAbove()}
        <TouchableOpacity
          style={[
            styles.cardContent,
            {
              borderTopLeftRadius: showEmergencyBadge ? 0 : 20,
              borderTopRightRadius: showEmergencyBadge ? 0 : 20,
            },
          ]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={[styles.avatar, { backgroundColor: themeColors.primary }]}>
            {avatar ? (
              <RemoteImage imageId={avatar} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarText}>{getInitials(name)}</Text>
            )}
          </View>

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <View style={{ gap: 6 }}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              {category && (
                <View style={[styles.categoryBadge, { backgroundColor: getColorWithOpacity(themeColors.primary, 0.5) }]}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              )}
            </View>

            <Text style={styles.email} numberOfLines={1}>
              {email}
            </Text>

            {phone && (
              <Text style={styles.phone} numberOfLines={1}>
                {phone}
              </Text>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <View style={styles.iconButton}>
              <TouchableOpacity onPress={handleNotesPress}>
                <Image
                  source={ICONS.NOTES_ICONS}
                  style={[styles.actionIcon, { tintColor: themeColors.primary }]}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={handlePress}>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {renderStatusBadgeDown()}
      </View>
    );
  },
);

CustomConnectionCard.displayName = 'CustomConnectionCard';

export default CustomConnectionCard;
