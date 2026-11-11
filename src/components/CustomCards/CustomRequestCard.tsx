import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import colors, { getColorWithOpacity } from '../../utils/colors';
import PrimaryButton from '../common/PrimaryButton';
import ProfileAvatar from '../common/ProfileAvatar';
import { useUserRole } from '../../hooks/useUserRole';
import { useTranslation } from 'react-i18next';
import type {
  CustomRequestCardProps,
} from '../../types/customRequestCard.types';
import { makeCustomRequestCardStyles } from './CustomRequestCard.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CustomRequestCard: React.FC<CustomRequestCardProps> = ({
  name,
  email,
  phone,
  status,
  onAccept,
  onDecline,
  onCancel,
  message,
  reason,
  profilePicture,
  acceptLoading = false,
  declineLoading = false,
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomRequestCardStyles(themeColors as RoleTheme), [themeColors]);
  const { t } = useTranslation();

  const getInitial = (name: string): string => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const handleAccept = (): void => {
    if (onAccept) {
      onAccept();
    }
  };

  const handleDecline = (): void => {
    if (onDecline) {
      onDecline();
    }
  };

  const handleCancel = (): void => {
    if (onCancel) {
      onCancel();
    }
  };

  const renderButtons = (): React.ReactElement => {
    if (status === 'accepted') {
      return (
        <PrimaryButton
          title={t('common.accepted')}
          onPress={handleAccept}
          buttonStyle={{
            backgroundColor: getColorWithOpacity(themeColors.darkGreen, 0.2),
            paddingVertical: 12,
          }}
          textStyle={{ color: themeColors.darkGreen }}
        />
      );
    }

    if (status === 'Pending') {
      return (
        <PrimaryButton
          title={t('common.pending')}
          onPress={() => {}}
          buttonStyle={[
            styles.rejectButton,
            {
              backgroundColor: getColorWithOpacity(colors.gray, 0.2),
              borderColor: getColorWithOpacity(colors.gray, 0.2),
            },
          ]}
        />
      );
    }

    if (status === 'declined') {
      return (
        <PrimaryButton
          title={t('common.declined')}
          onPress={handleAccept}
          buttonStyle={styles.acceptButton}
          textStyle={{ color: colors.error }}
        />
      );
    }

    if (status === 'emergency') {
      return (
        <View style={styles.emergencyContainer}>
          <View style={styles.buttonRow}>
            <PrimaryButton
              title={t('common.reject')}
              onPress={handleDecline}
              variant="outline"
              loading={declineLoading}
              disabled={declineLoading || acceptLoading}
              buttonStyle={styles.rejectButton}
              textStyle={styles.rejectButtonText}
            />
            <PrimaryButton
              title={t('common.approve_access')}
              onPress={handleAccept}
              loading={acceptLoading}
              disabled={acceptLoading || declineLoading}
              buttonStyle={[
                styles.approveButton,
                { backgroundColor: themeColors.darkGreen },
              ]}
              textStyle={{ fontSize: 15 }}
            />
          </View>
          {message && <Text style={styles.messageText}>{message}</Text>}
        </View>
      );
    }

    // Default pending state
    return (
      <View style={styles.buttonRow}>
        <PrimaryButton
          title={t('common.decline')}
          onPress={handleDecline}
          variant="outline"
          buttonStyle={{
            flex: 1,
            backgroundColor: colors.white,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: colors.black,
          }}
          textStyle={[styles.declineButtonText, { color: themeColors.black }]}
          />
        <PrimaryButton
          title={t('common.accept')}
          onPress={handleAccept}
          buttonStyle={{
            flex: 1,
            backgroundColor: getColorWithOpacity(themeColors.darkGreen),
            paddingVertical: 12,
          }}
          textStyle={[styles.declineButtonText, { color: themeColors.text }]}
        />
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <ProfileAvatar
          imageId={profilePicture}
          name={name}
          size={50}
          style={{ backgroundColor: themeColors.secondary, marginRight: 12 }}
        />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.phone}>{phone}</Text>
          {reason && (
            <Text style={styles.phone}>
              {t('common.reason')}: {reason}
            </Text>
          )}
        </View>
      </View>
      {renderButtons()}
    </View>
  );
};

export default CustomRequestCard;
