import React, { memo, useMemo } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import colors, { getColorWithOpacity } from '../../utils/colors';
import FONTS from '../../utils/fonts';
import { useTranslation } from 'react-i18next';
import Entypo from 'react-native-vector-icons/Entypo';
import { useUserRole } from '../../hooks/useUserRole';
import { isIOS } from '../../utils/helpers';
import type { CustomFavoriteCardProps } from '../../types/customFavoriteCard.types';
import { makeCustomFavoriteCardStyles } from './CustomFavoriteCard.styles';
import { RoleTheme } from '../../types/roleManager.types';

const FAVORITE_CARD_MAX_SIZE = 110;

const MAX_LABEL_CHARS = 12;

const CustomFavoriteCard: React.FC<CustomFavoriteCardProps> = memo(
  ({
    item,
    onPress,
    containerStyle,
    isDragCard = false,
    titleStyle,
    showCloseBtn = false,
    onClosePress,
    accentColor,
    count,
  }) => {
    const { t, i18n } = useTranslation();
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeCustomFavoriteCardStyles(themeColors as RoleTheme), [themeColors]);
    const { width: windowWidth } = useWindowDimensions();

    // translated title
    const title = t(item.titleKey);

    const firstWord = title.split(' ')[0] ?? title;
    const shortTitle =
      firstWord.length > MAX_LABEL_CHARS
        ? firstWord.slice(0, MAX_LABEL_CHARS)
        : firstWord;

    // RTL languages (Arabic, Urdu, Hebrew) need slightly smaller base font
    const isRTLLang = i18n.dir() === 'rtl';

    const handlePress = (): void => {
      if (onPress) {
        onPress(item);
      }
    };

    const handleClosePress = (e: any): void => {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      if (onClosePress) {
        onClosePress(item);
      }
    };

    const responsiveCardSize = Math.min(
      Math.round(windowWidth / 5),
      FAVORITE_CARD_MAX_SIZE,
    );
    const cardSize = (containerStyle as any)?.width ?? responsiveCardSize;
    return (
      <View style={[styles.wrapper, { width: cardSize }]}>
        {/* Close/Delete Button */}
        {isDragCard && showCloseBtn && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClosePress}
          >
            <Entypo name="cross" size={20} color={themeColors.textPrimary} />
          </TouchableOpacity>
        )}
        {/* Count Badge */}
        {!isDragCard && count !== undefined && count > 0 && (
          <View style={[styles.countBadge, { backgroundColor: accentColor || themeColors.primary }]}>
            <Text style={styles.countBadgeText}>{count > 99 ? '99+' : count}</Text>
          </View>
        )}

        <LinearGradient
          colors={[
            accentColor ? getColorWithOpacity(accentColor, 0.1) : getColorWithOpacity(themeColors.primary, 0.1),
            accentColor || themeColors.primary,
          ]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { width: cardSize, height: cardSize }]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            style={[styles.container, isDragCard && styles.dragedStyle]}
          >
            <View style={[styles.iconContainer, isDragCard && { padding: 8 }]}>
              <Image
                source={item.icon}
                style={[styles.icon, isDragCard && { width: 25, height: 25 }]}
                resizeMode="contain"
              />
            </View>
            <Text
              style={[styles.label, isRTLLang && styles.labelRTL, isDragCard && { fontSize: 11, fontFamily: FONTS.display_bold }, titleStyle]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {shortTitle}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  },
);

CustomFavoriteCard.displayName = 'CustomFavoriteCard';

export default CustomFavoriteCard;
