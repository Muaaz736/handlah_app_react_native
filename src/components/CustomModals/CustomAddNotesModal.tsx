import React, { useEffect, useState, useMemo } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../../utils/colors';
import { isIOS } from '../../utils/helpers';
import { PrimaryButton } from '../common';
import type { CustomAddNotesModalProps } from '../../types/customAddNotesModal.types';
import { useDispatch, useSelector } from 'react-redux';
import { updateConnectionAsync } from '../../redux/services/connectionService';
import { ASYNC_STATUS } from '../../config/constants';
import { AppDispatch } from '../../types/store.types';
import { makeCustomAddNotesModalStyles } from './CustomAddNotesModal.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CustomAddNotesModal: React.FC<CustomAddNotesModalProps> = ({ visible, onClose, connection, onSave }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [message, setMessage] = useState<string>('');
  const { update_connection_status } = useSelector((state: any) => state.connection_slice);
  const { user_data } = useSelector((state: any) => state.user_auth);
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomAddNotesModalStyles(themeColors as RoleTheme), [themeColors]);
  const loading = update_connection_status === ASYNC_STATUS.LOADING;

  useEffect(() => {
    if (!visible) {
      setMessage('');
      return;
    }
    if (!connection || !user_data?.id) return;

    const userNotes =
      user_data.id === connection.senderuserid
        ? connection.sendernotes
        : connection.receivernotes;

    setMessage(userNotes || '');
  }, [visible, connection, user_data?.id]);

  const handleSave = async (): Promise<void> => {
    await dispatch(updateConnectionAsync({ connectionId: connection?.id, notes: message } as any)).unwrap();
    onSave(message);
    onClose();
  };

  const handleClose = (): void => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{t('modals.notes')}</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Message Label */}
              <Text style={styles.label}>{t('modals.message')}</Text>

              {/* Message Input */}
              <TextInput
                style={styles.textInput}
                placeholder={t('modals.message_placeholder')}
                placeholderTextColor={colors.placeholder}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <PrimaryButton
                title={t('common.save')}
                onPress={handleSave}
                buttonStyle={{ marginTop: 20, paddingVertical: 12 }}
                loading={loading}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CustomAddNotesModal;
