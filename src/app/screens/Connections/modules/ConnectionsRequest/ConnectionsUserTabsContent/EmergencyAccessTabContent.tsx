import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import colors, { getColorWithOpacity } from '../../../../../../utils/colors';
import { DASHBOARD_GROUPS } from '../../../../../../utils/staticData';
import { CustomEditPermissionAccessModal, PrimaryButton } from '../../../../../../components/common';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import CustomListItemCard from '../../../../../../components/CustomCards/CustomListItemCard';
import { ListItem } from './ConnectionsUserTabsContent.types';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../../hooks/useSubscriptionGate';
import { makeEmergencyAccessStyles } from './EmergencyAccessTabContent.styles';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { sendEmergencyRequest, getConnectionEmergencySummary } from '../../../../../../redux/services/sharingService';
import { showSuccessToast, showErrorToast } from '../../../../../../components/common/CustomToast';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { getBusinessSections } from '../../../../Business/Business';
import { setEmergencyConnectionBusinessId } from '../../../../../../redux/slices/connectionSlice';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import type { EmergencyAccessStatus } from '../../../../../../services/emergencyAccess';
import EmergencyStatusPanel from './EmergencyStatusPanel';

interface EmergencyAccessTabContentProps {
  loading: boolean;
  data: any;
  connectionId: string | number;
  userName?: string;
  /** Emergency access in both directions, with countdowns. Null: not loaded, or the API has no status. */
  status?: EmergencyAccessStatus | null;
  statusLoading?: boolean;
  /** Reload the status (after a request, approval, cancel, or when a timer ends). */
  onStatusChanged?: () => void;
}

