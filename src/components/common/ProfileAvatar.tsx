import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import RemoteImage from './RemoteImage';
import { useUserRole } from '../../hooks/useUserRole';
import { getColorWithOpacity } from '../../utils/colors';

interface ProfileAvatarProps {
  /** The id of the uploaded picture (or a link). With none, the first letter of the name is shown. */
  imageId?: string | null;
  name?: string | null;
  size?: number;
  /** 'solid' (the theme colour, white letter), 'soft' (a light tint of it) or 'neutral' (the list-row look). */
  variant?: 'solid' | 'soft' | 'neutral';
  style?: StyleProp<ViewStyle>;
}

/** A round profile picture, or the person's initial on the theme colour when there is no picture. */
const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ imageId, name, size = 36, variant = 'solid', style }) => {
  const { themeColors } = useUserRole();
  const initial = (name ?? '').trim().charAt(0).toUpperCase() || '?';
  const circle = { width: size, height: size, borderRadius: size / 2, overflow: 'hidden' as const };
  const background = variant === 'soft' ? getColorWithOpacity(themeColors.primary, 0.2) : variant === 'neutral' ? themeColors.surface : themeColors.primary;
  const letterColor = variant === 'soft' ? themeColors.primary : variant === 'neutral' ? themeColors.textPrimary : '#FFFFFF';

  return (
    <View style={[circle, { alignItems: 'center', justifyContent: 'center', backgroundColor: background }, style]}>
      {imageId ? (
        <RemoteImage imageId={imageId} style={circle} resizeMode="cover" />
      ) : (
        <Text style={{ color: letterColor, fontSize: size * 0.42, fontWeight: '600' }}>{initial}</Text>
      )}
    </View>
  );
};

export default ProfileAvatar;
