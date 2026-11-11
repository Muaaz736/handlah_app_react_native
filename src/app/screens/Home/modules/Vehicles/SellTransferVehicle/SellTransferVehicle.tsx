import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Platform,
  Switch,
  KeyboardAvoidingView
} from 'react-native';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeCommonStyles } from '../Vehicles.styles';
import { makeSellTransferVehicleStyles, makeDropdownStyles, makeOwnBizStyles } from './SellTransferVehicle.styles';
import {
  AuthHeader,
  CustomInput,
  PrimaryButton,
  CustomDateTimePicker
} from '../../../../../../components/common';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import {
  NavigationParams,
  SellTransferVehicleNavigationProp
} from './SellTransferVehicle.types';
import { vehicleSaleTransferAsync, updateVehicleSaleTransferAsync, getBusinessesByUsernameAsync } from '../../../../../../redux/services/assetsService';
import { resetUpdateVehicleSaleTransferStatus, resetVehicleSaleTransferStatus } from '../../../../../../redux/slices/assetsSlice';
import { getHandlahUsersAsync } from '../../../../../../redux/services/connectionService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { AppDispatch } from '../../../../../../types/store.types';
import { getBusinessesAsync } from '../../../../../../redux/services/businessService';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const SellTransferVehicle = (): React.ReactElement => {
  const navigation = useNavigation<SellTransferVehicleNavigationProp>();
  const route = useRoute();
  const { vehicleId, saleRecord } = (route?.params as NavigationParams) || {};
  const { t } = useTranslation();
  const { themeColors, isBusinessRole } = useUserRole();
  const dropdownStyles = useMemo(() => makeDropdownStyles(themeColors as RoleTheme), [themeColors]);
  const ownBizStyles = useMemo(() => makeOwnBizStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(
    () => ({
      ...makeCommonStyles(themeColors as RoleTheme),
      ...makeSellTransferVehicleStyles(themeColors as RoleTheme),
    }),
    [themeColors]
  );
  const { selectedBusinessId, businesses } = useSelectedBusiness();
  const dispatch = useDispatch<AppDispatch>();

  // Form state
  const [soldToName, setSoldToName] = useState<string>(saleRecord?.touseremail || '');
  const [salePrice, setSalePrice] = useState<string>(saleRecord?.saleprice ? String(saleRecord.saleprice) : '');
  const [date, setDate] = useState<string | null>(saleRecord?.transferdate || null);
  const [notes, setNotes] = useState<string>(saleRecord?.notes || '');
  const [additionalComments, setAdditionalComments] = useState<string>(saleRecord?.additionalcomments || '');
  const [attachmentIds, setAttachmentIds] = useState<string[]>(saleRecord?.ownershipdocumenturl || []);
  const [errors, setErrors] = useState<any>({});
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);

  // Username search/dropdown state
  const [userSearch, setUserSearch] = useState<string>(saleRecord?.tousername || '');
  const [selectedUser, setSelectedUser] = useState<any | null>(saleRecord ? {
    id: saleRecord.touserid,
    username: saleRecord.tousername
  } : null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);

  // Business dropdown state
  const [sellToOwnBusiness, setSellToOwnBusiness] = useState<boolean>(false);
  const [sellToPersonal, setSellToPersonal] = useState<boolean>(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(saleRecord?.tobusinessid ? { id: saleRecord.tobusinessid } : null);
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState<boolean>(false);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState<boolean>(false);

  // Redux
  const userId = useSelector((state: any) => state.user_auth?.user_id);
  const currentUserData = useSelector((state: any) => state.user_auth?.user_data);
  const assetsState = useSelector((state: any) => state.assets_slice);
  const markAsSoldStatus = useMemo(
    () => assetsState?.vehicle_sale_transfer_status,
    [assetsState],
  );
  const soldData = useMemo(
    () => assetsState?.vehicle_sale_transfer_data,
    [assetsState],
  );
  const updateStatus = useMemo(
    () => assetsState?.update_vehicle_sale_transfer_status,
    [assetsState],
  );
  const isSubmitting = markAsSoldStatus === ASYNC_STATUS.LOADING || updateStatus === ASYNC_STATUS.LOADING;

  // Filter to exclude current user from all NCHRG users
  const availableUsers = useMemo(() => {
    return (allUsers || []).filter((u: any) => u.id !== userId);
  }, [allUsers, userId]);

  const filteredUsers = useMemo(() => {
    // Only suggest once the user has actually typed something — no results on an empty field
    if (!userSearch.trim()) return [];
    const lower = userSearch.toLowerCase();
    return availableUsers.filter(
      u =>
        u.username?.toLowerCase().includes(lower) ||
        u.firstname?.toLowerCase().includes(lower) ||
        u.lastname?.toLowerCase().includes(lower),
    );
  }, [availableUsers, userSearch]);

  useEffect(() => {
    if (saleRecord?.tobusinessid && allBusinesses.length > 0) {
      const matched = allBusinesses.find(
        (b: any) => b.id === saleRecord.tobusinessid
      );

      if (matched) {
        setSelectedBusiness(matched);
      }
    }
  }, [saleRecord?.tobusinessid, allBusinesses]);

  // Navigate on success
  useEffect(() => {
    if (markAsSoldStatus === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetUpdateVehicleSaleTransferStatus())
      navigation.navigate('VehicleSoldConfirmation', {
        soldToUsername: selectedUser?.username || userSearch,
        date: date,
        vehicleId: vehicleId,
        transferId: soldData?.id || saleRecord?.id,
        additionalcomments: additionalComments,
        attachmentids: attachmentIds,
        resetOnBack: true
      } as any);
      dispatch(resetVehicleSaleTransferStatus());
    }
  }, [markAsSoldStatus, dispatch, navigation, selectedUser, userSearch, date, saleRecord?.id]);

  useEffect(() => {
    if (updateStatus === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetUpdateVehicleSaleTransferStatus());
    }
  }, [updateStatus]);

  useEffect(() => {
    setUsersLoading(true);
    dispatch(
      getHandlahUsersAsync({
        search: '',
        page: 1,
        pageSize: 1000,
        includeAllUsers: true
      }),
    );
  }, [dispatch]);

  const handleahUsersData = useSelector(
    (state: any) => state.connection_slice?.get_handlah_users_data,
  );
  const handleahUsersStatus = useSelector(
    (state: any) => state.connection_slice?.get_handlah_users_status,
  );

  useEffect(() => {
    if (handleahUsersStatus === ASYNC_STATUS.LOADING) {
      setUsersLoading(true);
    } else if (handleahUsersStatus === ASYNC_STATUS.SUCCEEDED) {
      setAllUsers(handleahUsersData?.users || []);
      setUsersLoading(false);
    } else {
      setUsersLoading(false);
    }
  }, [handleahUsersStatus, handleahUsersData]);

  useEffect(() => {
    if (sellToOwnBusiness || sellToPersonal) {
      const myUsername = currentUserData?.username || '';
      const myName = [currentUserData?.firstname, currentUserData?.lastname].filter(Boolean).join(' ') || myUsername;
      setUserSearch(myUsername);
      setSelectedUser({ id: userId, username: myUsername });
      setSoldToName(myName);
      setDropdownOpen(false);
      setSelectedBusiness(null);
      setBusinessDropdownOpen(false);
    } else {
      setUserSearch(saleRecord?.tousername || '');
      setSelectedUser(saleRecord ? { id: saleRecord.touserid, username: saleRecord.tousername } : null);
      setSelectedBusiness(saleRecord?.tobusinessid ? { id: saleRecord.tobusinessid } : null);
      setAllBusinesses([]);
    }
  }, [sellToOwnBusiness, sellToPersonal]);

  const handleToggleOwnBusiness = useCallback((value: boolean) => {
    setSellToOwnBusiness(value);
    if (value) setSellToPersonal(false);
  }, []);

  const handleToggleSellToPersonal = useCallback((value: boolean) => {
    setSellToPersonal(value);
    if (value) setSellToOwnBusiness(false);
  }, []);

  useEffect(() => {
    if (!sellToOwnBusiness && !sellToPersonal && selectedUser?.username && selectedUser.username !== '') {
      setBusinessesLoading(true);
      dispatch(
        getBusinessesByUsernameAsync(selectedUser.username),
      );
    }
  }, [selectedUser?.username, sellToOwnBusiness, sellToPersonal]);



  useFocusEffect(
    useCallback(() => {
      dispatch(getBusinessesAsync() as any);
    }, [dispatch]),
  );


  // Subscribe to businesses from Redux
  const businessesData = useSelector(
    (state: any) => state.assets_slice?.get_businesses_by_username_data,
  );
  const businessesStatus = useSelector(
    (state: any) => state.assets_slice?.get_businesses_by_username_status,
  );

  useEffect(() => {
    if (businessesStatus === ASYNC_STATUS.LOADING) {
      setBusinessesLoading(true);
    } else if (businessesStatus === ASYNC_STATUS.SUCCEEDED) {
      setAllBusinesses(businessesData || []);
      setBusinessesLoading(false);
    } else {
      setBusinessesLoading(false);
    }
  }, [businessesStatus, businessesData]);

  const handleUserSelect = useCallback((user: any) => {
    setSelectedUser(user);
    setUserSearch(user.username);
    const fullName = [user.firstname, user.lastname].filter(Boolean).join(' ') || user.username;
    setSoldToName(fullName);
    setDropdownOpen(false);
    setSelectedBusiness(null);
    Keyboard.dismiss();
    setErrors((e: any) => ({ ...e, userSearch: undefined, soldToName: undefined }));
  }, []);

  const handleUsernameChange = useCallback(
    (value: string) => {
      setUserSearch(value);
      setSelectedUser(null);
      if (!dropdownOpen) setDropdownOpen(true);
      setErrors((e: any) => ({ ...e, userSearch: undefined }));
    },
    [dropdownOpen],
  );

  const handleUsernameBlur = useCallback(() => {
    setTimeout(() => setDropdownOpen(false), 200);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: any = {};
    if (!soldToName || !soldToName.trim()) newErrors.soldToName = 'Required';
    if (!(selectedUser?.username || (userSearch && userSearch.trim()))) newErrors.userSearch = 'Required';
    if (!salePrice || !salePrice.trim() || Number.isNaN(Number(salePrice))) newErrors.salePrice = 'Required';
    if (!date) newErrors.date = 'Required';
    if (sellToOwnBusiness && !selectedBusiness) newErrors.selectedBusiness = 'Please select one of your businesses';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [soldToName, selectedUser, userSearch, salePrice, date, sellToOwnBusiness, selectedBusiness]);

  const handleSave = useCallback((): void => {
    if (!saleRecord?.id) return;

    const dateISO = date
      ? new Date(date).toISOString()
      : new Date().toISOString();

    dispatch(
      updateVehicleSaleTransferAsync({
        transferId: saleRecord.id,
        toUserIdentifier: selectedUser?.username || userSearch,
        salePrice: parseFloat(salePrice) || 0,
        transferDate: dateISO,
        buyerName: soldToName,
        notes: notes || undefined,
        isDraft: saleRecord?.istransfer ? false : true,
        ...(selectedBusiness ? { toBusinessId: selectedBusiness.id } : {}),
        ...(isBusinessRole() ? { fromBusinessId: selectedBusinessId } : {})
      }),
    );
  }, [saleRecord?.id, validateForm, dispatch, selectedUser?.username, userSearch, salePrice, date, soldToName, notes, selectedBusiness, isBusinessRole]);

  const handleSubmit = useCallback((): void => {
    if (!vehicleId) return;
    if (!validateForm()) return;

    const dateISO = date
      ? new Date(date).toISOString()
      : new Date().toISOString();

    const payload = {
      vehicleId: Number(vehicleId),
      transferDate: dateISO,
      buyerName: soldToName,
      toUserIdentifier: selectedUser?.username || userSearch,
      salePrice: parseFloat(salePrice) || 0,
      notes: notes || undefined,
      saveAsDraft: true,
      ...(selectedBusiness ? { toBusinessId: selectedBusiness.id } : {}),
      ...(isBusinessRole() ? { fromBusinessId: selectedBusinessId } : {})
    };

    dispatch(
      vehicleSaleTransferAsync(payload),
    );
  }, [vehicleId, validateForm, date, soldToName, selectedUser, userSearch, salePrice, notes, additionalComments, saleRecord?.id, dispatch, selectedBusiness, isBusinessRole]);

  const handleContinueToTransfer = useCallback((): void => {
    if (!saleRecord?.id) return;
    navigation.navigate('VehicleSoldConfirmation', {
      soldToUsername: selectedUser?.username || userSearch,
      date: date,
      vehicleId: vehicleId,
      transferId: soldData?.id || saleRecord?.id,
      additionalcomments: additionalComments,
      attachmentids: attachmentIds
    } as any);
  }, [navigation, saleRecord?.id]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader
          title={t('vehicles.sell_transfer_vehicle')}
          onBackPress={() => navigation.goBack()}
          containerStyle={{
            paddingHorizontal: 16,
            marginBottom: 0,
            paddingTop: isIOS ? 0 : 20
          }}
          backButtonStyle={{ marginBottom: 0 }}
          titleStyle={{
            marginBottom: 0,
            marginTop: 10,
            textAlign: 'left'
          }}
           backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
        />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>

              {/* Sell to own business toggle */}
              <View style={ownBizStyles.toggleRow}>
                <Text style={ownBizStyles.toggleLabel}>
                  Sell to one of my own businesses
                </Text>
                <Switch
                  value={sellToOwnBusiness}
                  onValueChange={handleToggleOwnBusiness}
                  trackColor={{
                    false: colors.lightGray,
                    true: themeColors.primary
                  }}
                  thumbColor={sellToOwnBusiness ? themeColors.secondary : colors.gray}
                  ios_backgroundColor={colors.lightGray}
                />
              </View>

              {isBusinessRole() && (
                <View style={ownBizStyles.toggleRow}>
                  <Text style={ownBizStyles.toggleLabel}>
                    Sell to my personal
                  </Text>
                  <Switch
                    value={sellToPersonal}
                    onValueChange={handleToggleSellToPersonal}
                    trackColor={{
                      false: colors.lightGray,
                      true: themeColors.primary
                    }}
                    thumbColor={sellToPersonal ? themeColors.secondary : colors.gray}
                    ios_backgroundColor={colors.lightGray}
                  />
                </View>
              )}

              <View style={[styles.rowContainer, { flexDirection: 'row' }]}>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, { textAlign: 'left' }]}>
                    {t('vehicles.sold_to_name')}
                  </Text>
                  <CustomInput
                    placeholder={t('common.name_placeholder')}
                    value={soldToName}
                    onChangeText={(text: string) => setSoldToName(text)}
                    containerStyle={styles.inputContainerNoMargin}
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                  />
                  {errors.soldToName ? (
                    <Text style={{ color: colors.error || 'red', marginTop: 6, fontSize: 12 }}>
                      {errors.soldToName}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.halfInput}>
                  <Text
                    style={[styles.label, { textAlign: 'left' }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {t('vehicles.sold_to_handlah_username')}
                  </Text>
                  <View style={{ position: 'relative' }}>
                    <CustomInput
                      placeholder={t('vehicles.sold_to_handlah_username')}
                      value={userSearch}
                      onChangeText={handleUsernameChange}
                      onFocus={() => !sellToOwnBusiness && !sellToPersonal && setDropdownOpen(true)}
                      onBlur={handleUsernameBlur}
                      autoCapitalize="none"
                      containerStyle={styles.inputContainerNoMargin}
                      labelStyle={{ textAlign: 'left' }}
                      inputStyle={{ textAlign: 'left' }}
                      editable={!sellToOwnBusiness && !sellToPersonal}
                    />
                    {errors.userSearch ? (
                      <Text style={{ color: colors.error || 'red', marginTop: 6, fontSize: 12 }}>
                        {errors.userSearch}
                      </Text>
                    ) : null}
                    {dropdownOpen && !sellToOwnBusiness && !sellToPersonal && userSearch.trim().length > 0 && (
                      <View style={dropdownStyles.container}>
                        {usersLoading ? (
                          <ActivityIndicator
                            size="small"
                            color={themeColors.primary}
                            style={{ padding: 12 }}
                          />
                        ) : filteredUsers.length === 0 ? (
                          <Text style={dropdownStyles.emptyText}>
                            {t('common.no_users_found')}
                          </Text>
                        ) : (
                          <FlatList
                            data={filteredUsers}
                            keyExtractor={item => String(item.id)}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                            style={dropdownStyles.list}
                            renderItem={({ item }) => (
                              <TouchableOpacity
                                style={dropdownStyles.item}
                                onPress={() => handleUserSelect(item)}
                                activeOpacity={0.7}
                              >
                                <Text style={dropdownStyles.itemUsername}>
                                  @{item.username}
                                </Text>
                                {(item.firstname || item.lastname) ? (
                                  <Text style={dropdownStyles.itemFullname}>
                                    {[item.firstname, item.lastname]
                                      .filter(Boolean)
                                      .join(' ')}
                                  </Text>
                                ) : null}
                              </TouchableOpacity>
                            )}
                          />
                        )}
                      </View>
                    )}
                  </View>

                </View>
              </View>

              {/* Business Dropdown */}
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.label, { textAlign: 'left' }]}>
                  {t('add_connection_modal.select_business_label')}
                </Text>
                <TouchableOpacity
                  style={[
                    { borderWidth: 1, borderColor: errors.selectedBusiness ? (colors.error || 'red') : themeColors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: themeColors.surface },
                    (sellToPersonal || (!selectedUser && !sellToOwnBusiness)) && { opacity: 0.5 },
                  ]}
                  onPress={() => {
                    if (!sellToPersonal && (sellToOwnBusiness || selectedUser)) {
                      setBusinessDropdownOpen(prev => !prev);
                    }
                  }}
                  disabled={sellToPersonal || (!selectedUser && !sellToOwnBusiness)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[{ fontFamily: FONTS.display_regular, fontSize: 14, color: selectedBusiness ? colors.black : colors.placeholder ?? '#999' }]}
                    numberOfLines={1}
                  >
                    {selectedBusiness ? selectedBusiness.businessname : t('add_connection_modal.select_business_placeholder')}
                  </Text>
                </TouchableOpacity>
                {errors.selectedBusiness ? (
                  <Text style={{ color: colors.error || 'red', marginTop: 4, fontSize: 12 }}>
                    {errors.selectedBusiness}
                  </Text>
                ) : null}

                {businessDropdownOpen && !sellToPersonal && (selectedUser || sellToOwnBusiness) && (
                  <View style={{ borderWidth: 1, borderColor: themeColors.border, borderRadius: 8, marginTop: 4, backgroundColor: themeColors.surface, overflow: 'hidden', maxHeight: 200 }}>
                    {businessesLoading && !sellToOwnBusiness ? (
                      <ActivityIndicator size="small" color={themeColors.primary} style={{ margin: 12 }} />
                    ) : (sellToOwnBusiness ? businesses : allBusinesses).length === 0 ? (
                      <Text style={{ fontFamily: FONTS.display_regular, fontSize: 13, color: colors.gray, padding: 12, textAlign: 'center' }}>
                        {t('add_connection_modal.no_businesses_found')}
                      </Text>
                    ) : (
                      <FlatList
                        data={sellToOwnBusiness ? businesses : allBusinesses}
                        keyExtractor={(item) => String(item.id)}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[
                              { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: themeColors.lightGray ?? '#eee' },
                              selectedBusiness?.id === item.id && { backgroundColor: themeColors.primary + '22' },
                            ]}
                            onPress={() => {
                              setSelectedBusiness(item);
                              setBusinessDropdownOpen(false);
                              setErrors((e: any) => ({ ...e, selectedBusiness: undefined }));
                            }}
                          >
                            <Text style={{ fontFamily: FONTS.display_medium, fontSize: 14, color: themeColors.textPrimary }}>
                              {item.businessname}
                            </Text>
                            {item.description ? (
                              <Text style={{ fontFamily: FONTS.display_regular, fontSize: 12, color: colors.gray, marginTop: 2 }}>
                                {item.description}
                              </Text>
                            ) : null}
                          </TouchableOpacity>
                        )}
                      />
                    )}
                  </View>
                )}
              </View>

              {/* Sale Price and Date */}
              <View style={styles.rowContainer}>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, { textAlign: 'left' }]}>
                    {t('vehicles.sale_price')}
                  </Text>
                  <CustomInput
                    placeholder="0.00"
                    value={salePrice}
                    onChangeText={(text: string) => setSalePrice(text)}
                    containerStyle={styles.inputContainerNoMargin}
                    keyboardType="numeric"
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                  />
                  {errors.salePrice ? (
                    <Text style={{ color: colors.error || 'red', marginTop: 6, fontSize: 12 }}>
                      {errors.salePrice}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, { textAlign: 'left' }]}>
                    {t('vehicles.date')}
                  </Text>
                  <CustomDateTimePicker
                    placeholder={t('real_estate.select')}
                    value={date}
                    onChange={(selectedDate: any) => setDate(selectedDate)}
                    mode="date"
                    displayFormat="MM/DD/YYYY"
                    labelStyle={{ textAlign: 'left' }}
                    inputContainerStyle={{ borderRadius: 9 }}
                    suffixIcon={
                      <Feather name="calendar" size={20} color={colors.gray} />
                    }
                  />
                  {errors.date ? (
                    <Text style={{ color: colors.error || 'red', marginTop: 6, fontSize: 12 }}>
                      {errors.date}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Notes */}
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.label, { textAlign: 'left' }]}>
                  {t('vehicles.notes')}
                </Text>
                <CustomInput
                  placeholder={t('vehicles.notes')}
                  value={notes}
                  onChangeText={setNotes}
                  containerStyle={styles.inputContainerNoMargin}
                  multiline
                  numberOfLines={3}
                  inputStyle={{ textAlign: 'left', paddingTop: 8 }}
                />
              </View>

              {/* Additional Notes */}
              {/* <View style={{ marginTop: 12 }}>
              <Text style={[styles.label, { textAlign: 'left' }]}>
                {t('vehicles.additional_notes')}
              </Text>
              <CustomInput
                placeholder={t('vehicles.additional_notes')}
                value={additionalComments}
                onChangeText={setAdditionalComments}
                containerStyle={styles.inputContainerNoMargin}
                multiline
                numberOfLines={3}
                inputStyle={{ textAlign: 'left', paddingTop: 8 }}
              />
            </View> */}

              {/* Buttons */}
              {saleRecord?.id ? (
                <View style={styles.buttonContainer}>
                  <PrimaryButton
                    title={t('common.save')}
                    onPress={handleSave}
                    disabled={isSubmitting}
                    buttonStyle={[
                      styles.halfButton,
                      { backgroundColor: themeColors.primary },
                    ]}
                    loading={isSubmitting}
                  />
                  <PrimaryButton
                    title={t('vehicles.continue_to_transfer')}
                    onPress={handleContinueToTransfer}
                    disabled={isSubmitting}
                    buttonStyle={[
                      styles.halfButton,
                      { backgroundColor: themeColors.primary },
                    ]}
                  />
                </View>
              ) : (
                <PrimaryButton
                  title={t('vehicles.mark_as_sold')}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  buttonStyle={[
                    styles.markAsSoldButton,
                    { backgroundColor: themeColors.primary },
                  ]}
                  loading={isSubmitting}
                />
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default SellTransferVehicle;
