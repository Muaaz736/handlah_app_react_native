import React, { useState, useEffect, useMemo } from 'react';
import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import colors from '../../utils/colors';
import PrimaryButton from '../common/PrimaryButton';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import type { CustomEditPermissionAccessModalProps, PermissionData } from '../../types/customEditPermissionAccessModal.types';
import { makeCustomEditPermissionAccessModalStyles } from './CustomEditPermissionAccessModal.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CheckboxInline: React.FC<{
  checked: boolean;
  onPress: () => void;
  label: string;
}> = ({ checked, onPress, label }) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomEditPermissionAccessModalStyles(themeColors as RoleTheme), [themeColors]);

  return (
    <TouchableOpacity style={styles.inlineCheckbox} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.checkboxLabel}>{label}</Text>
      <View
        style={[
          styles.checkbox,
          checked && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
        ]}
      >
        {checked && <View style={styles.checkmark} />}
      </View>
    </TouchableOpacity>
  );
};

const CustomEditPermissionAccessModal: React.FC<CustomEditPermissionAccessModalProps> = ({
  visible,
  onClose,
  onSave,
  itemTitle,
  accessLevel,
  loading = false,
  accessType,
}) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomEditPermissionAccessModalStyles(themeColors as RoleTheme), [themeColors]);
  const [permissions, setPermissions] = useState<PermissionData>({
    view: true,
    edit: false,
  });

  useEffect(() => {
    if (visible) {
      setPermissions({
        view: accessLevel === 'read',
        edit: accessLevel === 'write',
      });
    }
  }, [visible, accessLevel]);

  const handleSave = (): void => {
    if (onSave) onSave(permissions);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {accessType === 'Module' ? (
            <>
              <Text style={styles.title}>{t('edit_permission_modal.title')}</Text>

              <View style={styles.row}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {t(itemTitle as string) || 'Identity Hub'}
                </Text>

                <View style={styles.checkboxGroup}>
                  <CheckboxInline
                    checked={permissions.view}
                    onPress={() =>
                      setPermissions({
                        view: true,
                        edit: false,
                      })
                    }
                    label={t('edit_permission_modal.view_label')}
                  />
                  <CheckboxInline
                    checked={permissions.edit}
                    onPress={() =>
                      setPermissions({
                        view: false,
                        edit: true,
                      })
                    }
                    label={t('edit_permission_modal.edit_label')}
                  />
                </View>
              </View>

              <View style={styles.buttonRow}>
                <PrimaryButton
                  title={t('edit_permission_modal.cancel_button')}
                  onPress={onClose}
                  variant="outline"
                  buttonStyle={styles.cancelButton}
                  textStyle={{ color: themeColors.textPrimary, fontSize: 15 }}
                />
                <TouchableOpacity
                  style={[
                    styles.shareButton,
                    { backgroundColor: themeColors.primary },
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.shareButtonText}>{t('edit_permission_modal.save_button')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{t('common.granted_selective_access')}</Text>
              <View style={styles.buttonRow}>
                <PrimaryButton
                  title={t('common.close')}
                  onPress={onClose}
                  variant="outline"
                  buttonStyle={styles.cancelButton}
                  textStyle={{ color: themeColors.textPrimary, fontSize: 15 }}
                />
              </View>
            </>
          )}

        </View>
      </View>
    </Modal>
  );
};

export default CustomEditPermissionAccessModal;
