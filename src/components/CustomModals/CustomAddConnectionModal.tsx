import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import colors, { getColorWithOpacity } from '../../utils/colors';
import CustomScrollableTabs from '../common/CustomScrollableTabs';
import CustomDropDown from '../common/CustomDropDown';
import CustomInput from '../common/CustomInput';
import PrimaryButton from '../common/PrimaryButton';
import ProfileAvatar from '../common/ProfileAvatar';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import {
  getHandlahUsersAsync,
  requestConnectionAsync,
  getSocialNetworkConnectionsAsync,
} from '../../redux/services/connectionService';
import { resetHandlahUsers } from '../../redux/slices/connectionSlice';
import { ASYNC_STATUS } from '../../config/constants';
import { HandlahUser } from '../../types/reduxTypes/connectionSlice.types';
import type {
  CustomAddConnectionModalProps,
  ConnectionFormData,
} from '../../types/customAddConnectionModal.types';
import { showErrorToast } from '../common';
import { useFocusEffect } from '@react-navigation/native';
import { getBusinessesAsync } from '../../redux/services/businessService';
import { BusinessOption } from '../../app/screens/Business/Business.types';
import { useSelectedBusiness } from '../../hooks/useSelectedBusiness';
import { AppDispatch } from '../../types/store.types';
import { makeCustomAddConnectionModalStyles } from './CustomAddConnectionModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import BusinessRolePicker, { BusinessRole, rolesPayload } from '../connections/BusinessRolePicker';

const { height, width } = Dimensions.get('window');
const PAGE_SIZE = 10;

const connectionTypes = [
  { label: 'Personal', value: 'Personal' },
  { label: 'Business', value: 'Business' },
  { label: 'Personal & Business', value: 'Both' },
];

const INITIAL_FORM: ConnectionFormData = {
  toUserId: '',
  connectionTypeId: '',
  facebook: '',
  instagram: '',
  linkedin: '',
  twitter: '',
  isEmergencyContact: false,
};

