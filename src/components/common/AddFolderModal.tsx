import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../utils/validationSchemas';
import CustomInput from './CustomInput';
import PrimaryButton from './PrimaryButton';
import { useUserRole } from '../../hooks/useUserRole';
import type { AddFolderModalProps } from '../../types/common.types';
import { makeAddFolderModalStyles } from './AddFolderModal.styles';
import { RoleTheme } from '../../types/roleManager.types';

interface ComplianceFolderFormValues {
  folderName: string;
}

const AddFolderModal: React.FC<AddFolderModalProps> = ({
  visible,
  onClose,
  onSave,
  editFolder = null,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAddFolderModalStyles(themeColors as RoleTheme), [themeColors]);
  const formikRef = React.useRef<FormikProps<ComplianceFolderFormValues> | null>(null);

  const initialValues: ComplianceFolderFormValues = editFolder
    ? {
      folderName: editFolder.folderName || editFolder.name || '',
    }
    : {
      folderName: '',
    };

  const handleSubmit = (values: ComplianceFolderFormValues) => {
    // Call the parent onSave with the form values
    onSave(values as any);
    // Reset form after submission
    formikRef?.current?.resetForm();
  };

  const handleCancel = (): void => {
    formikRef?.current?.resetForm();
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

          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={validationSchema('compliance_folder')}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
              <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <CustomInput
                  label={t('business.compliance.folder_name')}
                  placeholder={t('business.compliance.folder_name')}
                  value={values.folderName}
                  onChangeText={handleChange('folderName')}
                  containerStyle={styles.inputContainer}
                  error={touched.folderName ? errors.folderName : undefined}
                />



                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: themeColors.primary }]}
                    onPress={handleCancel}
                    disabled={isLoading}
                  >
                    <Text style={[styles.cancelButtonText, { color: themeColors.primary }]}>
                      {t('business.compliance.cancel')}
                    </Text>
                  </TouchableOpacity>

                  <PrimaryButton
                    title={editFolder ? t('business.compliance.update') : t('business.compliance.create')}
                    onPress={() => handleSubmit()}
                    buttonStyle={[styles.createButton, { backgroundColor: themeColors.primary }]}
                    disabled={isLoading}
                  />
                </View>

                {isLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                  </View>
                )}
              </ScrollView>
            )}
          </Formik>
        </View>
      </View>
    </Modal>
  );
};


export default AddFolderModal;
