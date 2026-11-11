import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Switch,
  Dimensions,
  Keyboard,
  FlatList,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import colors, { getColorWithOpacity } from '../../utils/colors';
import CustomDropDown from '../common/CustomDropDown';
import CustomInput from '../common/CustomInput';
import PrimaryButton from '../common/PrimaryButton';
import { showErrorToast } from '../common';
import ProfileAvatar from '../common/ProfileAvatar';
import { CATEGORY_TABS } from '../../utils/staticData';
import { useUserRole } from '../../hooks/useUserRole';
import { extractApiError } from '../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { updateConnectionAsync } from '../../redux/services/connectionService';
import {
  getHandlahUsersAsync,
  getSocialNetworkConnectionsAsync,
} from '../../redux/services/connectionService';
import { resetHandlahUsers } from '../../redux/slices/connectionSlice';
import { ASYNC_STATUS } from '../../config/constants';
import { HandlahUser } from '../../types/reduxTypes/connectionSlice.types';
import type {
  CustomEditPermissionAccessModalProps,
  EditConnectionFormData,
} from '../../types/customEditConnectionModal.types';
import { getBusinessesAsync } from '../../redux/services/businessService';
import { AppDispatch } from '../../types/store.types';
import { makeCustomEditConnectionModalStyles } from './CustomEditConnectionModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import BusinessRolePicker, { BusinessRole, rolesPayload } from '../connections/BusinessRolePicker';

const { height, width } = Dimensions.get('window');

const PAGE_SIZE = 10;

