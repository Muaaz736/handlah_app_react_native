import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomInput from '../common/CustomInput';
import PrimaryButton from '../common/PrimaryButton';
import colors from '../../utils/colors';
import { useUserRole } from '../../hooks/useUserRole';
import type { AddCredentialsModalProps } from '../../types/addCredentialsModal.types';
import { makeAddCredentialsModalStyles } from './AddCredentialsModal.styles';
import { RoleTheme } from '../../types/roleManager.types';

const { width } = Dimensions.get('window');

const AddCredentialsModal: React.FC<AddCredentialsModalProps> = ({ visible, onClose, onSave, initialUsername = '', initialPassword = '', isEditMode = false }) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAddCredentialsModalStyles(themeColors as RoleTheme), [themeColors]);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setUsername(initialUsername || '');
      setPassword(initialPassword || '');
    }
  }, [visible, initialUsername, initialPassword]);

  const handleSave = (): void => {
    if (username.trim() && password.trim()) {
      onSave({ username: username.trim(), password: password.trim() });
      onClose();
    }
  };

  const handleCancel = (): void => {
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        Keyboard.dismiss();
        handleCancel();
      }}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {t('business.add_license.credentials_modal_title')}
          </Text>

          <CustomInput
            label={t('business.add_license.username')}
            placeholder={t('business.add_license.username_placeholder')}
            value={username}
            onChangeText={setUsername}
            containerStyle={styles.inputContainer}
            inputContainerStyle={{ height: 50 }}
            password={isEditMode}
          />

          <CustomInput
            label={t('business.add_license.password')}
            placeholder={t('business.add_license.password_placeholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            containerStyle={styles.inputContainer}
            inputContainerStyle={{ height: 50 }}
            password={isEditMode}
          />

          <View style={styles.buttonRow}>
            <PrimaryButton
              title={t('business.add_license.cancel')}
              onPress={handleCancel}
              variant="outline"
              buttonStyle={[
                styles.addButton,
                {
                  borderColor: themeColors.textPrimary,
                  borderWidth: 1,
                  paddingVertical: 10,
                },
              ]}
              textStyle={{ color: themeColors.textPrimary }}
            />
            <PrimaryButton
              title={t('business.add_license.add')}
              onPress={handleSave}
              buttonStyle={[
                styles.addButton,
                { backgroundColor: themeColors.primary, paddingVertical: 10 },
              ]}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddCredentialsModal;
