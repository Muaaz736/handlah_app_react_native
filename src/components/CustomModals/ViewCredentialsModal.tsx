import React, { useMemo } from 'react';
import { View, Text, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../common/PrimaryButton';
import { useUserRole } from '../../hooks/useUserRole';
import type { ViewCredentialsModalProps } from '../../types/viewCredentialsModal.types';
import { makeViewCredentialsModalStyles } from './ViewCredentialsModal.styles';
import { RoleTheme } from '../../types/roleManager.types';

const ViewCredentialsModal: React.FC<ViewCredentialsModalProps> = ({ visible, onClose, credentials }) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewCredentialsModalStyles(themeColors as RoleTheme), [themeColors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {t('business.add_license.view_credentials_title')}
          </Text>

          <View style={styles.credentialItem}>
            <Text style={styles.label}>
              {t('business.add_license.username')}:{' '}
            </Text>
            <Text style={styles.value}>{credentials?.username || 'N/A'}</Text>
          </View>

          <View style={styles.credentialItem}>
            <Text style={styles.label}>
              {t('business.add_license.password')}:{' '}
            </Text>
            <Text style={styles.value}>{credentials?.password || 'N/A'}</Text>
          </View>

          <PrimaryButton
            title={t('business.licenses.close')}
            onPress={onClose}
            buttonStyle={[
              styles.closeButton,
              { backgroundColor: themeColors.primary, paddingVertical: 12 },
            ]}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ViewCredentialsModal;
