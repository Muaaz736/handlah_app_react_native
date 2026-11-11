import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import colors, { getColorWithOpacity } from '../../utils/colors';
import CustomDropDown from '../common/CustomDropDown';
import PrimaryButton from '../common/PrimaryButton';
import CustomScrollableTabs from '../common/CustomScrollableTabs';
import { useUserRole } from '../../hooks/useUserRole';
import { useSelectedBusiness } from '../../hooks/useSelectedBusiness';
import { getSocialNetworkConnectionsAsync } from '../../redux/services/connectionService';
import { getBusinessesAsync } from '../../redux/services/businessService';
import { useTranslation } from 'react-i18next';
import { AppDispatch } from '../../types/store.types';
import { makeAcceptBothConnectionModalStyles } from './AcceptBothConnectionModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import BusinessRolePicker, { BusinessRole, rolesPayload } from '../connections/BusinessRolePicker';

const getModeTabs = (accountType: 'Personal' | 'Business') => [
  { label: `${accountType} Only`, value: 'single' },
  { label: 'Personal & Business Both', value: 'both' },
];

type AcceptMode = 'single' | 'both';

export interface AcceptSinglePayload {
  businessIds: number[];
  socialNetworkIds: number[];
  businessRoles?: Record<number, BusinessRole>;
}

export interface AcceptBothPayload {
  personalSocialNetworkIds: number[];
  businessIds: number[];
  businessSocialNetworkIds: number[];
  businessRoles?: Record<number, BusinessRole>;
}

interface AcceptBothConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  /** Accept only the current-side request with its relevant data */
  onAcceptSingle: (payload: AcceptSinglePayload) => void;
  /** Accept both sides */
  onAcceptBoth: (payload: AcceptBothPayload) => void;
  loading?: boolean;
  currentAccountType: 'Personal' | 'Business';
}

