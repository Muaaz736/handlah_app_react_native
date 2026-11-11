import React, { useState, useMemo } from 'react';
import { View, Text, Modal } from 'react-native';
import PrimaryButton from '../common/PrimaryButton';
import CustomDropDown from '../common/CustomDropDown';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import { makeLinkLoanModalStyles } from './LinkLoanModal.styles';

export interface LinkOption {
  label: string;
  value: string;
}

export interface LinkLoanModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (params: { realEstateId?: number; vehicleId?: number }) => void;
  realEstateOptions?: LinkOption[];
  vehicleOptions?: LinkOption[];
  isLoading?: boolean;
}

const LinkLoanModal: React.FC<LinkLoanModalProps> = ({
  visible,
  onClose,
  onConfirm,
  realEstateOptions = [],
  vehicleOptions = [],
  isLoading = false,
}) => {
  const [selectedRealEstate, setSelectedRealEstate] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeLinkLoanModalStyles(themeColors), [themeColors]);

  const handleRealEstateSelect = (value: string | string[]): void => {
    const v = Array.isArray(value) ? value[0] : value;
    setSelectedRealEstate(v);
    // Only one can be selected at a time
    if (v) setSelectedVehicle('');
  };

  const handleVehicleSelect = (value: string | string[]): void => {
    const v = Array.isArray(value) ? value[0] : value;
    setSelectedVehicle(v);
    // Only one can be selected at a time
    if (v) setSelectedRealEstate('');
  };

  const handleLink = (): void => {
    if (!onConfirm) return;
    const params: { realEstateId?: number; vehicleId?: number } = {};
    if (selectedRealEstate) {
      params.realEstateId = Number(selectedRealEstate);
    } else if (selectedVehicle) {
      params.vehicleId = Number(selectedVehicle);
    }
    onConfirm(params);
  };

  const handleCancel = (): void => {
    setSelectedRealEstate('');
    setSelectedVehicle('');
    onClose();
  };

  const canConfirm = !!selectedRealEstate || !!selectedVehicle;
  const hasOptions = realEstateOptions.length > 0 || vehicleOptions.length > 0;

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
              name="link-variant"
              size={32}
              color={themeColors.primary}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('common.link')}</Text>
          <Text style={styles.subtitle}>{t('common.link_subtittle')}</Text>

          {/* Real Estate Dropdown */}
          {realEstateOptions.length > 0 && (
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>{t('loans.link_real_estate')}</Text>
              <CustomDropDown
                options={realEstateOptions}
                value={selectedRealEstate}
                onSelect={(val: any) => handleRealEstateSelect(val)}
                placeholder={t('loans.link_real_estate_placeholder')}
                search={false}
                leftIcon={true}
                style={styles.dropdown}
              />
            </View>
          )}

          {/* Divider */}
          {realEstateOptions.length > 0 && vehicleOptions.length > 0 && (
            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>{t('common.or') || 'OR'}</Text>
              <View style={styles.orLine} />
            </View>
          )}

          {/* Vehicle Dropdown */}
          {vehicleOptions.length > 0 && (
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>{t('loans.link_vehicle')}</Text>
              <CustomDropDown
                options={vehicleOptions}
                value={selectedVehicle}
                onSelect={(val: any) => handleVehicleSelect(val)}
                placeholder={t('loans.link_vehicle_placeholder')}
                search={false}
                leftIcon={true}
                style={styles.dropdown}
              />
            </View>
          )}

          {/* No options message */}
          {!hasOptions && (
            <Text style={styles.noOptionsText}>{t('loans.link_no_options')}</Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={t('loans.link_cancel')}
              onPress={handleCancel}
              variant="outline"
              buttonStyle={hasOptions && canConfirm ? styles.cancelButton : styles.fullWidthButton}
            />
            {hasOptions && canConfirm && (
              <PrimaryButton
                title={t('loans.link_confirm')}
                onPress={handleLink}
                buttonStyle={[styles.linkButton, { backgroundColor: themeColors.primary }]}
                loading={isLoading}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LinkLoanModal;