const CustomAddConnectionModal: React.FC<CustomAddConnectionModalProps> = ({
  visible,
  onClose,
  onSave,
  categoryList,
}) => {
  const { t } = useTranslation();
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeCustomAddConnectionModalStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ConnectionFormData>(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([]);
  const [bizRoles, setBizRoles] = useState<Record<string, BusinessRole>>({});
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const [selectedSocialNetworkIds, setSelectedSocialNetworkIds] = useState<string[]>([]);
  const [socialNetworkOptions, setSocialNetworkOptions] = useState<{ label: string; value: string }[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usernameInputRef = useRef<any>(null);

  const { get_handlah_users_data, get_handlah_users_status } = useSelector(
    (state: any) => state.connection_slice,
  );
  const businessesStatus = useSelector((state: any) => state.business_slice?.get_businesses_status);
  const { businesses } = useSelectedBusiness();

  const users: HandlahUser[] = get_handlah_users_data?.users ?? [];
  const totalPages: number = get_handlah_users_data?.totalPages ?? 1;
  const isUsersLoading = get_handlah_users_status === ASYNC_STATUS.LOADING;
  const showBusinessDropdown = activeTab === 'Business' || activeTab === 'Both';

  const primaryTrackColor = useMemo(
    () => getColorWithOpacity(themeColors.primary, 0.5),
    [themeColors.primary],
  );

  const isBusiness = isBusinessRole();

  useEffect(() => {
    if (!visible) return;
    setActiveTab(isBusiness ? 'Business' : 'Personal');
    setActiveIndex(isBusiness ? 1 : 0);
  }, [isBusiness, visible]);

  useFocusEffect(
    useCallback(() => {
      dispatch(getBusinessesAsync());
    }, [dispatch]),
  );

  const businessOptions: BusinessOption[] = useMemo(() => {
    if (!Array.isArray(businesses) || businesses.length === 0) return [];
    return businesses
      .filter((b: any) => b?.id && b?.businessname)
      .map((b: any) => ({
        label: b.businessname || 'Unnamed Business',
        value: b.id.toString(),
      }));
  }, [businesses]);

  useEffect(() => {
    if (!showSocialMedia || !activeTab) {
      setSocialNetworkOptions([]);
      setSelectedSocialNetworkIds([]);
      return;
    }
    let cancelled = false;
    const fetchSocial = async () => {
      setSocialLoading(true);
      try {
        const params: { targetAccountType: string; businessIds?: number[] } = {
          targetAccountType: activeTab,
        };
        if ((activeTab === 'Business' || activeTab === 'Both') && selectedBusinessIds.length > 0) {
          params.businessIds = selectedBusinessIds.map(Number);
        }
        const result = await dispatch(getSocialNetworkConnectionsAsync(params)).unwrap();
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
  }, [showSocialMedia, activeTab, selectedBusinessIds, dispatch]);

  const fetchUsers = useCallback(
    (search: string, page: number) => {
      dispatch(
        getHandlahUsersAsync({
          targetAccountType: activeTab || 'Personal',
          search,
          page,
          pageSize: PAGE_SIZE,
          includeAllUsers: false,
        }),
      );
    },
    [dispatch, activeTab],
  );

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
  }, [userSearch, dropdownOpen, fetchUsers, dispatch]);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
    Keyboard.dismiss();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (isUsersLoading || currentPage >= totalPages) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchUsers(userSearch, nextPage);
  }, [isUsersLoading, currentPage, totalPages, userSearch, fetchUsers]);

  const handleUserSelect = useCallback(
    (user: HandlahUser) => {
      setUserSearch(user.username);
      setFormData(prev => ({ ...prev, toUserId: user.id }));
      closeDropdown();
    },
    [closeDropdown],
  );

  const handleUsernameInputChange = useCallback((value: string) => {
    setUserSearch(value);
    setFormData(prev => ({ ...prev, toUserId: '' }));
    setDropdownOpen(value.length > 0);
  }, []);

  const handleUsernameInputFocus = useCallback(() => {
    if (userSearch.length > 0) {
      setDropdownOpen(true);
    }
  }, [userSearch]);

  const handleTabChange = useCallback((index: number) => {
    setActiveIndex(index);
    setActiveTab(connectionTypes[index].value);
    closeDropdown();
  }, [closeDropdown]);

  const handleInputChange = useCallback(
    (field: keyof ConnectionFormData, value: string | boolean) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleCategorySelect = useCallback((value: string | string[] | null) => {
    const categoryValue = Array.isArray(value) ? value[0] : value ?? '';
    setFormData(prev => ({ ...prev, connectionTypeId: categoryValue }));
    closeDropdown();
  }, [closeDropdown]);

  const handleBusinessSelect = useCallback((values: string | string[]) => {
    setSelectedBusinessIds(values as string[]);
    closeDropdown();
  }, [closeDropdown]);

  const handleSocialMediaSelect = useCallback((values: string | string[]) => {
    setSelectedSocialNetworkIds(values as string[]);
    closeDropdown();
  }, [closeDropdown]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
    setActiveTab('');
    setActiveIndex(null);
    setUserSearch('');
    setDropdownOpen(false);
    setCurrentPage(1);
    setSelectedBusinessIds([]);
    setBizRoles({});
    setShowSocialMedia(false);
    setSelectedSocialNetworkIds([]);
    setSocialNetworkOptions([]);
    dispatch(resetHandlahUsers());
  }, [dispatch]);

  const handleSave = useCallback(() => {
    Keyboard.dismiss();
    setDropdownOpen(false);

    const payload: any = {
      toUserId: Number(formData.toUserId),
      connectionTypeId: Number(formData.connectionTypeId),
      targetAccountType: activeTab,
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
    dispatch(requestConnectionAsync(payload))
      .then(unwrapResult)
      .then(() => {
        if (onSave) onSave(payload);
        resetForm();
        onClose();
      })
      .catch((err: any) => {
        console.error('Failed to send connection request', err);
        onClose();
        showErrorToast(err as string);
      })
      .finally(() => setIsSaving(false));
  }, [formData, activeTab, showBusinessDropdown, selectedBusinessIds, bizRoles, showSocialMedia, selectedSocialNetworkIds, dispatch, onSave, resetForm, onClose]);

  const handleCancel = useCallback(() => {
    Keyboard.dismiss();
    setDropdownOpen(false);
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const dropdownDismissProps = useMemo(() => ({
    onStartShouldSetResponderCapture: () => {
      if (dropdownOpen) {
        closeDropdown();
      }
      return false;
    },
  }), [dropdownOpen, closeDropdown]);

  const renderUserItem = useCallback(
    ({ item }: { item: HandlahUser }) => (
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
    ),
    [handleUserSelect],
  );

  const keyExtractor = useCallback((item: HandlahUser) => String(item.id), []);

  const listFooter = useMemo(
    () =>
      isUsersLoading && users.length > 0 ? (
        <ActivityIndicator size="small" color={themeColors.primary} style={styles.listFooterLoader} />
      ) : null,
    [isUsersLoading, users.length, themeColors.primary],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (dropdownOpen) {
              closeDropdown();
            } else {
              handleCancel();
            }
          }}
        >
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{t('add_connection_modal.title')}</Text>
            </View>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={() => {
                if (dropdownOpen) closeDropdown();
              }}
            >
              <View style={styles.tabsContainer} {...dropdownDismissProps}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{t('add_connection_modal.select_category_label')}</Text>
                </View>
                <CustomScrollableTabs
                  tabs={connectionTypes}
                  activeTab={activeIndex as any}
                  onTabChange={handleTabChange}
                  showViewAll={false}
                  innerTabStyle={styles.innerTabStyle}
                />
              </View>

              <View style={styles.inputContainer} {...dropdownDismissProps}>
                <Text style={styles.label}>{t('add_connection_modal.select_category_group')}</Text>
                <CustomDropDown
                  options={categoryList}
                  value={formData.connectionTypeId !== '' ? String(formData.connectionTypeId) : ''}
                  onSelect={handleCategorySelect}
                  placeholder={t('add_connection_modal.select_placeholder')}
                  leftIcon
                  showArrow
                  style={styles.dropdownHeight}
                />
              </View>

              {/* Business dropdown */}
              {showBusinessDropdown && (
                <View style={styles.inputContainer} {...dropdownDismissProps}>
                  <Text style={styles.label}>{t('add_connection_modal.select_business_label')}</Text>
                  {businessesStatus === ASYNC_STATUS.LOADING ? (
                    <ActivityIndicator size="small" color={themeColors.primary} style={styles.fieldLoader} />
                  ) : businessOptions.length > 0 ? (
                    <>
                      <CustomDropDown
                        options={businessOptions}
                        selectedItems={selectedBusinessIds}
                        onSelect={(val) => handleBusinessSelect(val as any)}
                        placeholder={t('add_connection_modal.select_business_placeholder')}
                        search={false}
                        leftIcon
                        multiSelect
                        style={styles.dropdownHeight}
                      />
                      <BusinessRolePicker selected={selectedBusinessIds} options={businessOptions} roles={bizRoles} onChange={setBizRoles} />
                    </>
                  ) : (
                    <Text style={styles.emptyBusinessText}>{t('add_connection_modal.no_businesses_found')}</Text>
                  )}
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('add_connection_modal.username_label')}</Text>
                <View style={styles.searchDropdownWrapper}>
                  <CustomInput
                    ref={usernameInputRef}
                    placeholder={t('add_connection_modal.username_placeholder')}
                    value={userSearch}
                    onChangeText={handleUsernameInputChange}
                    onFocus={handleUsernameInputFocus}
                    autoCapitalize="none"
                    inputContainerStyle={styles.dropdownHeight}
                  />
                </View>

                {dropdownOpen && (
                  <View style={styles.dropdownList}>
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
                        keyExtractor={keyExtractor}
                        renderItem={renderUserItem}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                        scrollEnabled
                        style={styles.dropdownFlatList}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.4}
                        ListFooterComponent={listFooter}
                        removeClippedSubviews
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        initialNumToRender={8}
                      />
                    )}
                  </View>
                )}
              </View>

              {/* Emergency contact toggle — dismiss dropdown when interacted with */}
              <View style={styles.emergencyContainer} {...dropdownDismissProps}>
                <Text style={styles.emergencyLabel}>{t('add_connection_modal.emergency_contact_label')}</Text>
                <Switch
                  value={formData.isEmergencyContact}
                  onValueChange={(val) => handleInputChange('isEmergencyContact', val)}
                  trackColor={{ false: colors.lightGray, true: primaryTrackColor }}
                  thumbColor={formData.isEmergencyContact ? themeColors.secondary : colors.gray}
                  ios_backgroundColor={colors.lightGray}
                  style={styles.switchScale}
                />
              </View>

              {/* Show social media toggle — dismiss dropdown when interacted with */}
              <View style={styles.emergencyContainer} {...dropdownDismissProps}>
                <Text style={styles.emergencyLabel}>{t('add_connection_modal.show_social_media_label')}</Text>
                <Switch
                  value={showSocialMedia}
                  onValueChange={(val) => {
                    if (dropdownOpen) closeDropdown();
                    setShowSocialMedia(val);
                  }}
                  trackColor={{ false: colors.lightGray, true: primaryTrackColor }}
                  thumbColor={showSocialMedia ? themeColors.secondary : colors.gray}
                  ios_backgroundColor={colors.lightGray}
                  style={styles.switchScale}
                />
              </View>

              {/* Social media dropdown */}
              {showSocialMedia && (
                <View style={styles.inputContainer} {...dropdownDismissProps}>
                  <Text style={styles.label}>{t('add_connection_modal.select_social_media_label')}</Text>
                  {socialLoading ? (
                    <ActivityIndicator size="small" color={themeColors.primary} style={styles.fieldLoader} />
                  ) : socialNetworkOptions.length > 0 ? (
                    <CustomDropDown
                      options={socialNetworkOptions}
                      selectedItems={selectedSocialNetworkIds}
                      onSelect={(val) => handleSocialMediaSelect(val as any)}
                      placeholder={t('add_connection_modal.select_social_media_placeholder')}
                      search={false}
                      leftIcon
                      multiSelect
                      style={styles.dropdownHeight}
                    />
                  ) : (
                    <Text style={styles.emptyBusinessText}>{t('add_connection_modal.no_social_media_found')}</Text>
                  )}
                </View>
              )}
              <View style={styles.footer}>
                <View style={styles.buttonRow}>
                  <PrimaryButton
                    title={t('add_connection_modal.cancel_button')}
                    onPress={handleCancel}
                    variant="outline"
                    buttonStyle={[styles.cancelButton, { borderColor: themeColors.primary }]}
                    textStyle={{ color: themeColors.primary }}
                  />
                  <PrimaryButton
                    title={t('add_connection_modal.send_button')}
                    onPress={handleSave}
                    buttonStyle={styles.saveButton}
                    loading={isSaving}
                    disabled={!formData.toUserId || !formData.connectionTypeId || isSaving || !activeTab}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CustomAddConnectionModal;
