import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeCommonStyles } from '../Vehicles.styles';
import { makeAddAccidentsStyles } from './AddAccidents.styles';

import {
  AuthHeader,
  CustomInput,
  PrimaryButton,
  CustomDateTimePicker,
  CustomDropDown,
  ImageUploader,
  DocumentPicker,
  OfflineChainGuard,
  MixedMediaUploader,
  VendorAutocompleteInput,
} from '../../../../../../components/common';
import { useNavigation, useRoute, RouteProp, useFocusEffect, CommonActions } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import {
  DropdownOption,
  AccidentPayload,
} from './AddAccidents.types';
import { Formik } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { useDispatch, useSelector } from 'react-redux';
import { addVehicleAccidentAsync, updateVehicleAccidentAsync } from '../../../../../../redux/services/assetsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { setAddVehicleAccidentStatus, setUpdateVehicleAccidentStatus } from '../../../../../../redux/slices/assetsSlice';
import { getDropdownOptionsAsync } from '../../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

interface RouteParams {
  vehicleId?: string | number;
  editAccident?: any;
  addNew?: boolean;
}

const AddAccidents = (): React.ReactElement => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const styles = useMemo(
    () => ({
      ...makeCommonStyles(themeColors as RoleTheme),
      ...makeAddAccidentsStyles(themeColors as RoleTheme),
    }),
    [themeColors]
  );
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const { add_vehicle_accidents_bulk_status, update_vehicle_accident_status } = useSelector((state: any) => state.assets_slice);

  // Get vehicleId and editAccident from route params
  const { vehicleId, editAccident, addNew } = (route?.params as RouteParams) || {};
  const ownerUserId = (route?.params as any)?.ownerUserId;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.VehicleAccident,
        recordId: editAccident?.id ? Number(editAccident.id) : null,
        businessId: 'auto',
        enabled: !ownerUserId,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.VehicleAccident, recordId: editAccident?.id ? Number(editAccident.id) : null, enabled: links.enabled });

  // Formik ref and initial values for required fields
  const formikRef = useRef<any>(null);

  const formikInitialValues = {
    date: null as string | null,
    claimNumber: '',
    insuranceType: '',
    damage: '',
    repairDateStart: null as string | null,
    repairDateEnd: null as string | null,
    shop: '',
    totalRepairCost: '',
  };

  // States for non-required fields (attachments)
  const [beforePhotoIds, setBeforePhotoIds] = useState<string[]>(() => {
    const existing = editAccident?.attachmentbefore;
    return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
  });
  const [afterPhotoIds, setAfterPhotoIds] = useState<string[]>(() => {
    const existing = editAccident?.attachmentafter;
    return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
  });
  const [policeReportIds, setPoliceReportIds] = useState<string[]>(() => {
    const existing = editAccident?.policereporturl;
    return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
  });

  const isLoading = add_vehicle_accidents_bulk_status === ASYNC_STATUS.LOADING || update_vehicle_accident_status === ASYNC_STATUS.LOADING;

  // Prefill form when editing from modal
  useEffect(() => {
    if (editAccident) {
      formikRef.current?.setValues({
        date: editAccident.date || null,
        claimNumber: editAccident.claimnumber || '',
        insuranceType: editAccident.insurancetype || '',
        damage: editAccident.damage || '',
        repairDateStart: editAccident.repairdatefrom || null,
        repairDateEnd: editAccident.repairdateto || null,
        shop: editAccident.shop || '',
        totalRepairCost: editAccident.totalrepaircost?.toString() || '',
      });
      setBeforePhotoIds((() => { const e = editAccident.attachmentbefore; return Array.isArray(e) ? e : e ? [e as string] : []; })());
      setAfterPhotoIds((() => { const e = editAccident.attachmentafter; return Array.isArray(e) ? e : e ? [e as string] : []; })());
      setPoliceReportIds((() => { const e = editAccident.policereporturl; return Array.isArray(e) ? e : e ? [e as string] : []; })());
    }
  }, [editAccident]);

  // Reset statuses on mount to prevent stale SUCCEEDED
  useEffect(() => {
    dispatch(setAddVehicleAccidentStatus());
    dispatch(setUpdateVehicleAccidentStatus());
  }, []);

  // Handle success navigation
  useEffect(() => {
    if (editAccident) {
      if (update_vehicle_accident_status === ASYNC_STATUS.SUCCEEDED) {
        dispatch(setUpdateVehicleAccidentStatus());
        navigation.goBack();
      }
    } else {
      if (add_vehicle_accidents_bulk_status === ASYNC_STATUS.SUCCEEDED) {
        dispatch(setAddVehicleAccidentStatus());
        // Reset all form and attachment state
        formikRef.current?.resetForm();
        setBeforePhotoIds([]);
        setAfterPhotoIds([]);
        setPoliceReportIds([]);
        addNew ? navigation.goBack() :
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                {
                  name: 'Dashboard',
                },
                {
                  name: 'Vehicles',
                },
              ],
            })
          );
      }
    }
  }, [add_vehicle_accidents_bulk_status, update_vehicle_accident_status, navigation, vehicleId, addNew, editAccident]);

  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('VehicleInsuranceType'));
  }, [dispatch]));


  const handleAddVehicle = (values: any): void => {
    if (!vehicleId) {
      // Skip if no accidents
      (navigation as any).navigate('Vehicles');
      return;
    }

    // Convert accidents to API format
    const payload: AccidentPayload = {
      date: values.date || new Date().toISOString(),
      claimNumber: values.claimNumber,
      insuranceType: values.insuranceType,
      damage: values.damage,
      repairDateFrom: values.repairDateStart || undefined,
      repairDateTo: values.repairDateEnd || undefined,
      shop: values.shop,
      totalRepairCost: parseFloat(values.totalRepairCost) || 0,
      attachmentBefore: beforePhotoIds.length > 0 ? beforePhotoIds : undefined,
      attachmentAfter: afterPhotoIds.length > 0 ? afterPhotoIds : undefined,
      policeReportUrl: policeReportIds.length > 0 ? policeReportIds : undefined,
    };

    if (editAccident) {
      dispatch(updateVehicleAccidentAsync({
        vehicleId,
        accidentId: editAccident.id,
        data: payload,
      })).then((a: any) => saveLinksAfter(links, a, editAccident.id, undefined, recordNotes));
    } else {
      dispatch(addVehicleAccidentAsync({ vehicleId, data: { ...payload, ...(ownerUserId ? { ownerUserId } : {}) } })).then((a: any) => saveLinksAfter(links, a, undefined, undefined, recordNotes));
    }
  };

  const handleSkip = (): void => {
    (navigation as any).pop(6);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
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
            backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
          />
          {!editAccident && !addNew && (
            <TouchableOpacity
              style={[
                styles.skipButton,
                {
                  borderColor: themeColors?.isDark ? themeColors.primary : themeColors.secondary,
                  backgroundColor: themeColors?.isDark ? themeColors.primary + '10' : themeColors.secondary + '10',
                },
              ]}
              onPress={handleSkip}
              activeOpacity={0.8}
            >
              <Text style={[styles.skipButtonText, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}>{t('common.skip_this')}</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Tab */}
        <View style={styles.tabContainer}>
          <View style={styles.activeTab}>
            <Text style={[styles.activeTabText, { textAlign: 'left' }]}>
              {t('vehicles.accidents_tab')}
            </Text>
          </View>
        </View>
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <Formik
            innerRef={formikRef}
            initialValues={formikInitialValues}
            validationSchema={validationSchema('vehicle_accident')}
            onSubmit={handleAddVehicle}
            enableReinitialize={true}
          >
            {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, touched, errors }) => (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Form */}
                <View style={styles.formContainer}>
                  {/* Date and Claim # */}
                  <View
                    style={[
                      styles.rowContainer,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.date')} *
                      </Text>
                      <CustomDateTimePicker
                        placeholder={t('real_estate.select')}
                        value={values.date}
                        onChange={(selectedDate: any) => setFieldValue('date', selectedDate)}
                        mode="date"
                        displayFormat="MM/DD/YYYY"
                        labelStyle={{ textAlign: 'left' }}
                        suffixIcon={
                          <Feather name="calendar" size={20} color={colors.gray} />
                        }
                        error={touched.date && errors.date ? String(errors.date) : undefined}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.claim_number')}
                      </Text>
                      <CustomInput
                        placeholder={t('vehicles.claim_number_placeholder') || 'Claim #'}
                        value={values.claimNumber}
                        onChangeText={handleChange('claimNumber')}
                        onBlur={handleBlur('claimNumber')}
                        containerStyle={styles.inputContainerNoMargin}
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        error={touched.claimNumber && errors.claimNumber ? String(errors.claimNumber) : undefined}
                      />
                    </View>
                  </View>

                  {/* Insurance Type and Damage */}
                  <View
                    style={[
                      styles.rowContainer,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.insurance_type')} *
                      </Text>
                      <CustomDropDown
                        options={get_dropdown_options_data}
                        value={values.insuranceType}
                        onSelect={(selectedValue: any) =>
                          setFieldValue('insuranceType', selectedValue)
                        }
                        placeholder={t('real_estate.select')}
                        search={false}
                        leftIcon={true}
                        error={touched.insuranceType && errors.insuranceType ? true : false}
                        selectedTextStyle={{ fontSize: 13 }}
                        selectedTextProps={{ numberOfLines: 1, ellipsizeMode: 'tail' }}
                      />
                      {touched.insuranceType && errors.insuranceType && <Text style={styles.errorText}>{String(errors.insuranceType)}</Text>}
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.damage')} *
                      </Text>
                      <CustomInput
                        placeholder={t('vehicles.damage_placeholder') || 'What Was Damaged ?'}
                        value={values.damage}
                        onChangeText={handleChange('damage')}
                        onBlur={handleBlur('damage')}
                        containerStyle={styles.inputContainerNoMargin}
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        error={touched.damage && errors.damage ? String(errors.damage) : undefined}
                      />
                    </View>
                  </View>

                  {/* Repair Dates */}
                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.rowContainer,
                        {
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          marginBottom: 0,
                        },
                      ]}
                    >
                      <View style={styles.halfInput}>
                        <Text style={[styles.label, { textAlign: 'left' }]}>
                          {t('vehicles.repair_start_date')}
                        </Text>
                        <CustomDateTimePicker
                          placeholder={t('real_estate.select')}
                          value={values.repairDateStart}
                          onChange={(selectedDate: any) =>
                            setFieldValue('repairDateStart', selectedDate)
                          }
                          mode="date"
                          displayFormat="MM/DD/YYYY"
                          labelStyle={{ textAlign: 'left' }}
                          suffixIcon={
                            <Feather name="calendar" size={20} color={colors.gray} />
                          }
                          error={touched.repairDateStart && errors.repairDateStart ? String(errors.repairDateStart) : undefined}
                        />
                      </View>
                      <View style={styles.halfInput}>
                        <Text style={[styles.label, { textAlign: 'left' }]}>
                          {t('vehicles.repair_end_date')}
                        </Text>
                        <CustomDateTimePicker
                          placeholder={t('real_estate.select')}
                          value={values.repairDateEnd}
                          onChange={(selectedDate: any) =>
                            setFieldValue('repairDateEnd', selectedDate)
                          }
                          mode="date"
                          displayFormat="MM/DD/YYYY"
                          labelStyle={{ textAlign: 'left' }}
                          suffixIcon={
                            <Feather name="calendar" size={20} color={colors.gray} />
                          }
                          error={touched.repairDateEnd && errors.repairDateEnd ? String(errors.repairDateEnd) : undefined}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Shop and Total Repair Cost */}
                  <View
                    style={[
                      styles.rowContainer,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.shop') || 'Shop'}
                      </Text>
                      <VendorAutocompleteInput category="vehicle_shop"
                        placeholder={t('vehicles.shop_placeholder') || 'Shop/Vendor'}
                        value={values.shop}
                        onChangeText={handleChange('shop')}
                        onBlur={handleBlur('shop')}
                        containerStyle={styles.inputContainerNoMargin}
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        error={touched.shop && errors.shop ? String(errors.shop) : undefined}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.total_repair_cost') || 'Total Repair Cost'}
                      </Text>
                      <CustomInput
                        placeholder="0.00"
                        value={values.totalRepairCost}
                        onChangeText={handleChange('totalRepairCost')}
                        onBlur={handleBlur('totalRepairCost')}
                        containerStyle={styles.inputContainerNoMargin}
                        keyboardType="decimal-pad"
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        error={touched.totalRepairCost && errors.totalRepairCost ? String(errors.totalRepairCost) : undefined}
                      />
                    </View>
                  </View>

                  {/* Before Photo and After Photo */}
                  <View
                    style={[
                      styles.rowContainer,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View style={styles.halfInput}>
                      <ImageUploader
                        multiple={true}
                        imageIds={beforePhotoIds}
                        onImageSelect={() => { }}
                        removable={true}
                        maxImages={5}
                        onImageUploaded={(ids: any) => setBeforePhotoIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                        label={t('vehicles.before_photo')}
                        uploadType="box"
                        autoUpload={true}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <ImageUploader
                        multiple={true}
                        imageIds={afterPhotoIds}
                        onImageSelect={() => { }}
                        removable={true}
                        maxImages={5}
                        onImageUploaded={(ids: any) => setAfterPhotoIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                        label={t('vehicles.after_photo')}
                        uploadType="box"
                        autoUpload={true}
                      />
                    </View>
                  </View>

                  {/* Police Report / Docs */}
                  <View style={styles.inputGroup}>
                    <MixedMediaUploader
                      mediaIds={policeReportIds}
                      onMediaChange={(ids: string[]) => setPoliceReportIds(ids)}
                      label={t('vehicles.police_report') || 'Upload Attachments'}
                      uploadType="box"
                      maxItems={5}
                      removable={true}
                      autoUpload={true}
                    />
                  </View>

                  {/* Continue Button */}
                  <OfflineChainGuard isWizardMode={!editAccident && !addNew}>
                    <PrimaryButton
                      title={`${editAccident ? t('common.update') : t('common.add')} ${t('vehicles.accident')}`}
                      onPress={() => handleSubmit()}
                      buttonStyle={[
                        styles.addVehicleButton,
                        { backgroundColor: themeColors.primary },
                      ]}
                      loading={isLoading}
                      disabled={isLoading}
                    />
                  </OfflineChainGuard>
                </View>
              <RecordNotesField notes={recordNotes} />
              <RecordLinksField links={links} />
              </ScrollView>
            )}
          </Formik>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default AddAccidents;
