import React, { FC, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ICONS } from '../../../../../../utils/Images';
import { makeChatHeaderStyles } from './ChatHeader.styles';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { RoleTheme } from '../../../../../../types/roleManager.types';

interface ChatHeaderProps {
  themeColor: string;
  handleFunc?: () => void;
}

const ChatHeader: FC<ChatHeaderProps> = ({ themeColor, handleFunc }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();

const { themeColors } = useUserRole();

const styles = useMemo(() => makeChatHeaderStyles(themeColors as RoleTheme), [themeColors]);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        // onPress={() => navigation.goBack()}
        onPress={handleFunc}
        activeOpacity={0.7}
      >
        <View style={styles.backArrow} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <View style={[styles.botAvatar, { backgroundColor: themeColor }]}>
          {/* <Text style={styles.botAvatarLargeText}>✦</Text> */}
          <Image source={ICONS.APP_ICON} style={{ width: 24, height: 24, tintColor: themeColors.background }} />
        </View>
        <View>
          {/* <Text style={styles.headerTitle}>{t('ai_assistant.handlah_assistant')}</Text> */}
          <Text style={styles.headerTitle}>Halo</Text>
          <View style={styles.statusRow}>
            <View style={[styles.onlineDot, { backgroundColor: themeColor }]} />
            <Text style={[styles.statusText, { color: themeColor }]}>
              {t('common.online')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};


export default ChatHeader;
