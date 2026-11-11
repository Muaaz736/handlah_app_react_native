import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import ImageUploader from './ImageUploader';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';

interface ProfilePictureFieldProps {
  /** The id of the current picture, if any. */
  imageId?: string | null;
  /** The new id after an upload, or an empty string after the picture is removed. */
  onChange: (imageId: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Add, replace or remove the profile picture. It is the app's own image uploader (camera or gallery, cropped square, uploaded
 * right away), drawn as a circle everywhere so the picture looks the same on every screen.
 */
const ProfilePictureField: React.FC<ProfilePictureFieldProps> = ({ imageId, onChange, containerStyle }) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  return (
    <View style={[{ marginBottom: 20, alignItems: 'center' }, containerStyle]}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: themeColors.textPrimary, marginBottom: 12, alignSelf: 'flex-start', textAlign: 'left' }}>
        {t('profile_picture.label')}
      </Text>
      <ImageUploader
        shape="circle"
        circleSize={112}
        imageId={imageId || undefined}
        onImageSelect={() => {}}
        onImageUploaded={(result: any) => onChange(typeof result === 'string' ? result : result?.id ?? '')}
        placeholder={t('profile_picture.upload')}
        iconType="ionicons"
        iconName="camera-outline"
        iconSize={26}
        autoUpload={true}
        removable={true}
        onRemove={() => onChange('')}
        containerStyle={{ marginBottom: 0 }}
      />
    </View>
  );
};

export default ProfilePictureField;
