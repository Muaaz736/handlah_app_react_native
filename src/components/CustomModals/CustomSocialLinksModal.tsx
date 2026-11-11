import React, { useMemo } from 'react';
import { enforceHttps } from '../../utils/httpsGuard';
import {
  View,
  Modal,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { ICONS } from '../../utils/Images';
import { useUserRole } from '../../hooks/useUserRole';
import type { CustomSocialLinksModalProps, SocialLinkItem } from '../../types/customSocialLinksModal.types';
import { makeCustomSocialLinksModalStyles } from './CustomSocialLinksModal.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CustomSocialLinksModal: React.FC<CustomSocialLinksModalProps> = ({ visible, onClose, connection }) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomSocialLinksModalStyles(themeColors as RoleTheme), [themeColors]);

  const socialLinks: SocialLinkItem[] = [
    {
      name: 'facebook',
      icon: ICONS.FACEBOOK_ICON,
      color: '#1877F2',
      url: connection?.socialLinks?.facebook || 'https://facebook.com',
    },
    {
      name: 'instagram',
      icon: ICONS.INSTAGRAM_ICON,
      color: '#E4405F',
      url: connection?.socialLinks?.instagram || 'https://instagram.com',
    },
    {
      name: 'linkedin',
      icon: ICONS.LINKEDIN_ICON,
      color: '#0A66C2',
      url: connection?.socialLinks?.linkedin || 'https://linkedin.com',
    },
    {
      name: 'twitter',
      icon: ICONS.TWITTER_ICON,
      color: '#000000',
      url: connection?.socialLinks?.twitter || 'https://twitter.com',
    },
  ];

  // Filter only available links
  const availableLinks = socialLinks.filter(link => link.url);

  const handleSocialPress = (url: string): void => {
    if (url) {
      Linking.openURL(enforceHttps(url)).catch(err =>
        console.error('Failed to open URL:', err),
      );
    }
  };

  const handleOverlayPress = (): void => {
    onClose();
  };

  const handleContentPress = (e: any): void => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleContentPress}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {/* Social Icons */}
            <View style={styles.socialIconsContainer}>
              {availableLinks.map((social, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.socialIconButton, { backgroundColor: themeColors.primary }]}
                  onPress={() => handleSocialPress(social.url)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={social.icon}
                    style={[styles.socialIconImage, { tintColor: themeColors.text }]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomSocialLinksModal;
