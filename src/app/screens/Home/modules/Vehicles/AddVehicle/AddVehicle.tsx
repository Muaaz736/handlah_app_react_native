import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../../components/notes/RecordNotesField';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeCommonStyles } from '../Vehicles.styles';
import { makeAddVehicleStyles } from './AddVehicle.styles';

import {
  AuthHeader,
  CustomInput,
  CustomDropDown,
  CustomDateTimePicker,
  PrimaryButton,
  RadioButton,
  ImageUploader,
  DocumentPicker,
  MixedMediaUploader,
  showInfoToast,
} from '../../../../../../components/common';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import FONTS from '../../../../../../utils/fonts';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS, isOtherSelected } from '../../../../../../utils/helpers';
import { RouteParams, Vehicle, AddVehiclePayload } from './AddVehicle.types';
import { useDispatch, useSelector } from 'react-redux';
import { addVehicleAsync, updateVehicleAsync } from '../../../../../../redux/services/assetsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { setAddVehicleStatus, setUpdateVehicleStatus } from '../../../../../../redux/slices/assetsSlice';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { Formik, FormikProps } from 'formik';
import { validationSchema } from '../../../../../../utils/validationSchemas';
import { getDropdownOptionsAsync, getVehicleRegistrationTypesAsync } from '../../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordExpensesEditor, useExpenseDrafts } from '../../../../../../components/expenses/RecordExpensesEditor';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

interface VehicleFormValues {
  year: string;
  make: string;
  model: string;
  nickname: string;
  vin: string;
  color: string;
  plate: string;
}

