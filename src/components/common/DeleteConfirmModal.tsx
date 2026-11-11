import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../utils/colors';
import { useUserRole } from '../../hooks/useUserRole';
import type { DeleteConfirmModalProps } from '../../types/common.types';
import { makeDeleteConfirmModalStyles } from './DeleteConfirmModal.styles';
import { RoleTheme } from '../../types/roleManager.types';

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title, 
  message,
  isLoading = false
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeDeleteConfirmModalStyles(themeColors as RoleTheme), [themeColors]);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="trash-outline" size={60} color={themeColors.textPrimary} />
              </View>
              
              <Text style={[styles.title, { textAlign: 'center' }]}>
                {title || message || t('modals.delete_confirm')}
              </Text>

              <View style={[styles.buttonRow, { flexDirection:  'row' }]}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={onClose}
                  disabled={isLoading}>
                  <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.deleteButton, { backgroundColor: themeColors.primary }]}
                  onPress={onConfirm}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.deleteButtonText}>{t('modals.delete')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DeleteConfirmModal;
