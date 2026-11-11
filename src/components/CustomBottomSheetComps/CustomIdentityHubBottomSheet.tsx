import React, {
  useState,
  useCallback,
  memo,
  useMemo,
  forwardRef,
  useRef,
  useEffect,
} from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Image,
  Keyboard,
  Switch,
} from 'react-native';
import CustomBottomSheet from '../common/CustomBottomSheet';
import CustomTabs from '../common/CustomTabs';
import CustomScrollableTabs from '../common/CustomScrollableTabs';
import CustomDropDown from '../common/CustomDropDown';
import PrimaryButton from '../common/PrimaryButton';
import ProfileAvatar from '../common/ProfileAvatar';
import { CustomDateTimePicker, showSuccessToast } from '../common';
import colors, { getColorWithOpacity } from '../../utils/colors';
import { QUICK_ADD_TABS, CATEGORY_OPTIONS } from '../../utils/staticData';
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { CustomInput } from '../common';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  getConnectionTypesAsync,
  getHandlahUsersAsync,
  requestConnectionAsync,
  getSocialNetworkConnectionsAsync,
} from '../../redux/services/connectionService';
import { resetHandlahUsers } from '../../redux/slices/connectionSlice';
import { ASYNC_STATUS } from '../../config/constants';
import { useUserRole } from '../../hooks/useUserRole';
import {
  HandlahUser,
  ConnectionTypes,
} from '../../types/reduxTypes/connectionSlice.types';
import type {
  CustomIdentityHubBottomSheetProps,
  ItemTabContentProps,
  ConnectionsTabContentProps,
  ReminderTabContentProps,
} from '../../types/bottomSheet.types';
import { getBusinessesAsync } from '../../redux/services/businessService';
import { addAdHocReminderAsync } from '../../redux/services/reminderService';
import { setAddAdHocReminderStatus } from '../../redux/slices/reminderSlice';
import { AppDispatch } from '../../types/store.types';
import { makeCustomIdentityHubBottomSheetStyles } from './CustomIdentityHubBottomSheet.styles';
import { RoleTheme } from '../../types/roleManager.types';

const PAGE_SIZE = 10;

// Maps CATEGORY_OPTIONS value → a natural-language AI prompt
const CATEGORY_TO_AI_PROMPT: Record<string, string> = {
  bookmarks: 'I want to add a bookmark.',
  subscriptions: 'I want to add a subscription.',
  legal: 'I want to add a document.',
  wallet: 'I want to add a wallet document.',
  pets: 'I want to add a pet.',
  vehicles: 'I want to add a vehicle.',
  personal_property: 'I want to add a personal property item.',
  real_estate: 'I want to add a real estate record.',
  banking: 'I want to add a bank account.',
  loans: 'I want to add a loan.',
  utilities: 'I want to add a utility.',
  insurance: 'I want to add an insurance policy.',
  warranties: 'I want to add a warranty.',
  identity_hub: 'I want to add an identity document.',
  social_media: 'I want to add a social media account.',
  health_tracker: 'I want to add a health record.',
};

const connectionTypes = [
  { label: 'Personal', value: 'Personal' },
  { label: 'Business', value: 'Business' },
  { label: 'Personal & Business', value: 'Both' },
];


const ItemTabContent: React.FC<ItemTabContentProps> = memo(
  ({ onCancel }) => {
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeCustomIdentityHubBottomSheetStyles(themeColors as RoleTheme), [themeColors]);
    const navigation = useNavigation<any>();
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const handleCategorySelect = useCallback(
      (value: string | string[]): void => {
        setSelectedCategory(Array.isArray(value) ? value[0] : value);
      },
      [],
    );

    const handleGoToAddScreen = useCallback((): void => {
      if (!selectedCategory) return;
      const prompt = CATEGORY_TO_AI_PROMPT[selectedCategory];
      if (!prompt) return;
      // Close the bottom sheet first, then navigate to AI Assistant with prefilled prompt
      if (onCancel) onCancel();
      navigation.navigate('AiAssistant' as never, { prefillPrompt: prompt } as never);
    }, [selectedCategory, navigation, onCancel]);

    const handleCancel = useCallback((): void => {
      setSelectedCategory('');
      if (onCancel) onCancel();
    }, [onCancel]);

    const selectedLabel = useMemo(() => {
      const found = CATEGORY_OPTIONS.find(o => o.value === selectedCategory);
      return found ? found.label : '';
    }, [selectedCategory]);

    return (
      <BottomSheetScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formFieldsContainer}>
          <View>
            <Text style={styles.fieldLabel}>
              {t('home.bottom_sheet.select_category')}
            </Text>
            <CustomDropDown
              options={CATEGORY_OPTIONS}
              value={selectedCategory}
              onSelect={(val: any) => handleCategorySelect(val)}
              placeholder={t('home.bottom_sheet.select')}
              searchPlaceholder={t('home.bottom_sheet.select_placeholder')}
              search={true}
              leftIcon={true}
            />
          </View>

          {!!selectedCategory && (
            <View style={styles.selectedCategoryInfo}>
              <Text style={styles.selectedCategoryText}>
                {'AI will be asked: '}
                <Text style={[styles.selectedCategoryBold, { color: themeColors.primary }]}>
                  {CATEGORY_TO_AI_PROMPT[selectedCategory] ?? selectedLabel}
                </Text>
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <PrimaryButton
            title={t('home.bottom_sheet.cancel')}
            onPress={handleCancel}
            buttonStyle={styles.saveButton}
            variant="outline"
          />
          <PrimaryButton
            title={t('home.bottom_sheet.go')}
            onPress={handleGoToAddScreen}
            buttonStyle={styles.saveButton}
            disabled={!selectedCategory}
          />
        </View>
      </BottomSheetScrollView>
    );
  },
);

