import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import colors, { getColorWithOpacity } from '../../utils/colors';
import CustomDropDown from '../common/CustomDropDown';
import PrimaryButton from '../common/PrimaryButton';
import { useUserRole } from '../../hooks/useUserRole';
import { getBusinessesAsync } from '../../redux/services/businessService';
import { getSocialNetworkConnectionsAsync } from '../../redux/services/connectionService';
import { ASYNC_STATUS } from '../../config/constants';
import { useSelectedBusiness } from '../../hooks/useSelectedBusiness';
import { AppDispatch } from '../../types/store.types';
import { makeAcceptConnectionModalStyles } from './AcceptConnectionModal.styles';
import BusinessRolePicker, { BusinessRole, rolesPayload } from '../connections/BusinessRolePicker';

const { width } = Dimensions.get('window');

interface AcceptConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (businessIds: number[], socialNetworkIds: number[], businessRoles?: Record<number, BusinessRole>) => void;
  loading?: boolean;
  targetAccountType?: string;
}

const AcceptConnectionModal: React.FC<AcceptConnectionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
  targetAccountType,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeAcceptConnectionModalStyles(themeColors), [themeColors]);
  const isBusiness = isBusinessRole();

  const { businesses } = useSelectedBusiness();
  const businessesStatus = useSelector((state: any) => state.business_slice?.get_businesses_status);

  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([]);
  const [bizRoles, setBizRoles] = useState<Record<string, BusinessRole>>({});
  const [showSocialMedia, setShowSocialMedia] = useState<boolean>(false);
  const [selectedSocialNetworkIds, setSelectedSocialNetworkIds] = useState<string[]>([]);
  const [socialNetworkOptions, setSocialNetworkOptions] = useState<{ label: string; value: string }[]>([]);
  const [socialLoading, setSocialLoading] = useState<boolean>(false);

  const businessOptions = businesses
    ?.filter((b: any) => b?.id && b?.businessname)
    .map((b: any) => ({ label: b.businessname, value: String(b.id) })) ?? [];

  useEffect(() => {
    if (visible) {
      setSelectedBusinessIds([]);
      setBizRoles({});
      setShowSocialMedia(false);
      setSelectedSocialNetworkIds([]);
      setSocialNetworkOptions([]);
      dispatch(getBusinessesAsync() as any);
    }
  }, [visible, dispatch]);

  useEffect(() => {
    if (!showSocialMedia || !visible) {
      setSocialNetworkOptions([]);
      setSelectedSocialNetworkIds([]);
      return;
    }

    const accountType = targetAccountType ?? (isBusiness ? 'Business' : 'Personal');

    const fetchSocial = async () => {
      setSocialLoading(true);
      try {
        const params: { targetAccountType: string; businessIds?: number[] } = {
          targetAccountType: accountType,
        };
        if (isBusiness && selectedBusinessIds.length > 0) {
          params.businessIds = selectedBusinessIds.map(Number);
        }
        const result = await dispatch(getSocialNetworkConnectionsAsync(params)).unwrap();
        const setups = result?.usersocialnetworksetups ?? result ?? [];
        setSocialNetworkOptions(
          setups.map((item: any) => ({
            label: `${item?.businessid ? item.business.businessname : item.socialnetworktypename || 'Social'} - ${item.accountname || item.username || item.url || ''}`,
            value: String(item.id),
          })),
        );
      } catch {
        setSocialNetworkOptions([]);
      } finally {
        setSocialLoading(false);
      }
    };
    fetchSocial();
  }, [showSocialMedia, visible, selectedBusinessIds, isBusiness, targetAccountType, dispatch]);

  const handleConfirm = useCallback(() => {
    onConfirm(
      selectedBusinessIds.map(Number),
      selectedSocialNetworkIds.map(Number),
      isBusiness ? rolesPayload(selectedBusinessIds, bizRoles) : undefined,
    );
  }, [onConfirm, selectedBusinessIds, selectedSocialNetworkIds, isBusiness, bizRoles]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !loading && onClose()}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {t('accept_connection_modal.title')}
          </Text>
          <Text style={styles.subtitle}>
            {t('accept_connection_modal.subtitle')}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Business selector — only for business role accepting */}
            {isBusiness && (
              <View style={styles.field}>
                <Text style={styles.label}>
                  {t('accept_connection_modal.select_businesses_label')}
                </Text>
                {businessesStatus === ASYNC_STATUS.LOADING ? (
                  <ActivityIndicator size="small" color={themeColors.primary} style={{ marginVertical: 8 }} />
                ) : businessOptions.length > 0 ? (
                  <>
                    <CustomDropDown
                      options={businessOptions}
                      selectedItems={selectedBusinessIds}
                      onSelect={(val: any) => setSelectedBusinessIds(val as string[])}
                      placeholder={t('accept_connection_modal.select_businesses_placeholder')}
                      search={false}
                      leftIcon={true}
                      multiSelect={true}
                      style={styles.dropdownHeight}
                    />
                    <BusinessRolePicker selected={selectedBusinessIds} options={businessOptions} roles={bizRoles} onChange={setBizRoles} />
                  </>
                ) : (
                  <Text style={styles.emptyText}>
                    {t('add_connection_modal.no_businesses_found')}
                  </Text>
                )}
              </View>
            )}

            {/* Show Social Media Handles Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>
                {t('accept_connection_modal.show_social_media_label')}
              </Text>
              <Switch
                value={showSocialMedia}
                onValueChange={setShowSocialMedia}
                trackColor={{
                  false: colors.lightGray,
                  true: getColorWithOpacity(themeColors.primary, 0.5),
                }}
                thumbColor={showSocialMedia ? themeColors.secondary : colors.gray}
                ios_backgroundColor={colors.lightGray}
                style={styles.switchScale}
              />
            </View>

            {/* Social Media multi-select */}
            {showSocialMedia && (
              <View style={styles.field}>
                <Text style={styles.label}>
                  {t('add_connection_modal.select_social_media_label')}
                </Text>
                {socialLoading ? (
                  <ActivityIndicator size="small" color={themeColors.primary} style={{ marginVertical: 8 }} />
                ) : socialNetworkOptions.length > 0 ? (
                  <CustomDropDown
                    options={socialNetworkOptions}
                    selectedItems={selectedSocialNetworkIds}
                    onSelect={(val: any) => setSelectedSocialNetworkIds(val as string[])}
                    placeholder={t('add_connection_modal.select_social_media_placeholder')}
                    search={false}
                    leftIcon={true}
                    multiSelect={true}
                    style={styles.dropdownHeight}
                  />
                ) : (
                  <Text style={styles.emptyText}>
                    {t('add_connection_modal.no_social_media_found')}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonRow}>
            <PrimaryButton
              title={t('common.cancel') || 'Cancel'}
              onPress={onClose}
              variant="outline"
              buttonStyle={[styles.btn, { borderColor: themeColors.darkGreen }]}
              textStyle={{ color: themeColors.darkGreen }}
              disabled={loading}
            />
            <PrimaryButton
              title={t('accept_connection_modal.accept_button')}
              onPress={handleConfirm}
              buttonStyle={[styles.btn, { backgroundColor: themeColors.darkGreen }]}
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AcceptConnectionModal;
