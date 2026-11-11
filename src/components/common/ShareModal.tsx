import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomDropDown from './CustomDropDown';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { ShareModalProps } from '../../types/common.types';
import PrimaryButton from './PrimaryButton';
import RadioButton from './RadioButton';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS } from '../../config/constants';
import {
  getSharedConnectedUsersAsync,
  getUnsharedConnectedUsersAsync,
} from '../../redux/services/connectionService';
import { AppDispatch } from '../../types/store.types';
import { makeShareModalStyles } from './ShareModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordLinkPicker } from '../recordLinks/RecordLinkPicker';
import { recordLinkKey, shareLinkedRecordsService, type LinkableRecord, type LinkedRecordSelection } from '../../services/recordLinks';
import { showErrorToast } from './CustomToast';

type PermissionType = 'read' | 'write';

// Sentinel value used for the "no users found" placeholder option.
// Must never be treated as a real user selection.
const NO_USERS_PLACEHOLDER = '__no_users__';

const getUserId = (user: any): string =>
  String(user?.sharedwithuserid ?? user?.userid ?? '');

const getUserLabel = (user: any): string => {
  const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim();
  return fullName || user?.username || user?.fullname || `User ${getUserId(user)}`;
};

const getUserPermission = (user: any): PermissionType =>
  user?.accesslevel === 'read' ? 'read' : 'write';

const normalizeUsers = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data.shares)) return data.shares;
  if (Array.isArray(data.users)) return data.users;
  return [];
};