ItemTabContent.displayName = 'ItemTabContent';


const ConnectionsTabContent: React.FC<ConnectionsTabContentProps> = memo(
  ({ onSendRequest, onCancel }) => {
    const { t } = useTranslation();
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(() => makeCustomIdentityHubBottomSheetStyles(themeColors as RoleTheme), [themeColors]);

    const dispatch = useDispatch<AppDispatch>();

    // Mirror of CustomAddConnectionModal state
    const [activeTabIndex, setActiveTabIndex] = useState<number | null>(isBusinessRole() ? 1 : 0);
    const [activeTab, setActiveTab] = useState<string>(isBusinessRole() ? 'Business' : 'Personal');
    const [connectionTypeId, setConnectionTypeId] = useState<string>('');
    const [isEmergencyContact, setIsEmergencyContact] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([]);
    const [showSocialMedia, setShowSocialMedia] = useState<boolean>(false);
    const [selectedSocialNetworkIds, setSelectedSocialNetworkIds] = useState<string[]>([]);
    const [socialNetworkOptions, setSocialNetworkOptions] = useState<{ label: string; value: string }[]>([]);
    const [socialLoading, setSocialLoading] = useState<boolean>(false);

    const [userSearch, setUserSearch] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<HandlahUser | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [dropdownY, setDropdownY] = useState<number>(0);

    const inputRef = useRef<View>(null);
    const containerRef = useRef<View>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { get_handlah_users_data, get_handlah_users_status, get_connection_types_data } =
      useSelector((state: any) => state.connection_slice);

    const businesses = useSelector(
      (state: any) => state.business_slice?.get_businesses_data || [],
    );
    const businessesStatus = useSelector(
      (state: any) => state.business_slice?.get_businesses_status,
    );

    const showBusinessDropdown = activeTab === 'Business' || activeTab === 'Both';

    const businessOptions = useMemo(() => {
      if (!Array.isArray(businesses) || businesses.length === 0) return [];
      return businesses
        .filter((b: any) => b && b.id && b.businessname)
        .map((b: any) => ({
          label: b.businessname || 'Unnamed Business',
          value: b.id.toString(),
        }));
    }, [businesses]);

    const users: HandlahUser[] = get_handlah_users_data?.users ?? [];
    const totalPages: number = get_handlah_users_data?.totalPages ?? 1;
    const isUsersLoading = get_handlah_users_status === ASYNC_STATUS.LOADING;


    useFocusEffect(
      useCallback(() => {
        dispatch(getConnectionTypesAsync());
      }, [dispatch]),
    );

    const categoryList = useMemo(() => {
      const apiTypes: ConnectionTypes[] = get_connection_types_data || [];
      return apiTypes.map((type: ConnectionTypes) => ({
        label: type.name,
        value: String(type.id),
      }));
    }, [get_connection_types_data]);

    useEffect(() => {
      dispatch(getBusinessesAsync() as any);
    }, [dispatch]);

    useEffect(() => {
      if (!showSocialMedia || !activeTab) {
        setSocialNetworkOptions([]);
        setSelectedSocialNetworkIds([]);
        return;
      }
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
          const setups = result?.usersocialnetworksetups ?? result ?? [];
          const options = setups.map((item: any) => ({
            label: `${item?.businessid ? item.business.businessname : item.socialnetworktypename || 'Social'} - ${item.accountname || item.username || item.url || ''}`,
            value: String(item.id),
          }));
          setSocialNetworkOptions(options);
        } catch {
          setSocialNetworkOptions([]);
        } finally {
          setSocialLoading(false);
        }
      };
      fetchSocial();
    }, [showSocialMedia, activeTab, selectedBusinessIds, dispatch]);


    const fetchUsers = useCallback(
      (search: string, page: number) => {
        dispatch(getHandlahUsersAsync({ targetAccountType: activeTab || "Personal", search, page, pageSize: PAGE_SIZE, includeAllUsers: false }) as any);
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
    }, [userSearch, dropdownOpen]);

    const handleLoadMore = useCallback(() => {
      if (isUsersLoading || currentPage >= totalPages) return;
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchUsers(userSearch, nextPage);
    }, [isUsersLoading, currentPage, totalPages, userSearch, fetchUsers]);

    const handleUserSelect = useCallback((user: HandlahUser) => {
      setSelectedUser(user);
      setUserSearch(user.username);
      setDropdownOpen(false);
      Keyboard.dismiss();
    }, []);

    const handleUsernameInputChange = useCallback(
      (value: string) => {
        setUserSearch(value);
        setSelectedUser(null);
        if (!dropdownOpen) setDropdownOpen(true);
      },
      [dropdownOpen],
    );

    const handleUsernameInputFocus = useCallback(() => {
      setDropdownOpen(true);
      if (inputRef.current && containerRef.current) {
        inputRef.current.measureLayout(
          containerRef.current as any,
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

    const handleTabChange = useCallback((index: number) => {
      setActiveTabIndex(index);
      setActiveTab(connectionTypes[index].value);
      setSelectedBusinessIds([]);
    }, []);

    const handleCategorySelect = useCallback((value: string | string[] | null): void => {
      if (value === null) { setConnectionTypeId(''); return; }
      setConnectionTypeId(Array.isArray(value) ? value[0] : value);
    }, []);

    const resetForm = useCallback(() => {
      setActiveTabIndex(null);
      setActiveTab('');
      setConnectionTypeId('');
      setIsEmergencyContact(false);
      setUserSearch('');
      setSelectedUser(null);
      setDropdownOpen(false);
      setCurrentPage(1);
      setSelectedBusinessIds([]);
      setShowSocialMedia(false);
      setSelectedSocialNetworkIds([]);
      setSocialNetworkOptions([]);
      dispatch(resetHandlahUsers());
    }, [dispatch]);

    const handleSave = useCallback((): void => {
      if (!connectionTypeId || !selectedUser) {
        console.warn('Connection type and username are required');
        return;
      }
      Keyboard.dismiss();

      const payload: any = {
        toUserId: Number(selectedUser.id),
        connectionTypeId: Number(connectionTypeId),
        targetAccountType: activeTab,
        isEmergency: isEmergencyContact,
      };

      if (showBusinessDropdown && selectedBusinessIds.length > 0) {
        payload.businessIds = selectedBusinessIds.map(Number);
      }

      if (showSocialMedia && selectedSocialNetworkIds.length > 0) {
        payload.socialNetworkIds = selectedSocialNetworkIds.map(Number);
      }

      setIsSaving(true);
      dispatch(requestConnectionAsync(payload))
        .then(unwrapResult)
        .then(() => {
          if (onSendRequest) onSendRequest(payload);
          resetForm();
          showSuccessToast('Connection request sent successfully');
        })
        .catch((err: any) => {
          console.error('Failed to send connection request', err);
        })
        .finally(() => setIsSaving(false));
    }, [connectionTypeId, selectedUser, activeTab, isEmergencyContact, dispatch, onSendRequest, resetForm]);

    const handleCancel = useCallback((): void => {
      Keyboard.dismiss();
      resetForm();
      if (onCancel) onCancel();
    }, [onCancel, resetForm]);


    return (
      <View ref={containerRef} collapsable={false} style={styles.connectionTabWrapper}>
        <BottomSheetScrollView
          style={styles.tabContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.accountTypeTabs}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start' }}>
              <Text style={styles.fieldLabel}>
                {t('add_connection_modal.select_category_label')}
              </Text>
            </View>
            <CustomScrollableTabs
              tabs={connectionTypes}
              activeTab={activeTabIndex as any}
              onTabChange={handleTabChange}
              showViewAll={false}
              innerTabStyle={{ paddingHorizontal: 14 }}
            />
          </View>

          <View style={styles.formFieldsContainer}>
            {/* Category / connection type dropdown */}
            <View>
              <Text style={styles.fieldLabel}>
                {t('add_connection_modal.select_category_group')}
              </Text>
              <CustomDropDown
                options={categoryList}
                value={connectionTypeId !== '' ? String(connectionTypeId) : ''}
                onSelect={handleCategorySelect}
                placeholder={t('add_connection_modal.select_placeholder')}
                leftIcon={true}
                showArrow={true}
                style={styles.dropdownHeight}
              />
            </View>

            {/* Business multi-select dropdown */}
            {showBusinessDropdown && (
              <View>
                <Text style={styles.fieldLabel}>
                  {t('add_connection_modal.select_business_label')}
                </Text>
                {businessesStatus === ASYNC_STATUS.LOADING ? (
                  <ActivityIndicator size="small" color={themeColors.primary} style={{ marginVertical: 8 }} />
                ) : businessOptions.length > 0 ? (
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
                ) : (
                  <Text style={{ fontSize: 13, color: colors.gray, marginTop: 4 }}>
                    {t('add_connection_modal.no_businesses_found')}
                  </Text>
                )}
              </View>
            )}

            {/* Username search */}
            <View>
              <Text style={styles.fieldLabel}>
                {t('add_connection_modal.username_label')}
              </Text>
              <View ref={inputRef} collapsable={false}>
                <CustomInput
                  placeholder={t('add_connection_modal.username_placeholder')}
                  value={userSearch}
                  onChangeText={handleUsernameInputChange}
                  onFocus={handleUsernameInputFocus}
                  autoCapitalize="none"
                  inputContainerStyle={styles.dropdownHeight}
                />
              </View>
            </View>

            {/* Emergency contact toggle */}
            <View style={styles.emergencyContainer}>
              <Text style={styles.emergencyLabel}>
                {t('add_connection_modal.emergency_contact_label')}
              </Text>
              <Switch
                value={isEmergencyContact}
                onValueChange={setIsEmergencyContact}
                trackColor={{
                  false: colors.lightGray,
                  true: getColorWithOpacity(themeColors.primary, 0.5),
                }}
                thumbColor={isEmergencyContact ? themeColors.secondary : colors.gray}
                ios_backgroundColor={colors.lightGray}
                style={styles.switchScale}
              />
            </View>

            {/* Show Social Media Handles Toggle */}
            <View style={styles.emergencyContainer}>
              <Text style={styles.emergencyLabel}>
                {t('add_connection_modal.show_social_media_label')}
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

            {showSocialMedia && (
              <View>
                <Text style={styles.fieldLabel}>
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
                  <Text style={{ fontSize: 13, color: colors.gray, marginTop: 4 }}>
                    {t('add_connection_modal.no_social_media_found')}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.buttonRow}>
            <PrimaryButton
              title={t('add_connection_modal.cancel_button')}
              onPress={handleCancel}
              variant="outline"
              buttonStyle={[styles.saveButton, { borderColor: themeColors.primary }]}
              textStyle={{ color: themeColors.primary }}
            />
            <PrimaryButton
              title={t('add_connection_modal.send_button')}
              onPress={handleSave}
              buttonStyle={styles.saveButton}
              loading={isSaving}
            />
          </View>
        </BottomSheetScrollView>

        {/* User search dropdown overlay */}
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
    );
  },
);

ConnectionsTabContent.displayName = 'ConnectionsTabContent';

const formatTimeForApi = (isoString: string | null): string | undefined => {
  if (!isoString) return undefined;
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return undefined;
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  return `${hours12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

const ReminderTabContent: React.FC<ReminderTabContentProps> = memo(
  ({ onCancel }) => {
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeCustomIdentityHubBottomSheetStyles(themeColors as RoleTheme), [themeColors]);

    const dispatch = useDispatch<AppDispatch>();

    const [description, setDescription] = useState<string>('');
    const [date, setDate] = useState<string | null>(null);
    const [time, setTime] = useState<string | null>(null);

    const { add_ad_hoc_reminder_status } = useSelector(
      (state: any) => state.reminder_slice,
    );
    const isSubmitting = add_ad_hoc_reminder_status === ASYNC_STATUS.LOADING;

    // Reset form when submission succeeds
    useEffect(() => {
      if (add_ad_hoc_reminder_status === ASYNC_STATUS.SUCCEEDED) {
        dispatch(setAddAdHocReminderStatus());
        setDescription('');
        setDate(null);
        setTime(null);
        if (onCancel) onCancel();
      }
    }, [add_ad_hoc_reminder_status, dispatch, onCancel]);

    const handleSave = useCallback((): void => {
      if (!description.trim() || !date || !time) return;
      dispatch(
        addAdHocReminderAsync({
          description: description.trim(),
          date: new Date(date).toISOString(),
          frequency: 'custom',
          time: formatTimeForApi(time),
        }),
      );
    }, [description, date, time, dispatch]);

    const handleCancel = useCallback((): void => {
      setDescription('');
      setDate(null);
      setTime(null);
      if (onCancel) onCancel();
    }, [onCancel]);

    return (
      <BottomSheetScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formFieldsContainer}>
          {/* Description */}
          <View>
            <Text style={styles.fieldLabel}>
              {t('add_ad_hoc_reminder.description_label')}
            </Text>
            <BottomSheetTextInput
              placeholder={t('add_ad_hoc_reminder.description_placeholder')}
              value={description}
              onChangeText={setDescription}
              style={[styles.textInput, styles.multilineInput]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Date Picker */}
          <View>
            <Text style={styles.fieldLabel}>
              {t('add_ad_hoc_reminder.date_label')}
            </Text>
            <CustomDateTimePicker
              placeholder={t('add_ad_hoc_reminder.date_placeholder')}
              value={date}
              onChange={(selectedDate: any) => setDate(selectedDate)}
              mode="date"
              suffixIcon={
                <FontAwesome6 name="calendar" size={18} color={colors.gray} />
              }
              displayFormat="MM/DD/YYYY"
            />
          </View>

          {/* Time Picker */}
          <View>
            <Text style={styles.fieldLabel}>
              {t('add_ad_hoc_reminder.select_time_label', { defaultValue: 'Select Time' })}
            </Text>
            <CustomDateTimePicker
              placeholder="9:00 AM"
              value={time}
              onChange={(selectedTime: any) => setTime(selectedTime)}
              mode="time"
              suffixIcon={
                <FontAwesome6 name="clock" size={18} color={colors.gray} />
              }
              displayFormat="hh:mm A"
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <PrimaryButton
            title={t('home.bottom_sheet.cancel')}
            onPress={handleCancel}
            variant="outline"
            buttonStyle={[styles.saveButton, { borderColor: themeColors.primary }]}
            textStyle={{ color: themeColors.primary }}
          />
          <PrimaryButton
            title={t('add_ad_hoc_reminder.save_button')}
            onPress={handleSave}
            buttonStyle={styles.saveButton}
            loading={isSubmitting}
            disabled={!description.trim() || !date || !time}
          />
        </View>
      </BottomSheetScrollView>
    );
  },
);

ReminderTabContent.displayName = 'ReminderTabContent';


const CustomIdentityHubBottomSheet = forwardRef<
  any,
  CustomIdentityHubBottomSheetProps
>((props, ref) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<number>(0);
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomIdentityHubBottomSheetStyles(themeColors as RoleTheme), [themeColors]);


  const handleTabChange = useCallback((index: number): void => {
    setActiveTab(index);
  }, []);

  const handleClose = useCallback((): void => {
    (ref as any)?.current?.close();
  }, [ref]);

  const renderTabContent = useMemo((): React.ReactElement => {
    switch (activeTab) {
      case 0:
        return <ItemTabContent onCancel={handleClose} />;
      case 1:
        return <ConnectionsTabContent onCancel={handleClose} />;
      case 2:
        return <ReminderTabContent onCancel={handleClose} />;
      default:
        return <ItemTabContent onCancel={handleClose} />;
    }
  }, [activeTab, handleClose]);

  return (
    <CustomBottomSheet
      ref={ref}
      snapPoints={['70%', '100%']}
      enablePanDownToClose={true}
      enableBackdrop={true}
      index={-1}
      enableDynamicSizing={false}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('home.bottom_sheet.quick_add')}</Text>
        </View>

        <CustomTabs
          tabs={QUICK_ADD_TABS.map(tab => ({ ...tab, label: t(tab.key) }))}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showIcons={false}
          containerStyle={styles.tabsContainerStyle}
          labelStyle={styles.tabLabelStyle}
          activeLabelStyle={styles.activeTabLabelStyle}
          activeTabStyle={styles.activeTabStyle}
          tabStyle={styles.tabStyle}
        />

        {renderTabContent}
      </View>
    </CustomBottomSheet>
  );
});

CustomIdentityHubBottomSheet.displayName = 'CustomIdentityHubBottomSheet';

export default CustomIdentityHubBottomSheet;
