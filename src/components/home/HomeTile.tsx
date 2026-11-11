import React, { memo } from 'react';
import { ImageBackground, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import FONTS from '../../utils/fonts';

/** hero = full width; medium = two per row; small = three per row. */
export type TileSize = 'hero' | 'medium' | 'small';

// Measured from the designs (393 pt wide screen).
const HEIGHT: Record<TileSize, number> = { hero: 138, medium: 126, small: 106 };
const BADGE: Record<TileSize, number> = { hero: 48, medium: 44, small: 36 };
const ICON: Record<TileSize, number> = { hero: 27, medium: 24, small: 20 };
const TITLE: Record<TileSize, number> = { hero: 22, medium: 16, small: 13 };
const SUBTITLE: Record<TileSize, number> = { hero: 14, medium: 12, small: 11 };
const ARROW: Record<TileSize, number> = { hero: 28, medium: 24, small: 22 };

interface HomeTileProps {
  title: string;
  /** "4 records", or a short description when there's no count. */
  subtitle?: string;
  image: ImageSourcePropType;
  icon: string;
  /** Badge icon colour (dark on personal, the business blue on business). */
  iconColor: string;
  size: TileSize;
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
}

/**
 * A home-screen tile as in the designs: a photo filling a rounded card with a light glass edge, an icon badge in the
 * top-right corner, the module name and record count bottom-left, and a round arrow button bottom-right.
 */
export const HomeTile = memo(
  ({ title, subtitle, image, icon, iconColor, size, onPress, style, testID }: HomeTileProps) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.shadow, { height: HEIGHT[size] }, style]}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      testID={testID}
    >
      <ImageBackground
        source={image}
        style={styles.card}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        {/* Darkens the lower part so the white text stays readable on any photo. */}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.62)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View
          style={[
            styles.badge,
            { width: BADGE[size], height: BADGE[size], borderRadius: BADGE[size] * 0.28 },
            size === 'small' && { top: 6, right: 6 },
          ]}
        >
          <MaterialCommunityIcons name={icon} size={ICON[size]} color={iconColor} />
        </View>

        {/* The name on its own line (full width), then the record count with the arrow beside it. */}
        <View style={[styles.footer, size === 'small' && styles.footerSmall]}>
          <Text
            style={[styles.title, { fontSize: TITLE[size] }]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {title}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={[styles.subtitle, { fontSize: SUBTITLE[size] }]} numberOfLines={1}>
              {subtitle ?? ''}
            </Text>
            <View style={[styles.arrow, { width: ARROW[size], height: ARROW[size], borderRadius: ARROW[size] / 2 }]}>
              <Feather name="chevron-right" size={ARROW[size] * 0.6} color="#fff" />
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  ),
);

HomeTile.displayName = 'HomeTile';

const TEXT_SHADOW = {
  textShadowColor: 'rgba(0,0,0,0.55)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
};

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    // The light "glass" frame around each photo.
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: '#2b2b2b',
    justifyContent: 'flex-end',
  },
  image: { borderRadius: 16 },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  footer: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  footerSmall: { paddingHorizontal: 9, paddingBottom: 8 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  title: {
    color: '#fff',
    fontFamily: FONTS.display_bold,
    ...TEXT_SHADOW,
  },
  subtitle: {
    flex: 1,
    color: 'rgba(255,255,255,0.92)',
    fontFamily: FONTS.display_medium,
    ...TEXT_SHADOW,
  },
  arrow: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
});