const AddVehicle = (): React.ReactElement => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { t, i18n } = useTranslation();
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(
    () => ({
      ...makeCommonStyles(themeColors as RoleTheme),
      ...makeAddVehicleStyles(themeColors as RoleTheme),
    }),
    [themeColors]
  );
  const { selectedBusinessId } = useSelectedBusiness();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const { add_vehicle_status, add_vehicle_data, update_vehicle_status } = useSelector((state: any) => state.assets_slice);

  // Get route params for edit mode
  const { vehicle, isEdit, ownerUserId, from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType } = (route?.params as any) || {};
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.Vehicle,
      recordId: isEdit && vehicle?.id ? Number(vehicle.id) : null,
      businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
      enabled: !ownerUserId && !accessLevel,
  });
  // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Vehicle, recordId: isEdit && vehicle?.id ? Number(vehicle.id) : null, enabled: links.enabled, choiceOnly: true });
  // New expenses typed on this form, created and linked when it's saved (as on the web).
  const expenseDrafts = useExpenseDrafts(isBusinessRole() ? selectedBusinessId ?? null : null);

  const { get_dropdown_options_data, get_vehicle_registration_types_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('VehicleType'));
    dispatch(getVehicleRegistrationTypesAsync(undefined));
  }, [dispatch]));

  const formikRef = useRef<FormikProps<VehicleFormValues>>(null);

  const formikInitialValues: VehicleFormValues = {
    year: vehicle?.year?.toString() || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    nickname: vehicle?.nickname || '',
    vin: vehicle?.vin || '',
    color: vehicle?.color || '',
    plate: vehicle?.plate || '',
  };

  const [vehicleType, setVehicleType] = useState<string>(vehicle?.vehicleType || vehicle?.vehicletype || '');
  const [vehicleTypeOther, setVehicleTypeOther] = useState<string>(vehicle?.vehicleTypeOther || vehicle?.vehicletypeother || '');
  const [buyCondition, setBuyCondition] = useState<'New' | 'Used' | 'Certified'>(vehicle?.condition || vehicle?.buyCondition || 'New');
  const [purchasedDate, setPurchasedDate] = useState<string>(vehicle?.purchaseddate || vehicle?.purchasedDate || '');
  const [soldDate, setSoldDate] = useState<string>(vehicle?.solddate || vehicle?.soldDate || '');
  const [purchasedDateKey, setPurchasedDateKey] = useState(0);
  const [soldDateKey, setSoldDateKey] = useState(0);
  const [registrationType, setRegistrationType] = useState<string>(vehicle?.registrationType || vehicle?.registrationtype || '');
  const [registrationTypeOther, setRegistrationTypeOther] = useState<string>(vehicle?.registrationTypeOther || vehicle?.registrationtypeother || '');
  const [registeredAddress, setRegisteredAddress] = useState<string>(vehicle?.registeredAddress || vehicle?.registeredaddress || '');
  const [registrationDate, setRegistrationDate] = useState<string>(vehicle?.registrationDate || vehicle?.registrationdate || '');
  const [registrationDateKey, setRegistrationDateKey] = useState(0);
  const [purchasedPrice, setPurchasedPrice] = useState<string>(vehicle?.purchasedPrice?.toString() || vehicle?.purchasedprice?.toString() || '');
  const [registrationExpiry, setRegistrationExpiry] = useState<string>(vehicle?.registrationExpiry || vehicle?.registrationexpiry || '');
  const [registrationExpiryKey, setRegistrationExpiryKey] = useState(0);
  const [notes, setNotes] = useState<string>(vehicle?.notes || '');
  const [additionalAttachmentIds, setAdditionalAttachmentIds] = useState<string[]>(() => {
    const existing = vehicle?.additionalAttachments || vehicle?.additionalattachments;
    return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
  });

  const [attachmentIds, setAttachmentIds] = useState<string[]>(() => {
    const existing = vehicle?.attachmenturl;
    return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
  });
  const [carfaxDocIds, setCarfaxDocIds] = useState<string[]>(() => {
    const existing = vehicle?.carfaxrecordurl;
    return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
  });

  const isLoading = add_vehicle_status === ASYNC_STATUS.LOADING || update_vehicle_status === ASYNC_STATUS.LOADING;

  // Reset stale status on mount
  useEffect(() => {
    dispatch(setAddVehicleStatus());
    dispatch(setUpdateVehicleStatus());
  }, []);

  // Prefill form in edit mode
  useEffect(() => {
    if (isEdit && vehicle) {
      formikRef.current?.setValues({
        year: vehicle.year?.toString() || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        nickname: vehicle.nickname || '',
        vin: vehicle.vin || '',
        color: vehicle.color || '',
        plate: vehicle.plate || '',
      });
      setBuyCondition(vehicle.condition || vehicle.buyCondition || 'New');
      setVehicleType(vehicle.vehicleType || vehicle.vehicletype || '');
      setVehicleTypeOther(vehicle.vehicleTypeOther || vehicle.vehicletypeother || '');
      setPurchasedDate(vehicle.purchaseddate || vehicle.purchasedDate || '');
      setSoldDate(vehicle.solddate || vehicle.soldDate || '');
      setRegistrationType(vehicle.registrationType || vehicle.registrationtype || '');
      setRegistrationTypeOther(vehicle.registrationTypeOther || vehicle.registrationtypeother || '');
      setRegisteredAddress(vehicle.registeredAddress || vehicle.registeredaddress || '');
      setRegistrationDate(vehicle.registrationDate || vehicle.registrationdate || '');
      setPurchasedPrice(vehicle.purchasedPrice?.toString() || vehicle.purchasedprice?.toString() || '');
      setRegistrationExpiry(vehicle.registrationExpiry || vehicle.registrationexpiry || '');
      setNotes(vehicle.notes || '');
    }
  }, [isEdit, vehicle]);

  // Handle success navigation
  useEffect(() => {
    if (isEdit) {
      if (update_vehicle_status === ASYNC_STATUS.SUCCEEDED) {
        dispatch(setUpdateVehicleStatus());
        // navigation.navigate('Vehicles' as never);
        navigation.goBack();
      }
    } else {
      if (add_vehicle_status === ASYNC_STATUS.SUCCEEDED) {
        dispatch(setAddVehicleStatus());

        if (add_vehicle_data?._offlineQueued) {
          showInfoToast(
            t('offline.parent_queued_toast'),
            t('common.info'),
          );
          navigation.navigate('Vehicles' as never);
        }
        if (ownerUserId) {
          (navigation as any).navigate('Vehicles', { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType });
        } else {
          const vehicleId = add_vehicle_data?.data?.id || add_vehicle_data?.id;
          (navigation as any).navigate('AddPurchaseFinancing', { vehicleId });
        }
      }
    }
  }, [add_vehicle_status, update_vehicle_status, add_vehicle_data, isEdit, navigation]);

  const handleSubmit = (values: VehicleFormValues) => {
    const vehiclePayload: AddVehiclePayload = {
      year: parseInt(values.year, 10),
      make: values.make.trim(),
      model: values.model.trim(),
      nickname: values.nickname.trim() || undefined,
      vin: values.vin.trim() || undefined,
      color: values.color || undefined,
      plate: values.plate.trim() || undefined,
      vehicleType: vehicleType || undefined,
      vehicleTypeOther: isOtherSelected(get_dropdown_options_data?.find((item: any) => item.value === vehicleType)?.label) ? vehicleTypeOther || undefined : undefined,
      condition: buyCondition,
      purchasedDate: purchasedDate || undefined,
      soldDate: soldDate || undefined,
      attachmentUrl: attachmentIds.length > 0 ? attachmentIds : [],
      carFaxRecordUrl: carfaxDocIds.length > 0 ? carfaxDocIds : [],
      registrationType: registrationType || undefined,
      registrationTypeOther: isOtherSelected(get_vehicle_registration_types_data?.find((item: any) => item.value === registrationType)?.label) ? registrationTypeOther || undefined : undefined,
      registeredAddress: registeredAddress.trim() || undefined,
      registrationDate: registrationDate || undefined,
      purchasedPrice: purchasedPrice ? parseFloat(purchasedPrice) : undefined,
      registrationExpiry: registrationExpiry || undefined,
      notes: notes.trim() || undefined,
      additionalAttachments: additionalAttachmentIds.length > 0 ? additionalAttachmentIds : [],
    };
    if (isOtherSelected(get_dropdown_options_data?.find((item: any) => item.value === vehicleType)?.label) && !vehicleTypeOther) {
      showInfoToast('Please specify the vehicle type.');
      return;
    }

    if (isBusinessRole()) {
      vehiclePayload.businessId = selectedBusinessId;
    }

    if (isEdit) {
      dispatch(updateVehicleAsync({ id: vehicle?.id, data: vehiclePayload })).then((a: any) => saveLinksAfter(links, a, vehicle?.id, expenseDrafts.createAll, recordNotes));
    } else {
      dispatch(addVehicleAsync({ ...vehiclePayload, ...(ownerUserId ? { ownerUserId } : {}) })).then((a: any) => saveLinksAfter(links, a, undefined, expenseDrafts.createAll, recordNotes));
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader
          title={t('vehicles.vehicle')}
          onBackPress={() => navigation.goBack()}
          containerStyle={{
            paddingHorizontal: 16,
            marginBottom: 0,
            paddingTop: isIOS ? 0 : 20,
          }}
          backButtonStyle={{ marginBottom: 0 }}
          titleStyle={{
            marginBottom: 0,
            marginTop: 20,
            textAlign: 'left',
          }}
          backButtonIconStyle={{ tintColor: themeColors?.textPrimary }}
        />
        {/* Tab */}
        <View style={styles.tabContainer}>
          <View style={styles.activeTab}>
            <Text style={[styles.activeTabText, { textAlign: 'left' }]}>
              {t('vehicles.overview')}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={isIOS ? 'padding' : undefined}
        >
          <Formik
            innerRef={formikRef}
            initialValues={formikInitialValues}
            validationSchema={validationSchema('add_vehicle')}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ handleChange, handleBlur, handleSubmit: formikSubmit, setFieldValue, values, errors, touched }) => (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Form */}
                <View style={styles.formContainer}>
                  {/* Year and Make */}
                  <View style={[styles.rowContainer, { flexDirection: 'row' }]}>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.year')} *
                      </Text>
                      <CustomInput
                        placeholder="2024"
                        value={values.year}
                        onChangeText={handleChange('year')}
                        onBlur={handleBlur('year')}
                        containerStyle={styles.inputContainerNoMargin}
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        keyboardType="number-pad"
                        maxLength={4}
                        error={touched.year && errors.year ? String(errors.year) : undefined}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.make')} *
                      </Text>
                      <CustomInput
                        placeholder={t('common.make_placeholder')}
                        value={values.make}
                        onChangeText={handleChange('make')}
                        onBlur={handleBlur('make')}
                        containerStyle={styles.inputContainerNoMargin}
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        autoCapitalize="words"
                        error={touched.make && errors.make ? String(errors.make) : undefined}
                      />
                    </View>
                  </View>

                  {/* Model and Nickname */}
                  <View style={[styles.rowContainer, { flexDirection: 'row' }]}>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.model')} *
                      </Text>
                      <CustomInput
                        placeholder={t('common.model_placeholder')}
                        value={values.model}
                        onChangeText={handleChange('model')}
                        onBlur={handleBlur('model')}
                        containerStyle={styles.inputContainerNoMargin}
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        autoCapitalize="words"
                        error={touched.model && errors.model ? String(errors.model) : undefined}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.nickname_optional')}
                      </Text>
                      <CustomInput
                        placeholder={t('common.nickname_placeholder')}
                        value={values.nickname}
                        onChangeText={handleChange('nickname')}
                        onBlur={handleBlur('nickname')}
                        containerStyle={styles.inputContainerNoMargin}
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* VIN and Color */}
                  <View style={[styles.rowContainer, { flexDirection: 'row' }]}>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.vin')}
                      </Text>
                      <CustomInput
                        placeholder={t('common.vin_placeholder')}
                        value={values.vin}
                        onChangeText={(text) => setFieldValue('vin', text.toUpperCase())}
                        onBlur={handleBlur('vin')}
                        containerStyle={styles.inputContainerNoMargin}
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        autoCapitalize="characters"
                        maxLength={21}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.color')}
                      </Text>
                      <CustomInput
                        placeholder={t('vehicles.select_color')}
                        value={values.color}
                        onChangeText={handleChange('color')}
                        onBlur={handleBlur('color')}
                        containerStyle={styles.inputContainerNoMargin}
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* Plate */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('vehicles.plate')}
                    </Text>
                    <CustomInput
                      placeholder={t('common.plate_placeholder')}
                      value={values.plate}
                      onChangeText={handleChange('plate')}
                      onBlur={handleBlur('plate')}
                      containerStyle={styles.inputContainer}
                      autoCapitalize="characters"
                    />

                  </View>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('vehicles.vehicle_type')}
                    </Text>
                    <CustomDropDown
                      options={get_dropdown_options_data}
                      value={vehicleType}
                      onSelect={(value) => {
                        setVehicleType(value as string);
                        if (!isOtherSelected(get_dropdown_options_data?.find((item: any) => item.value === value)?.label)) {
                          setVehicleTypeOther('');
                        }
                      }}
                      placeholder={t('vehicles.select_vehicle_type')}
                      search={true}
                      leftIcon={true}
                    />
                    {isOtherSelected(get_dropdown_options_data?.find((item: any) => item.value === vehicleType)?.label) && (
                      <View style={{ marginTop: 12 }}>
                        <CustomInput
                          value={vehicleTypeOther}
                          onChangeText={(text) => setVehicleTypeOther(text)}
                          placeholder={t('common.other_type_placeholder') || 'Please specify...'}
                          inputStyle={{ textAlign: 'left' }}
                        />
                      </View>
                    )}
                  </View>

                  {/* Purchased Date and Sold Date Row */}
                  <View style={[styles.rowContainer, { flexDirection: 'row' }]}>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.purchased_date')}
                      </Text>
                      <CustomDateTimePicker
                        key={`purchased-${purchasedDateKey}`}
                        placeholder={t('common.select')}
                        value={purchasedDate}
                        onChange={(val: any) => {
                          if (soldDate) {
                            const sel = new Date(new Date(val).setHours(0, 0, 0, 0));
                            const sold = new Date(new Date(soldDate).setHours(0, 0, 0, 0));
                            if (sel >= sold) {
                              setSoldDate('');
                              setSoldDateKey(k => k + 1);
                            }
                          }
                          setPurchasedDate(val);
                        }}
                        mode="date"
                        displayFormat="MM/DD/YYYY"
                        labelStyle={{ textAlign: 'left' }}
                        maximumDate={soldDate ? new Date(soldDate) : undefined}
                        suffixIcon={<Feather name="calendar" size={20} color={colors.gray} />}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.sold_date')}
                      </Text>
                      <CustomDateTimePicker
                        key={`sold-${soldDateKey}`}
                        placeholder={t('common.select')}
                        value={soldDate}
                        onChange={(val: any) => {
                          setSoldDate(val);
                        }}
                        mode="date"
                        displayFormat="MM/DD/YYYY"
                        labelStyle={{ textAlign: 'left' }}
                        minimumDate={purchasedDate ? new Date(purchasedDate) : undefined}
                        suffixIcon={<Feather name="calendar" size={20} color={colors.gray} />}
                      />
                    </View>
                  </View>

                  {/* Registration Type */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('vehicles.registration_type')}
                    </Text>
                    <CustomDropDown
                      options={get_vehicle_registration_types_data}
                      value={registrationType}
                      onSelect={(value) => {
                        setRegistrationType(value as string);
                        if (!isOtherSelected(get_vehicle_registration_types_data?.find((item: any) => item.value === value)?.label)) {
                          setRegistrationTypeOther('');
                        }
                      }}
                      placeholder={t('vehicles.select_registration_type')}
                      search={true}
                      leftIcon={true}
                    />
                    {isOtherSelected(get_vehicle_registration_types_data?.find((item: any) => item.value === registrationType)?.label) && (
                      <View style={{ marginTop: 12 }}>
                        <CustomInput
                          value={registrationTypeOther}
                          onChangeText={setRegistrationTypeOther}
                          placeholder={t('common.other_type_placeholder') || 'Please specify...'}
                          inputStyle={{ textAlign: 'left' }}
                        />
                      </View>
                    )}
                  </View>

                  {/* Registration Date and Expiry Row */}
                  <View style={[styles.rowContainer, { flexDirection: 'row' }]}>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.registration_date')}
                      </Text>
                      <CustomDateTimePicker
                        key={`reg-date-${registrationDateKey}`}
                        placeholder={t('common.select')}
                        value={registrationDate}
                        onChange={(val: any) => setRegistrationDate(val)}
                        mode="date"
                        displayFormat="MM/DD/YYYY"
                        labelStyle={{ textAlign: 'left' }}
                        suffixIcon={<Feather name="calendar" size={20} color={colors.gray} />}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.registration_expiry')}
                      </Text>
                      <CustomDateTimePicker
                        key={`reg-expiry-${registrationExpiryKey}`}
                        placeholder={t('common.select')}
                        value={registrationExpiry}
                        onChange={(val: any) => setRegistrationExpiry(val)}
                        mode="date"
                        displayFormat="MM/DD/YYYY"
                        labelStyle={{ textAlign: 'left' }}
                        suffixIcon={<Feather name="calendar" size={20} color={colors.gray} />}
                      />
                    </View>
                  </View>

                  {/* Registered Address */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('vehicles.registered_address')}
                    </Text>
                    <CustomInput
                      placeholder={t('vehicles.registered_address_placeholder') || 'Enter registered address'}
                      value={registeredAddress}
                      onChangeText={setRegisteredAddress}
                      containerStyle={styles.inputContainer}
                      inputStyle={{ textAlign: 'left' }}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Purchased Price */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('vehicles.purchased_price')}
                    </Text>
                    <CustomInput
                      placeholder="0.00"
                      value={purchasedPrice}
                      onChangeText={setPurchasedPrice}
                      containerStyle={styles.inputContainer}
                      inputStyle={{ textAlign: 'left' }}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  {/* Notes */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('vehicles.notes')}
                    </Text>
                    <CustomInput
                      placeholder={t('vehicles.notes_placeholder') || 'Add any notes...'}
                      value={notes}
                      onChangeText={setNotes}
                      containerStyle={styles.inputContainer}
                      inputStyle={{ textAlign: 'left' }}
                      multiline
                      numberOfLines={3}
                      autoCapitalize="sentences"
                    />
                  </View>

                  {/* Buy Condition */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('vehicles.buy_condition')}
                    </Text>
                    <View style={styles.radioGroup}>
                      <RadioButton
                        selected={buyCondition === 'New'}
                        onPress={() => setBuyCondition('New')}
                        label={t('vehicles.new')}
                        borderColor={colors.black}
                        fillColor={themeColors.primary}
                        labelStyle={styles.radioLabel}
                      />
                      <RadioButton
                        selected={buyCondition === 'Used'}
                        onPress={() => setBuyCondition('Used')}
                        label={t('vehicles.used')}
                        borderColor={colors.black}
                        fillColor={themeColors.primary}
                        labelStyle={styles.radioLabel}
                      />
                      <RadioButton
                        selected={buyCondition === 'Certified'}
                        onPress={() => setBuyCondition('Certified')}
                        label={t('vehicles.certified')}
                        borderColor={colors.black}
                        fillColor={themeColors.primary}
                        labelStyle={styles.radioLabel}
                      />
                    </View>
                  </View>

                  {/* Upload attachment/photo */}
                  <ImageUploader
                    multiple={true}
                    imageIds={attachmentIds}
                    onImageSelect={() => { }}
                    onImageUploaded={(ids: any) => setAttachmentIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                    label={t('vehicles.upload_attachment_photo')}
                    uploadType="box"
                    autoUpload={true}
                    removable={true}
                  />

                  {/* Import CarFax Record */}
                  <View style={styles.inputGroup}>
                    <MixedMediaUploader
                      mediaIds={carfaxDocIds}
                      onMediaChange={(ids) => setCarfaxDocIds(ids)}
                      label={t('vehicles.import_carfax_record')}
                      placeholder={t('vehicles.import_carfax_record')}
                      uploadType="box"
                      maxItems={5}
                      removable={true}
                      autoUpload={true}
                    />
                  </View>

                  {/* Additional Attachments */}
                  <MixedMediaUploader
                    mediaIds={additionalAttachmentIds}
                    onMediaChange={(ids) => setAdditionalAttachmentIds(ids)}
                    label={t('vehicles.additional_attachments')}
                    uploadType="box"
                    autoUpload={true}
                    maxItems={5}
                    removable={true}
                  />

                  {/* Continue Button */}
                  <RecordExpensesEditor links={links} drafts={expenseDrafts} />
                  <RecordNotesEncryptRow notes={recordNotes} />
                  <RecordLinksField links={links} />
                  <PrimaryButton
                    title={t('common.continue')}
                    onPress={() => formikSubmit()}
                    buttonStyle={styles.continueButton}
                    loading={isLoading}
                    disabled={isLoading}
                  />
                </View>
              </ScrollView>
            )}
          </Formik>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default AddVehicle;
