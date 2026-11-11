import React, { useState, useMemo } from 'react';
import { View, Text, Modal } from 'react-native';
import PrimaryButton from '../common/PrimaryButton';
import CustomDropDown from '../common/CustomDropDown';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import type { MovePropertyModalProps, PropertyOption } from '../../types/movePropertyModal.types';
import { makeMovePropertyModalStyles } from './MovePropertyModal.styles';

const MovePropertyModal: React.FC<MovePropertyModalProps> = ({ visible, onClose, onConfirm, propertyOptions = [] }) => {
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeMovePropertyModalStyles(themeColors), [themeColors]);

  const handlePropertySelect = (value: string | string[]): void => {
    const propertyValue = Array.isArray(value) ? value[0] : value;
    setSelectedProperty(propertyValue);
  };

  const handleMove = (): void => {
    if (onConfirm) {
      onConfirm(selectedProperty);
    }
    setSelectedProperty('');
  };

  const handleCancel = (): void => {
    setSelectedProperty('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="home-outline"
              size={32}
              color={themeColors.primary}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t("personal_property.move_this_item_to")}</Text>

          {/* Dropdown */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}> {t('personal_property.select_property')}</Text>
            <CustomDropDown
              options={propertyOptions}
              value={selectedProperty}
              onSelect={(val:any)=>handlePropertySelect(val)}
              placeholder={propertyOptions.length === 0 ? t('add_personal_property.assign_property_helper') : t('add_personal_property.select')}
              search={false}
              leftIcon={true}
              style={styles.dropdown}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={t('personal_property.cancel')}
              onPress={handleCancel}
              variant="outline"
              buttonStyle={propertyOptions.length === 0 ? styles.fullWidthButton : styles.cancelButton}
            />
            {propertyOptions.length > 0 && (
              <PrimaryButton
                title={t('personal_property.move')}
                onPress={handleMove}
                buttonStyle={[styles.moveButton, { backgroundColor: themeColors.primary }]}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MovePropertyModal;