const toDropdownOptions = (users: any[]) =>
  users
    .map(user => ({
      label: getUserLabel(user),
      value: getUserId(user),
    }))
    .filter(option => option.value !== '');

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  onShare,
  title = 'Share',
  alreadySharedWith = [],
  loading,
  resourceType,
  resourceId,
  businessId,
}) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeShareModalStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();

  const {
    get_unshared_connected_users_data,
    get_unshared_connected_users_status,
    get_shared_connected_users_data,
    get_shared_connected_users_status,
  } = useSelector((state: any) => state.connection_slice);

  const normalizedResourceType = resourceType?.trim().toLowerCase();

  const sharedUsers = useMemo(
    () => normalizeUsers(get_shared_connected_users_data),
    [get_shared_connected_users_data],
  );

  const unsharedUsers = useMemo(
    () => normalizeUsers(get_unshared_connected_users_data),
    [get_unshared_connected_users_data],
  );

  const derivedAlreadySharedWith = useMemo(() => {
    if (sharedUsers.length === 0) return alreadySharedWith;
    return sharedUsers
      .map(user => {
        const userId = getUserId(user);
        if (!userId) return null;
        return { userId, permission: getUserPermission(user) };
      })
      .filter(Boolean) as Array<{ userId: string; permission: PermissionType }>;
  }, [sharedUsers, alreadySharedWith]);

  const alreadySharedUserIds = useMemo(
    () => derivedAlreadySharedWith.map(item => item.userId),
    [derivedAlreadySharedWith],
  );

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Record<string, PermissionType>>({});

  // Linked records shared along with this record / module (as on the web): none by default, picked per person.
  const [linkOptions, setLinkOptions] = useState<LinkableRecord[]>([]);
  const [savedLinkPicks, setSavedLinkPicks] = useState<Map<number, LinkedRecordSelection>>(new Map());
  const [linkPicks, setLinkPicks] = useState<Record<string, LinkedRecordSelection>>({});
  const linkResourceId = resourceId != null && resourceId !== '' ? Number(resourceId) : null;
  const linkBusinessId = businessId != null && businessId !== '' ? Number(businessId) : null;

  useEffect(() => {
    if (!visible || !normalizedResourceType) return;
    let cancelled = false;
    Promise.all([
      shareLinkedRecordsService.getOptions(normalizedResourceType, linkResourceId, linkBusinessId),
      shareLinkedRecordsService.getSelections(normalizedResourceType, linkResourceId, linkBusinessId),
    ]).then(([options, selections]) => {
      if (cancelled) return;
      setLinkOptions(options);
      setSavedLinkPicks(selections);
      const picks: Record<string, LinkedRecordSelection> = {};
      selections.forEach((value, userId) => { picks[String(userId)] = value; });
      setLinkPicks(picks);
    });
    return () => { cancelled = true; };
  }, [visible, normalizedResourceType, linkResourceId, linkBusinessId]);

  const pickFor = (userId: string): LinkedRecordSelection => linkPicks[userId] ?? { keys: [], accessLevel: 'read' };
  const setPickFor = (userId: string, patch: Partial<LinkedRecordSelection>) =>
    setLinkPicks(prev => ({ ...prev, [userId]: { ...pickFor(userId), ...patch } }));

  /**
   * After the share is saved: store each person's linked-record pick that changed. A new person's share may take a
   * moment to exist, so a failed save is retried a few times before saying so.
   */
  const saveLinkPicks = async (userIds: string[]) => {
    const changed = userIds.filter(id => {
      const now = pickFor(id);
      const before = savedLinkPicks.get(Number(id));
      return JSON.stringify([...now.keys].sort()) !== JSON.stringify([...(before?.keys ?? [])].sort())
        || (now.keys.length > 0 && now.accessLevel !== (before?.accessLevel ?? 'read'));
    });
    for (const id of changed) {
      const pick = pickFor(id);
      let ok = false;
      for (let attempt = 0; attempt < 4 && !ok; attempt++) {
        if (attempt > 0) await new Promise(resolve => setTimeout(resolve, 1500));
        ok = await shareLinkedRecordsService.set({
          resourceType: normalizedResourceType,
          resourceId: linkResourceId,
          businessId: linkBusinessId,
          sharedWithUserId: Number(id),
          accessLevel: pick.accessLevel,
          keys: pick.keys,
        });
      }
      if (!ok) showErrorToast(t('record_links.shareSaveFailed'));
    }
  };

  const usersLoading =
    get_unshared_connected_users_status === ASYNC_STATUS.LOADING ||
    get_shared_connected_users_status === ASYNC_STATUS.LOADING;

  const optionsToUse = useMemo(() => {
    const sharedOptions = toDropdownOptions(sharedUsers);
    const unsharedOptions = toDropdownOptions(unsharedUsers);
    const merged = [...sharedOptions, ...unsharedOptions];
    const uniqueOptions = new Map<string, { label: string; value: string }>();
    merged.forEach(option => {
      if (!uniqueOptions.has(option.value)) {
        uniqueOptions.set(option.value, option);
      }
    });

    const result = Array.from(uniqueOptions.values());

    if (result.length === 0 && !usersLoading) {
      return [{ label: t('common.no_users_found'), value: NO_USERS_PLACEHOLDER, disabled: true }];
    }

    return result;
  }, [sharedUsers, unsharedUsers, usersLoading, t]);

  // Fetch users when modal opens
  useEffect(() => {
    if (!visible || !normalizedResourceType) return;

    const payload: any = { resourceType: normalizedResourceType };
    if (resourceId != null && resourceId !== '') payload.resourceId = resourceId;
    if (businessId != null && businessId !== '') payload.businessId = businessId;

    dispatch(getUnsharedConnectedUsersAsync(payload));
    dispatch(getSharedConnectedUsersAsync(payload));
  }, [dispatch, visible, normalizedResourceType, resourceId, businessId]);

  useEffect(() => {
    const initialPermissions: Record<string, PermissionType> = {};
    derivedAlreadySharedWith.forEach(item => {
      initialPermissions[item.userId] = item.permission === 'read' ? 'read' : 'write';
    });
    setSelectedUsers(alreadySharedUserIds);
    setPermissions(initialPermissions);
  }, [visible, alreadySharedUserIds.join(',')]);

  useEffect(() => {
    setPermissions(prev => {
      const newPermissions = { ...prev };
      let hasChanges = false;

      selectedUsers.forEach(userId => {
        if (!newPermissions[userId]) {
          newPermissions[userId] = 'read';
          hasChanges = true;
        }
      });

      Object.keys(newPermissions).forEach(userId => {
        if (!selectedUsers.includes(userId)) {
          delete newPermissions[userId];
          hasChanges = true;
        }
      });

      return hasChanges ? newPermissions : prev;
    });
  }, [selectedUsers]);

  const handlePermissionChange = (userId: string, permission: PermissionType) => {
    setPermissions(prev => ({ ...prev, [userId]: permission }));
  };

  // FIX: strip the placeholder sentinel before updating state so it can never
  // appear in selectedUsers regardless of what CustomDropDown passes back.
  const handleUserSelect = (value: string | string[]) => {
    const values = Array.isArray(value) ? value : [value];
    setSelectedUsers(values.filter(v => v !== NO_USERS_PLACEHOLDER));
  };

  const handleShare = () => {
    // if (get_shared_connected_users_data?.shares?.length === 0) return;
    if (selectedUsers.length === 0) {
      onShare([]);
      return;
    }

    // FIX: extra safety guard — exclude the placeholder from share payload in case
    // it somehow slips through (e.g. state restored from a stale closure).
    const shareData = selectedUsers
      .filter(userId => userId !== NO_USERS_PLACEHOLDER)
      .map(userId => ({
        sharedWithUserId: Number(userId),
        accessLevel: permissions[userId] || 'read',
      }));

    onShare(shareData);
    if (linkOptions.length > 0) void saveLinkPicks(shareData.map(x => String(x.sharedWithUserId)));

  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            {usersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.primary} />
              </View>
            ) : (
              <View style={styles.modalContainer}>
                <Text style={styles.title}>
                  {title || t('health_tracker.share')}
                </Text>

                <Text style={styles.subtitle}>
                  {t('modals.select_user_to_share')}
                </Text>

                <View style={styles.dropdownWrapper}>
                  <CustomDropDown
                    options={optionsToUse}
                    value={selectedUsers}
                    selectedItems={selectedUsers}
                    onSelect={(val: any) => handleUserSelect(val)}
                    placeholder={t('common.select')}
                    search={false}
                    containerStyle={styles.dropdown}
                    leftIcon={true}
                    multiSelect={true}
                  />
                </View>

                {selectedUsers.length > 0 && (
                  <ScrollView
                    style={styles.permissionScroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.permissionTitle}>
                      {t('modals.permission_access')}
                    </Text>

                    {selectedUsers.map(userId => {
                      const user = optionsToUse.find(u => u.value === userId);
                      if (!user) return null;

                      return (
                        <View key={userId} style={styles.permissionContainer}>
                          <Text style={styles.userName}>{user.label}</Text>
                          <View style={styles.radioGroup}>
                            <RadioButton
                              selected={permissions[userId] === 'read'}
                              onPress={() => handlePermissionChange(userId, 'read')}
                              label={t('modals.view')}
                              borderColor={colors.border}
                              fillColor={themeColors.primary}
                              innerSizeRatio={0.6}
                            />
                            <RadioButton
                              selected={permissions[userId] === 'write'}
                              onPress={() => handlePermissionChange(userId, 'write')}
                              label={t('modals.edit')}
                              borderColor={colors.border}
                              fillColor={themeColors.primary}
                              innerSizeRatio={0.6}
                            />
                          </View>
                          {linkOptions.length > 0 && (
                            <View style={{ marginTop: 10 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={[styles.permissionTitle, { marginBottom: 0, fontSize: 13 }]}>{t('record_links.shareTitle')}</Text>
                                <TouchableOpacity
                                  onPress={() => {
                                    const all = linkOptions.map(recordLinkKey);
                                    setPickFor(userId, { keys: pickFor(userId).keys.length === all.length ? [] : all });
                                  }}
                                >
                                  <Text style={{ fontSize: 12, color: themeColors.primary }}>
                                    {pickFor(userId).keys.length === linkOptions.length ? t('record_links.clearAll') : t('record_links.selectAll')}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                              <Text style={{ fontSize: 11, color: themeColors.textSecondary, marginVertical: 4 }}>{t('record_links.shareHint')}</Text>
                              <RecordLinkPicker
                                compact
                                options={linkOptions}
                                selected={pickFor(userId).keys}
                                onChange={keys => setPickFor(userId, { keys })}
                                placeholder={t('record_links.shareNone')}
                              />
                              {pickFor(userId).keys.length > 0 && (
                                <View style={[styles.radioGroup, { marginTop: 8 }]}>
                                  <Text style={{ fontSize: 12, color: themeColors.textSecondary }}>{t('record_links.shareAccess')}</Text>
                                  <RadioButton
                                    selected={pickFor(userId).accessLevel === 'read'}
                                    onPress={() => setPickFor(userId, { accessLevel: 'read' })}
                                    label={t('record_links.view')}
                                    borderColor={colors.border}
                                    fillColor={themeColors.primary}
                                    innerSizeRatio={0.6}
                                  />
                                  <RadioButton
                                    selected={pickFor(userId).accessLevel === 'write'}
                                    onPress={() => setPickFor(userId, { accessLevel: 'write' })}
                                    label={t('record_links.edit')}
                                    borderColor={colors.border}
                                    fillColor={themeColors.primary}
                                    innerSizeRatio={0.6}
                                  />
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>
                )}

                <View style={styles.buttonRow}>
                  <PrimaryButton
                    title={t('common.cancel')}
                    onPress={onClose}
                    buttonStyle={{
                      flex: 1,
                      paddingVertical: 10,
                      borderColor: themeColors.textPrimary,
                      borderWidth: 1,
                    }}
                    variant={'outline'}
                    textStyle={{ color: themeColors.textPrimary }}
                  />
                  <TouchableOpacity
                    style={[
                      styles.shareButton,
                      { backgroundColor: themeColors.primary },
                      loading && styles.disabledButton,
                    ]}
                    onPress={handleShare}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.shareButtonText}>{t('common.share')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ShareModal;