const CustomEditPermissionAccessModal: React.FC<CustomEditPermissionAccessModalProps> = ({
  visible,
  onClose,
  onSave,
  existingData,
  categoryList = [],
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [formData, setFormData] = useState<EditConnectionFormData>({
    username: '',
    category: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    isEmergencyContact: false,
  });
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeCustomEditConnectionModalStyles(themeColors as RoleTheme), [themeColors]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [userSearch, setUserSearch] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<HandlahUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dropdownY, setDropdownY] = useState<number>(0);
  const inputRef = useRef<View>(null);
  const modalContentRef = useRef<View>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { get_handlah_users_data, get_handlah_users_status } = useSelector(
    (state: any) => state.connection_slice,
  );

  const businesses = useSelector(
    (state: any) => state.business_slice?.get_businesses_data || [],
  );
  const businessesStatus = useSelector(
    (state: any) => state.business_slice?.get_businesses_status,
  );

  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([]);
  const [bizRoles, setBizRoles] = useState<Record<string, BusinessRole>>({});
  const [showSocialMedia, setShowSocialMedia] = useState<boolean>(false);
  const [selectedSocialNetworkIds, setSelectedSocialNetworkIds] = useState<string[]>([]);
  const [socialNetworkOptions, setSocialNetworkOptions] = useState<{ label: string; value: string }[]>([]);
  const [socialLoading, setSocialLoading] = useState<boolean>(false);

  // activeTab: 0 = Personal, 1 = Business, 2 = Personal & Business
  const showBusinessDropdown = activeTab === 1 || activeTab === 2;

  const getTargetAccountTypeFromTabIndex = (index: number): string => {
    if (index === 1) return 'Business';
    if (index === 2) return 'Both';
    return 'Personal';
  };

  const businessOptions = useMemo(() => {
    if (!Array.isArray(businesses) || businesses.length === 0) return [];
    return businesses
      .filter((b: any) => b && b.id && b.businessname)
      .map((b: any) => ({
        label: b.businessname as string,
        value: b.id.toString() as string,
      }));
  }, [businesses]);

  const users: HandlahUser[] = get_handlah_users_data?.users ?? [];
  const totalPages: number = get_handlah_users_data?.totalPages ?? 1;
  const isUsersLoading = get_handlah_users_status === ASYNC_STATUS.LOADING;

  const fetchUsers = useCallback(
    (search: string, page: number) => {
      dispatch(getHandlahUsersAsync({ search, page, pageSize: PAGE_SIZE, includeAllUsers: false }) as any);
    },
    [dispatch],
  );

  // Fetch businesses once when modal opens
  useEffect(() => {
    if (visible) {
      dispatch(getBusinessesAsync() as any);
    }
  }, [visible, dispatch]);

  useEffect(() => {
    if (!visible || !showSocialMedia) {
      setSocialNetworkOptions([]);
      return;
    }
    let cancelled = false;
    const fetchSocial = async () => {
      setSocialLoading(true);
      try {
        const targetAccountType = getTargetAccountTypeFromTabIndex(activeTab);
        const params: { targetAccountType: string; businessIds?: number[] } = {
          targetAccountType,
        };
        if (showBusinessDropdown && selectedBusinessIds.length > 0) {
          params.businessIds = selectedBusinessIds.map(Number);
        }
        const result = await dispatch(getSocialNetworkConnectionsAsync(params) as any).unwrap();
        if (cancelled) return;
        const setups = result?.usersocialnetworksetups ?? result ?? [];
        const options = setups.map((item: any) => ({
          label: `${item?.businessid ? item.business.businessname : item.socialnetworktypename || 'Social'} - ${item.accountname || item.username || item.url || ''}`,
          value: String(item.id),
        }));
        setSocialNetworkOptions(options);
      } catch {
        if (!cancelled) setSocialNetworkOptions([]);
      } finally {
        if (!cancelled) setSocialLoading(false);
      }
    };
    fetchSocial();
    return () => { cancelled = true; };
  }, [visible, showSocialMedia, activeTab, showBusinessDropdown, selectedBusinessIds, dispatch]);

  useEffect(() => {
    if (!dropdownOpen) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      dispatch(resetHandlahUsers());
      fetchUsers(userSearch, 1);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [userSearch, dropdownOpen]);

  const handleLoadMore = useCallback(() => {
    if (isUsersLoading) return;
    if (currentPage >= totalPages) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchUsers(userSearch, nextPage);
  }, [isUsersLoading, currentPage, totalPages, userSearch, fetchUsers]);

  const handleUserSelect = useCallback((user: HandlahUser) => {
    setSelectedUser(user);
    setUserSearch(user.username);
    setFormData(prev => ({ ...prev, username: user.username, toUserId: user.id }));
    setDropdownOpen(false);
    Keyboard.dismiss();
  }, []);

  const handleUsernameInputChange = useCallback(
    (value: string) => {
      setUserSearch(value);
      setSelectedUser(null);
      setFormData(prev => ({ ...prev, username: value }));
      if (!dropdownOpen) setDropdownOpen(true);
    },
    [dropdownOpen],
  );

  const handleUsernameInputFocus = useCallback(() => {
    setDropdownOpen(true);
    if (inputRef.current && modalContentRef.current) {
      inputRef.current.measureLayout(
        modalContentRef.current as any,
        (_x, y, _w, h) => {
          setDropdownY(y + h * 0.8);
        },
        () => { },
      );
    }
    if (userSearch.length === 0) {
      dispatch(resetHandlahUsers());
      fetchUsers('', 1);
    }
  }, [userSearch, fetchUsers, dispatch]);

  const getTargetAccountTabIndex = (targetAccountType?: string): number => {
    if (!targetAccountType) return 0;
    const normalized = String(targetAccountType).toLowerCase();
    if (normalized === 'personal') return 0;
    if (normalized === 'business') return 1;
    if (normalized === 'both') return 2;
    return 0;
  };

  // Initialize form with existing connection data when opening modal
  useEffect(() => {
    if (!visible) return;
    if (!existingData) return;

    const initialUsername = existingData.username ?? '';
    setFormData(prev => ({
      ...prev,
      username: initialUsername,
      category: existingData.connectionTypeId
        ? String(existingData.connectionTypeId)
        : existingData.category ?? prev.category,
      facebook: existingData.facebook ?? prev.facebook,
      instagram: existingData.instagram ?? prev.instagram,
      linkedin: existingData.linkedin ?? prev.linkedin,
      twitter: existingData.twitter ?? prev.twitter,
      isEmergencyContact:
        existingData.isEmergencyContact ?? prev.isEmergencyContact,
    }));

    // Pre-populate the search field with existing username
    setUserSearch(initialUsername);
    setActiveTab(getTargetAccountTabIndex(existingData.targetAccountType));

    // Pre-populate selected businesses from existing connection data
    const existingBizIds = existingData.senderbusinessids;

    if (Array.isArray(existingBizIds) && existingBizIds.length > 0) {
      setSelectedBusinessIds(existingBizIds.map(String));
    } else {
      setSelectedBusinessIds([]);
    }
    setBizRoles({ ...(existingData.businessroles ?? {}) });

    // Pre-populate selected social media accounts from existing connection data
    const existingSocialIds = existingData.socialnetworkids;

    if (Array.isArray(existingSocialIds) && existingSocialIds.length > 0) {
      setSelectedSocialNetworkIds(existingSocialIds.map(String));
      setShowSocialMedia(true);
    } else {
      setSelectedSocialNetworkIds([]);
      setShowSocialMedia(false);
    }
  }, [visible, existingData]);

  const handleTabChange = (index: number): void => {
    setActiveTab(index);
  };

  const handleInputChange = (field: keyof EditConnectionFormData, value: string | boolean): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (value: string | string[]): void => {
    const categoryValue = Array.isArray(value) ? value[0] : value;
    handleInputChange('category', categoryValue);
  };

  const handleSave = (): void => {
    Keyboard.dismiss();
    const connectionId = existingData?.connectionId;
    const toUserId = existingData?.toUserId;
    if (!connectionId || !toUserId) {
      if (onSave) onSave({ ...formData, connectionType: CATEGORY_TABS[activeTab].value });
      resetForm();
      onClose();
      return;
    }

    const targetAccountType =
      existingData?.targetAccountType ||
      (isBusinessRole() ? 'Business' : 'Personal');

    const payload: any = {
      connectionId,
      toUserId,
      connectionTypeId: Number(formData.category),
      targetAccountType,
      isEmergency: formData.isEmergencyContact,
    };

    if (showBusinessDropdown && selectedBusinessIds.length > 0) {
      payload.businessIds = selectedBusinessIds.map(Number);
      payload.businessRoles = rolesPayload(selectedBusinessIds, bizRoles);
    }

    if (showSocialMedia && selectedSocialNetworkIds.length > 0) {
      payload.socialNetworkIds = selectedSocialNetworkIds.map(Number);
    }

    setIsSaving(true);
    dispatch(updateConnectionAsync(payload))
      .then(unwrapResult)
      .then((result: any) => {
        if (onSave) onSave(result);
        onClose();
        resetForm();
      })
      .catch((error: any) => {
        showErrorToast(
          typeof error === 'string'
            ? error
            : extractApiError(error, 'Failed to update connection.'),
        );
      })
      .finally(() => setIsSaving(false));
  };

  const handleCancel = (): void => {
    Keyboard.dismiss();
    resetForm();
    onClose();
  };

  const resetForm = (): void => {
    setFormData({
      username: '',
      category: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: '',
      isEmergencyContact: false,
    });
    setActiveTab(0);
    setUserSearch('');
    setSelectedUser(null);
    setDropdownOpen(false);
    setCurrentPage(1);
    setSelectedBusinessIds([]);
    setShowSocialMedia(false);
    setSelectedSocialNetworkIds([]);
    setSocialNetworkOptions([]);
    dispatch(resetHandlahUsers());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <View style={styles.modalContainer}>
          <View
            ref={modalContentRef}
            collapsable={false}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{t('modals.edit_connection')}</Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.scrollContent]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {/* Tabs */}
              {/* <View style={styles.tabsContainer}>
                <CustomScrollableTabs
                  tabs={CATEGORY_TABS}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  showViewAll={false}
                  innerTabStyle={{ paddingHorizontal: 14 }}
                />
              </View> */}

              {/* Select Category */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('add_connection_modal.select_category_group')}</Text>
                <CustomDropDown
                  options={categoryList}
                  value={formData.category}
                  onSelect={(val: any) => handleCategorySelect(val)}
                  placeholder={t('common.select')}
                  leftIcon={true}
                  showArrow={true}
                  style={styles.dropdownHeight}
                />
              </View>

              {/* Business multi-select — shown when Business or Both tab is active */}
              {showBusinessDropdown && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    {t('add_connection_modal.select_business_label')}
                  </Text>
                  {businessesStatus === ASYNC_STATUS.LOADING ? (
                    <ActivityIndicator size="small" color={themeColors.primary} style={{ marginVertical: 8 }} />
                  ) : businessOptions.length > 0 ? (
                    <>
                      <CustomDropDown
                        options={businessOptions}
                        selectedItems={selectedBusinessIds}
                        onSelect={(val: any) => setSelectedBusinessIds(val as string[])}
                        placeholder={t('add_connection_modal.select_business_placeholder')}
                        search={false}
                        leftIcon={true}
                        multiSelect={true}
                        style={styles.dropdownHeight}
                      />
                      <BusinessRolePicker selected={selectedBusinessIds} options={businessOptions} roles={bizRoles} onChange={setBizRoles} />
                    </>
                  ) : (
                    <Text style={styles.emptyBusinessText}>
                      {t('add_connection_modal.no_businesses_found')}
                    </Text>
                  )}
                </View>
              )}

              {/* <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('modals.handlah_username')}</Text>
                <View
                  ref={inputRef}
                  collapsable={false}
                  style={styles.searchDropdownWrapper}
                >
                  <CustomInput
                    placeholder={t('modals.username_placeholder')}
                    value={userSearch}
                    onChangeText={handleUsernameInputChange}
                    onFocus={handleUsernameInputFocus}
                    autoCapitalize="none"
                    inputContainerStyle={styles.dropdownHeight}
                    editable={false}
                  />
                </View>
              </View> */}

              {/* Emergency Contact Toggle */}
              <View style={styles.emergencyContainer}>
                <Text style={styles.emergencyLabel}>
                  {t('modals.add_emergency_contact')}
                </Text>
                <Switch
                  value={formData.isEmergencyContact}
                  onValueChange={(value: boolean) =>
                    handleInputChange('isEmergencyContact', value)
                  }
                  trackColor={{
                    false: colors.lightGray,
                    true: getColorWithOpacity(themeColors.primary, 0.5),
                  }}
                  thumbColor={
                    formData.isEmergencyContact ? colors.white : colors.gray
                  }
                  ios_backgroundColor={colors.lightGray}
                  style={styles.switchScale}
                />
              </View>

              {/* Show social media toggle */}
              <View style={styles.emergencyContainer}>
                <Text style={styles.emergencyLabel}>{t('add_connection_modal.show_social_media_label')}</Text>
                <Switch
                  value={showSocialMedia}
                  onValueChange={(value: boolean) => setShowSocialMedia(value)}
                  trackColor={{
                    false: colors.lightGray,
                    true: getColorWithOpacity(themeColors.primary, 0.5),
                  }}
                  thumbColor={showSocialMedia ? colors.white : colors.gray}
                  ios_backgroundColor={colors.lightGray}
                  style={styles.switchScale}
                />
              </View>

              {/* Social media multi-select */}
              {showSocialMedia && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('add_connection_modal.select_social_media_label')}</Text>
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
                    <Text style={styles.emptyBusinessText}>
                      {t('add_connection_modal.no_social_media_found')}
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <View style={styles.buttonRow}>
                <PrimaryButton
                  title={t('common.cancel')}
                  onPress={handleCancel}
                  variant="outline"
                  buttonStyle={[styles.cancelButton, { borderColor: themeColors.darkGreen }]}
                  textStyle={{ color: themeColors.darkGreen }}
                />
                <PrimaryButton
                  title={t('common.save_changes')}
                  onPress={handleSave}
                  buttonStyle={styles.saveButton}
                  loading={isSaving}
                />
              </View>
            </View>

            {/* Search Dropdown Overlay */}
            {dropdownOpen && (
              <>
                <Pressable
                  style={styles.dropdownBackdrop}
                  onPress={() => {
                    setDropdownOpen(false);
                    Keyboard.dismiss();
                  }}
                />
                <View style={[styles.dropdownList, { top: dropdownY }]}>
                  {isUsersLoading && users.length === 0 ? (
                    <View style={styles.dropdownLoader}>
                      <ActivityIndicator size="small" color={themeColors.primary} />
                    </View>
                  ) : users.length === 0 ? (
                    <View style={styles.dropdownEmpty}>
                      <Text style={styles.dropdownEmptyText}>{t('common.no_users_found')}</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={users}
                      keyExtractor={item => String(item.id)}
                      keyboardShouldPersistTaps="handled"
                      style={styles.dropdownFlatList}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => handleUserSelect(item)}
                          activeOpacity={0.7}
                        >
                          <ProfileAvatar imageId={item.profilepicture} name={item.fullname} size={36} variant="neutral" />
                          <View style={styles.dropdownItemInfo}>
                            <Text style={styles.dropdownItemName}>{item.fullname}</Text>
                            <Text style={styles.dropdownItemUsername}>@{item.username}</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                      onEndReached={handleLoadMore}
                      onEndReachedThreshold={0.4}
                      ListFooterComponent={
                        isUsersLoading && users.length > 0 ? (
                          <ActivityIndicator
                            size="small"
                            color={themeColors.primary}
                            style={{ paddingVertical: 8 }}
                          />
                        ) : null
                      }
                    />
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CustomEditPermissionAccessModal;
