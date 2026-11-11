import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUserRole } from '../../hooks/useUserRole';
import type { SelectBusinessModalProps, SelectBusinessOption } from '../../types/common.types';
import { makeSelectBusinessModalStyles } from './SelectBusinessModal.styles';
import { RoleTheme } from '../../types/roleManager.types';

const SelectBusinessModal: React.FC<SelectBusinessModalProps> = ({
  visible,
  onClose,
  onSelect,
  businesses,
  title,
  message,
}) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeSelectBusinessModalStyles(themeColors as RoleTheme), [themeColors]);

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
              <Text style={styles.title}>
                {title || t('business.select_business_title')}
              </Text>
              <Text style={styles.message}>
                {message || t('business.select_business_message')}
              </Text>

              <FlatList
                data={businesses}
                keyExtractor={(item: SelectBusinessOption) => String(item.value)}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }: { item: SelectBusinessOption }) => (
                  <TouchableOpacity
                    style={styles.businessRow}
                    onPress={() => onSelect(Number(item.value))}
                    activeOpacity={0.7}>
                    <Text style={styles.businessRowText} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={themeColors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SelectBusinessModal;