const EmergencyAccessTabContent = ({ loading, data, connectionId, userName, status, statusLoading, onStatusChanged }: EmergencyAccessTabContentProps) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeEmergencyAccessStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const dispatch = useDispatch<AppDispatch>();

  const businessSections = useMemo(() => getBusinessSections(t), [t]);

  const [permissionModalVisible, setPermissionModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const [requestModalVisible, setRequestModalVisible] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);

  const { send_emergency_request_status, currentConnection, emergencyConnectionBusinessId } = useSelector((state: any) => state.connection_slice);

  const isSendingRequest = send_emergency_request_status === ASYNC_STATUS.LOADING;

  const { user_data } = useSelector((state: any) => state.user_auth);
  const isCurrentUserReceiver = user_data?.id === currentConnection?.receiveruserid;

  const businessList: any[] = isCurrentUserReceiver
    ? (currentConnection?.senderbusinesses ?? [])
    : (currentConnection?.receiverbusinesses ?? []);

  // Set first business as default once businessList is available
  useEffect(() => {
    if (isBusinessRole() && businessList.length > 0) {
      const alreadySaved = emergencyConnectionBusinessId
        ? businessList.find((b: any) => b.id === emergencyConnectionBusinessId)
        : null;

      const toSelect = alreadySaved ?? businessList[0];
      setSelectedBusiness(toSelect);

      if (!emergencyConnectionBusinessId) {
        dispatch(setEmergencyConnectionBusinessId(toSelect.id));
      }
    }
  }, [businessList.length]);

  const handleSelectBusiness = useCallback((business: any) => {
    setSelectedBusiness(business);                              // update local display
    dispatch(setEmergencyConnectionBusinessId(business?.id));  // persist to Redux
    setDropdownOpen(false);
  }, [dispatch]);

  const handleEditPermission = useCallback((item: ListItem): void => {
    setSelectedItem(item);
    setPermissionModalVisible(true);
  }, []);

  const handleItemPress = useCallback((item: ListItem): void => {
    checkSubscription(() => {
      navigation.navigate(item.screenRoute as any, { from: 'emergency_access' });
    }, isBusinessRole() ? 'business' : 'personal');
  }, [navigation, checkSubscription, isBusinessRole]);

  const handleSavePermissions = useCallback((): void => {
    setPermissionModalVisible(false);
  }, []);

  const handleSendRequest = useCallback((): void => {
    Keyboard.dismiss();
    dispatch(sendEmergencyRequest({ connectionId, reason }))
      .then(unwrapResult)
      .then(() => {
        setRequestModalVisible(false);
        setReason('');
        showSuccessToast(t('emergency_access_tab.request_sent_success'));
        dispatch(getConnectionEmergencySummary({ id: connectionId }));
        onStatusChanged?.();
      })
      .catch((err: any) => {
        setRequestModalVisible(false);
        setReason('');
        const message = t('emergency_access_tab.request_sent_error');
        showErrorToast(message);
      });
  }, [dispatch, connectionId, reason, t, onStatusChanged]);

  const renderSection = (title: string, items: ListItem[]): React.ReactElement => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.listContainer}>
        {items.map((item: any) => (
          <View key={item.id} style={styles.itemWrapper}>
            <CustomListItemCard
              item={item}
              onPress={() => handleItemPress(item)}
            />
          </View>
        ))}
      </View>
    </View>
  );

  // Real text only — never a raw entitytype/stateofformation id.
  const isRealText = (val: any): boolean => {
    const text = String(val ?? '').trim();
    return !!text && !/^\d+$/.test(text);
  };

  const buildSubtitle = (biz: any): string => {
    const parts: string[] = [];

    if (isRealText(biz?.entitytypelabel)) {
      parts.push(String(biz.entitytypelabel).trim());
    } else if (isRealText(biz?.entitytype)) {
      parts.push(
        String(biz.entitytype)
          .split('_')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      );
    }

    if (isRealText(biz?.statelabel)) {
      parts.push(String(biz.statelabel).trim());
    } else if (isRealText(biz?.stateofformation)) {
      parts.push(String(biz.stateofformation).trim());
    }

    return parts.length ? parts.join(' - ') : '-';
  };

  const renderBusinessSelector = (): React.ReactElement | null => {
    if (!isBusinessRole()) return null;

    const initial = selectedBusiness?.businessname?.charAt(0)?.toUpperCase() ?? '?';
    const hasMultiple = businessList.length > 1;

    return (
      <View style={styles.selectorWrapper}>
        <TouchableOpacity
          style={styles.selectedCard}
          onPress={() => hasMultiple && setDropdownOpen(prev => !prev)}
          activeOpacity={hasMultiple ? 0.7 : 1}
        >
          <View style={[styles.avatar, { backgroundColor: getColorWithOpacity(themeColors.primary, 0.15) }]}>
            <Text style={[styles.avatarText, { color: themeColors.primary }]}>{initial}</Text>
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {selectedBusiness?.businessname ?? t('emergency_access_tab.select_business')}
            </Text>
            {selectedBusiness && (
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {buildSubtitle(selectedBusiness)}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {dropdownOpen && hasMultiple && (
          <View style={styles.dropdownList}>
            {businessList.map((biz: any, index: number) => {
              const isSelected = selectedBusiness?.id === biz.id;
              const bizInitial = biz.businessname?.charAt(0)?.toUpperCase() ?? '?';
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    index < businessList.length - 1 && styles.dropdownItemBorder,
                    isSelected && { backgroundColor: getColorWithOpacity(themeColors.primary, 0.06) },
                  ]}
                  onPress={() => handleSelectBusiness(biz)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatar, styles.avatarSmall, { backgroundColor: getColorWithOpacity(themeColors.primary, 0.15) }]}>
                    <Text style={[styles.avatarText, styles.avatarTextSmall, { color: themeColors.primary }]}>{bizInitial}</Text>
                  </View>
                  <View style={styles.cardTextContainer}>
                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]} numberOfLines={1}>
                      {biz.businessname}
                    </Text>
                    <Text style={styles.dropdownItemSubtitle} numberOfLines={1}>
                      {buildSubtitle(biz)}
                    </Text>
                  </View>
                  {isSelected && <Text style={[styles.checkmark, { color: themeColors.primary }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderBusinessContent = (): React.ReactElement => (
    <>
      {renderBusinessSelector()}
      {businessSections.map(section => {
        const flatItems: ListItem[] = section.items.flatMap(item =>
          item.expandable && item.subItems && item.subItems.length > 0
            ? item.subItems.map(sub => ({
              id: sub.id,
              titleKey: sub.titleKey,
              icon: sub.icon,
              screenRoute: sub.route ?? '',
            }))
            : [{
              id: item.id,
              titleKey: item.titleKey,
              subtitleKey: item.subtitleKey,
              icon: item.icon,
              screenRoute: item.screenRoute ?? '',
            }],
        );
        return renderSection(section.title, flatItems);
      })}
    </>
  );

  if (loading || (statusLoading && !status)) {
    return (
      <View style={styles.emptyStateContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  // The records someone with granted access can open.
  const renderRecords = (): React.ReactElement => (
    <View style={styles.container}>
      {isBusinessRole() ? (
        renderBusinessContent()
      ) : (
        <>
          {DASHBOARD_GROUPS.map(group => (
            <React.Fragment key={group.key}>{renderSection(t(group.titleKey), group.items as ListItem[])}</React.Fragment>
          ))}
        </>
      )}
    </View>
  );

  const renderContent = (): React.ReactElement => {
    // Both directions with countdowns, when the API gives a status.
    if (status) {
      return (
        <EmergencyStatusPanel
          status={status}
          name={userName || status.otherUserName}
          onChanged={() => {
            onStatusChanged?.();
            dispatch(getConnectionEmergencySummary({ id: connectionId }));
          }}
          onRequest={() => checkSubscription(() => setRequestModalVisible(true), isBusinessRole() ? 'business' : 'personal')}
          grantedContent={renderRecords()}
        />
      );
    }

    // State 1 — no request sent yet
    if (!data?.isrequested) {
      return (
        <View style={styles.sectionContainer}>
          <Text style={styles.title}>{t('emergency_access_tab.request_title')}</Text>
          <Text style={styles.subtitle}>{t('emergency_access_tab.request_subtitle')}</Text>
          <PrimaryButton
            title={t('emergency_access_tab.request_access')}
            onPress={() => checkSubscription(() => setRequestModalVisible(true), isBusinessRole() ? 'business' : 'personal')}
            variant="primary"
            buttonStyle={styles.button}
          />
        </View>
      );
    }

    // State 2 — request sent, waiting for response
    if (data?.isrequested && data?.status === 'Pending') {
      return (
        <View style={styles.sectionContainer}>
          <Text style={styles.title}>{t('emergency_access_tab.pending_title')}</Text>
          <Text style={styles.subtitle}>
            {t('emergency_access_tab.pending_subtitle')}
          </Text>
          <PrimaryButton
            title={t('business.add_compliance_record.status_pending')}
            variant="primary"
            onPress={() => { }}
            disabled
            buttonStyle={[styles.button, styles.pendingButton]}
            textStyle={styles.pendingButtonText}
          />
        </View>
      );
    }

    // State 3 — emergency access granted, show content
    return (
      <View style={styles.container}>
        {isBusinessRole() ? (
          renderBusinessContent()
        ) : (
          <>
            {DASHBOARD_GROUPS.map(group => (
              <React.Fragment key={group.key}>{renderSection(t(group.titleKey), group.items as ListItem[])}</React.Fragment>
            ))}
          </>
        )}

        <CustomEditPermissionAccessModal
          visible={permissionModalVisible}
          onClose={() => setPermissionModalVisible(false)}
          onSave={handleSavePermissions}
          itemTitle={selectedItem?.title}
        />
      </View>
    );
  };

  return (
    <>
      {renderContent()}

      <Modal
        visible={requestModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isSendingRequest && setRequestModalVisible(false)}
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {t('emergency_access_tab.modal_title')}
              </Text>

              <TextInput
                style={styles.reasonInput}
                placeholder={t('emergency_access_tab.reason_placeholder')}
                placeholderTextColor={colors.gray}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isSendingRequest}
              />

              <PrimaryButton
                title={isSendingRequest ? t('common.loading') : t('emergency_access_tab.send_request')}
                onPress={handleSendRequest}
                loading={isSendingRequest}
                disabled={isSendingRequest || !reason.trim()}
                buttonStyle={styles.modalButton}
              />
              <PrimaryButton
                title={t('common.cancel')}
                onPress={() => {
                  setRequestModalVisible(false);
                  setReason('');
                }}
                variant="outline"
                disabled={isSendingRequest}
                buttonStyle={[styles.modalButton, { borderColor: themeColors.darkGreen }]}
                textStyle={{ color: themeColors.darkGreen }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      {GateModal}
    </>
  );
};

export default EmergencyAccessTabContent;
