import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomInput from '../common/CustomInput';
import PrimaryButton from '../common/PrimaryButton';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { AddFolderModalProps } from '../../types/common.types';
import { makeAddFolderModalStyles } from './AddFolderModal.styles';

const { width } = Dimensions.get('window');

const AddFolderModal: React.FC<AddFolderModalProps> = ({ visible, onClose, onSave, editFolder = null }) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAddFolderModalStyles(themeColors), [themeColors]);
  const [folderName, setFolderName] = useState<string>('');

  useEffect(() => {
    if (editFolder) {
      setFolderName(editFolder.name);
    } else {
      setFolderName('');
    }
  }, [editFolder, visible]);

  const handleSave = (): void => {
    if (folderName.trim()) {
      onSave(folderName.trim());
      setFolderName('');
      onClose();
    }
  };

  const handleCancel = (): void => {
    setFolderName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {editFolder
              ? t('business.compliance.edit_folder_modal_title')
              : t('business.compliance.add_folder_modal_title')}
          </Text>

          <CustomInput
            label={t('business.compliance.folder_name')}
            placeholder={t('business.compliance.folder_name_placeholder')}
            value={folderName}
            onChangeText={setFolderName}
            containerStyle={styles.inputContainer}
            inputContainerStyle={{ height: 50, borderRadius: 10 }}
          />

          <View style={styles.buttonRow}>
            <PrimaryButton
              title={t('business.compliance.cancel')}
              onPress={handleCancel}
              variant="outline"
              buttonStyle={{
                flex: 1,
                paddingVertical: 10,
                borderColor: colors.black,
                borderWidth: 1,
              }}
              textStyle={{ color: colors.black }}
            />
            <PrimaryButton
              title={t('business.compliance.create')}
              onPress={handleSave}
              buttonStyle={[
                styles.createButton,
                { backgroundColor: themeColors.primary },
              ]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddFolderModal;