const AcceptBothConnectionModal: React.FC<AcceptBothConnectionModalProps> = ({
  visible,
  onClose,
  onAcceptSingle,
  onAcceptBoth,
  loading = false,
  currentAccountType,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAcceptBothConnectionModalStyles(themeColors as RoleTheme), [themeColors]);
  const { businesses } = useSelectedBusiness();

  const modeTabs = getModeTabs(currentAccountType);
  const isPersonal = currentAccountType === 'Personal';

  const [modeIndex, setModeIndex] = useState<number>(0);
  const mode: AcceptMode = (modeTabs[modeIndex]?.value as AcceptMode) ?? 'single';

  // Business section
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([]);
  const [bizRoles, setBizRoles] = useState<Record<string, BusinessRole>>({});
  const [showBizSocial, setShowBizSocial] = useState<boolean>(false);
  const [bizSocialOptions, setBizSocialOptions] = useState<{ label: string; value: string }[]>([]);
  const [bizSocialIds, setBizSocialIds] = useState<string[]>([]);
  const [bizSocialLoading, setBizSocialLoading] = useState<boolean>(false);

  // Personal social section (available in both modes)
  const [showPersonalSocial, setShowPersonalSocial] = useState<boolean>(false);
  const [personalSocialOptions, setPersonalSocialOptions] = useState<{ label: string; value: string }[]>([]);
  const [personalSocialIds, setPersonalSocialIds] = useState<string[]>([]);
  const [personalSocialLoading, setPersonalSocialLoading] = useState<boolean>(false);

  const businessOptions = businesses
    ?.filter((b: any) => b?.id && b?.businessname)
    .map((b: any) => ({ label: b.businessname, value: String(b.id) })) ?? [];

  // Reset on open
  useEffect(() => {
    if (visible) {
      setModeIndex(0);
      setSelectedBusinessIds([]);
      setBizRoles({});
      setShowBizSocial(false);
      setBizSocialOptions([]);
      setBizSocialIds([]);
      setShowPersonalSocial(false);
      setPersonalSocialOptions([]);
      setPersonalSocialIds([]);
      dispatch(getBusinessesAsync() as any);
    }
  }, [visible, dispatch]);

  // Fetch business social when toggle on:
  // - 'both' mode (always has biz section)
  // - 'single' mode when currentAccountType === 'Business'
  useEffect(() => {
    if (!showBizSocial || !visible) {
      setBizSocialOptions([]);
      setBizSocialIds([]);
      return;
    }
    let cancelled = false;
    const fetchBiz = async () => {
      setBizSocialLoading(true);
      try {
        const params: any = { targetAccountType: 'Business' };
        if (selectedBusinessIds.length > 0) {
          params.businessIds = selectedBusinessIds.map(Number);
        }
        const res = await dispatch(getSocialNetworkConnectionsAsync(params)).unwrap();
        if (cancelled) return;
        const setups = res?.usersocialnetworksetups ?? res ?? [];
        setBizSocialOptions(
          setups.map((item: any) => ({
            label: `${item?.businessid ? item.business?.businessname : item.socialnetworktypename || 'Social'} - ${item.accountname || item.username || item.url || ''}`,
            value: String(item.id),
          })),
        );
      } catch {
        if (!cancelled) setBizSocialOptions([]);
      } finally {
        if (!cancelled) setBizSocialLoading(false);
      }
    };
    fetchBiz();
    return () => { cancelled = true; };
  }, [showBizSocial, selectedBusinessIds, visible, dispatch]);

  // fetch personal social when toggle on:
  // - 'both' mode (always has personal section)
  // - 'single' mode when currentAccountType === 'Personal'
  useEffect(() => {
    if (!showPersonalSocial || !visible) {
      setPersonalSocialOptions([]);
      setPersonalSocialIds([]);
      return;
    }
    let cancelled = false;
    const fetchPersonal = async () => {
      setPersonalSocialLoading(true);
      try {
        const res = await dispatch(
          getSocialNetworkConnectionsAsync({ targetAccountType: 'Personal' }),
        ).unwrap();
        if (cancelled) return;
        const setups = res?.usersocialnetworksetups ?? res ?? [];
        setPersonalSocialOptions(
          setups.map((item: any) => ({
            label: `${item.socialnetworktypename || 'Social'} - ${item.accountname || item.username || item.url || ''}`,
            value: String(item.id),
          })),
        );
      } catch {
        if (!cancelled) setPersonalSocialOptions([]);
      } finally {
        if (!cancelled) setPersonalSocialLoading(false);
      }
    };
    fetchPersonal();
    return () => { cancelled = true; };
  }, [showPersonalSocial, visible, dispatch]);

  const handleAccept = useCallback(() => {
    if (mode === 'single') {
      if (isPersonal) {
        // Personal side: only personal social ids
        onAcceptSingle({
          businessIds: [],
          socialNetworkIds: showPersonalSocial ? personalSocialIds.map(Number) : [],
        });
      } else {
        // Business side: business IDs + business social ids
        onAcceptSingle({
          businessIds: selectedBusinessIds.map(Number),
          socialNetworkIds: showBizSocial ? bizSocialIds.map(Number) : [],
          businessRoles: rolesPayload(selectedBusinessIds, bizRoles),
        });
      }
    } else {
      onAcceptBoth({
        personalSocialNetworkIds: showPersonalSocial ? personalSocialIds.map(Number) : [],
        businessIds: selectedBusinessIds.map(Number),
        businessSocialNetworkIds: showBizSocial ? bizSocialIds.map(Number) : [],
        businessRoles: rolesPayload(selectedBusinessIds, bizRoles),
      });
    }
  }, [
    mode,
    isPersonal,
    onAcceptSingle,
    onAcceptBoth,
    showPersonalSocial,
    personalSocialIds,
    selectedBusinessIds,
    bizRoles,
    showBizSocial,
    bizSocialIds,
  ]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !loading && onClose()}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('connections_request.request')}</Text>
          <Text style={styles.subtitle}>
            {t('connections_request.message')}
          </Text>

          {/* Mode tabs — styled like CustomAddConnectionModal */}
          <CustomScrollableTabs
            tabs={modeTabs}
            activeTab={modeIndex as any}
            onTabChange={(index: number) => setModeIndex(index)}
            showViewAll={false}
            innerTabStyle={styles.innerTabStyle}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            style={styles.scroll}
          >
            {/* SINGLE mode */}

            {mode === 'single' && isPersonal && (
              // Personal Only: personal social toggle + dropdown
              <>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>
                    Do you want to share Personal Social media handles
                  </Text>
                  <Switch
                    value={showPersonalSocial}
                    onValueChange={setShowPersonalSocial}
                    trackColor={{
                      false: colors.lightGray,
                      true: getColorWithOpacity(themeColors.primary, 0.5),
                    }}
                    thumbColor={showPersonalSocial ? themeColors.secondary : colors.gray}
                    ios_backgroundColor={colors.lightGray}
                    style={styles.switchScale}
                  />
                </View>
                {showPersonalSocial && (
                  <View style={styles.field}>
                    {personalSocialLoading ? (
                      <ActivityIndicator size="small" color={themeColors.primary} style={styles.loader} />
                    ) : personalSocialOptions.length > 0 ? (
                      <CustomDropDown
                        options={personalSocialOptions}
                        selectedItems={personalSocialIds}
                        onSelect={(val: any) => setPersonalSocialIds(val as string[])}
                        placeholder="Select"
                        search={false}
                        leftIcon={false}
                        multiSelect={true}
                        style={styles.dropdown}
                      />
                    ) : (
                      <Text style={styles.emptyText}>No personal social media present</Text>
                    )}
                  </View>
                )}
              </>
            )}

            {mode === 'single' && !isPersonal && (
              // Business Only: business dropdown + business social toggle + dropdown
              <>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Select Business</Text>
                  {businessOptions.length > 0 ? (
                    <>
                      <CustomDropDown
                        options={businessOptions}
                        selectedItems={selectedBusinessIds}
                        onSelect={(val: any) => setSelectedBusinessIds(val as string[])}
                        placeholder="Select"
                        search={false}
                        leftIcon={false}
                        multiSelect={true}
                        style={styles.dropdown}
                      />
                      <BusinessRolePicker selected={selectedBusinessIds} options={businessOptions} roles={bizRoles} onChange={setBizRoles} />
                    </>
                  ) : (
                    <Text style={styles.emptyText}>No businesses found</Text>
                  )}
                </View>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>
                    Do you want to share Business Social media handles
                  </Text>
                  <Switch
                    value={showBizSocial}
                    onValueChange={setShowBizSocial}
                    trackColor={{
                      false: colors.lightGray,
                      true: getColorWithOpacity(themeColors.primary, 0.5),
                    }}
                    thumbColor={showBizSocial ? themeColors.secondary : colors.gray}
                    ios_backgroundColor={colors.lightGray}
                    style={styles.switchScale}
                  />
                </View>
                {showBizSocial && (
                  <View style={styles.field}>
                    {bizSocialLoading ? (
                      <ActivityIndicator size="small" color={themeColors.primary} style={styles.loader} />
                    ) : bizSocialOptions.length > 0 ? (
                      <CustomDropDown
                        options={bizSocialOptions}
                        selectedItems={bizSocialIds}
                        onSelect={(val: any) => setBizSocialIds(val as string[])}
                        placeholder="Select"
                        search={false}
                        leftIcon={false}
                        multiSelect={true}
                        style={styles.dropdown}
                      />
                    ) : (
                      <Text style={styles.emptyText}>No business social media present</Text>
                    )}
                  </View>
                )}
              </>
            )}

            {/* BOTH mode */}

            {mode === 'both' && (
              <>
                {/* Select Business */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>{t('connection_user_details.select_business')}</Text>
                  {businessOptions.length > 0 ? (
                    <>
                      <CustomDropDown
                        options={businessOptions}
                        selectedItems={selectedBusinessIds}
                        onSelect={(val: any) => setSelectedBusinessIds(val as string[])}
                        placeholder="Select"
                        search={false}
                        leftIcon={false}
                        multiSelect={true}
                        style={styles.dropdown}
                      />
                      <BusinessRolePicker selected={selectedBusinessIds} options={businessOptions} roles={bizRoles} onChange={setBizRoles} />
                    </>
                  ) : (
                    <Text style={styles.emptyText}>{t('connection_user_details.no_businesses_found')}</Text>
                  )}
                </View>

                {/* Business social toggle + dropdown */}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>
                    {t('connections_request.share_business_social_media')}
                  </Text>
                  <Switch
                    value={showBizSocial}
                    onValueChange={setShowBizSocial}
                    trackColor={{
                      false: colors.lightGray,
                      true: getColorWithOpacity(themeColors.primary, 0.5),
                    }}
                    thumbColor={showBizSocial ? themeColors.secondary : colors.gray}
                    ios_backgroundColor={colors.lightGray}
                    style={styles.switchScale}
                  />
                </View>
                {showBizSocial && (
                  <View style={styles.field}>
                    {bizSocialLoading ? (
                      <ActivityIndicator size="small" color={themeColors.primary} style={styles.loader} />
                    ) : bizSocialOptions.length > 0 ? (
                      <CustomDropDown
                        options={bizSocialOptions}
                        selectedItems={bizSocialIds}
                        onSelect={(val: any) => setBizSocialIds(val as string[])}
                        placeholder="Select"
                        search={false}
                        leftIcon={false}
                        multiSelect={true}
                        style={styles.dropdown}
                      />
                    ) : (
                      <Text style={styles.emptyText}>{t('connections_request.no_business_social_media')}</Text>
                    )}
                  </View>
                )}

                {/* Personal social toggle + dropdown */}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>
                    {t('connections_request.share_personal_social_media')}
                  </Text>
                  <Switch
                    value={showPersonalSocial}
                    onValueChange={setShowPersonalSocial}
                    trackColor={{
                      false: colors.lightGray,
                      true: getColorWithOpacity(themeColors.primary, 0.5),
                    }}
                    thumbColor={showPersonalSocial ? themeColors.secondary : colors.gray}
                    ios_backgroundColor={colors.lightGray}
                    style={styles.switchScale}
                  />
                </View>
                {showPersonalSocial && (
                  <View style={styles.field}>
                    {personalSocialLoading ? (
                      <ActivityIndicator size="small" color={themeColors.primary} style={styles.loader} />
                    ) : personalSocialOptions.length > 0 ? (
                      <CustomDropDown
                        options={personalSocialOptions}
                        selectedItems={personalSocialIds}
                        onSelect={(val: any) => setPersonalSocialIds(val as string[])}
                        placeholder="Select"
                        search={false}
                        leftIcon={false}
                        multiSelect={true}
                        style={styles.dropdown}
                      />
                    ) : (
                      <Text style={styles.emptyText}>{t('connections_request.no_personal_social_media')}</Text>
                    )}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <PrimaryButton
              title={t('common.cancel')}
              onPress={onClose}
              variant="outline"
              buttonStyle={[styles.btn, { borderColor: themeColors.darkGreen }]}
              textStyle={{ color: themeColors.darkGreen }}
              disabled={loading}
            />
            <PrimaryButton
              title={t('accept_connection_modal.accept_button')}
              onPress={handleAccept}
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

export default AcceptBothConnectionModal;
