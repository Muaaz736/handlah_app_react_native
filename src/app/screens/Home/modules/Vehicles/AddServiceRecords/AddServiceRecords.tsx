import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../../components/notes/RecordNotesField';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeCommonStyles } from '../Vehicles.styles';
import { makeAddServiceRecordsStyles } from './AddServiceRecords.styles';

import {
  AuthHeader,
  CustomInput,
  PrimaryButton,
  CustomDateTimePicker,
  CustomDropDown,
  ImageUploader,
  OfflineChainGuard,
  MixedMediaUploader,
  VendorAutocompleteInput,
} from '../../../../../../components/common';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import {
  DropdownOption,
  ServiceRecordPayload,
} from './AddServiceRecords.types';
import { useDispatch, useSelector } from 'react-redux';
import { addVehicleServiceRecordsBulkAsync, updateVehicleServiceRecordAsync } from '../../../../../../redux/services/assetsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { setAddVehicleServiceRecordsStatus, setUpdateVehicleServiceRecordsStatus } from '../../../../../../redux/slices/assetsSlice';
import { Formik, FormikProps } from 'formik';
import { validationSchema } from '../../../../../../utils/validationSchemas';
import { getDropdownOptionsAsync } from '../../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

interface ServiceRecordFormValues {
  date: string;
  type: string[];
  vendorShop: string;
  odometer: string;
  cost: string;
  notes: string;
}

interface RouteParams {
  vehicleId?: string | number;
  editRecord?: any;
  addNew?: boolean;
}

const AddServiceRecords = (): React.ReactElement => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const styles = useMemo(
    () => ({
      ...makeCommonStyles(themeColors as RoleTheme),
      ...makeAddServiceRecordsStyles(themeColors as RoleTheme),
    }),
    [themeColors]
  );
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const { add_vehicle_service_records_bulk_status, update_vehicle_service_record_status } = useSelector((state: any) => state.assets_slice);

  // Get vehicleId and editRecord from route params
  const { vehicleId, editRecord, addNew } = (route?.params as RouteParams) || {};
  const ownerUserId = (route?.params as any)?.ownerUserId;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.VehicleService,
        recordId: editRecord?.id ? Number(editRecord.id) : null,
        businessId: 'auto',
        enabled: !ownerUserId,
    });
    // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.VehicleService, recordId: editRecord?.id ? Number(editRecord.id) : null, enabled: links.enabled, choiceOnly: true });

  const [attachmentIds, setAttachmentIds] = useState<string[]>(() => {
    const existing = editRecord?.attachment;
    return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
  });

  // Re-sync attachments if editRecord arrives/changes (e.g. from modal)
  useEffect(() => {
    if (editRecord) {
      const existing = editRecord.attachment;
      setAttachmentIds(Array.isArray(existing) ? existing : existing ? [existing as string] : []);
    }
  }, [editRecord]);

  const isLoading = add_vehicle_service_records_bulk_status === ASYNC_STATUS.LOADING || update_vehicle_service_record_status === ASYNC_STATUS.LOADING;

  const formikRef = useRef<FormikProps<ServiceRecordFormValues>>(null);

  const formikInitialValues: ServiceRecordFormValues = {
    date: editRecord?.date || '',
    type: Array.isArray(editRecord?.type) ? editRecord.type : editRecord?.type ? [editRecord.type] : [],
    vendorShop: editRecord?.vendor || '',
    odometer: editRecord?.odometer?.toString() || '',
    cost: editRecord?.cost?.toString() || '',
    notes: editRecord?.notes || '',
  };

  // Reset statuses on mount to prevent stale SUCCEEDED
  useEffect(() => {
    dispatch(setAddVehicleServiceRecordsStatus());
    dispatch(setUpdateVehicleServiceRecordsStatus());
  }, []);

  // Handle success navigation
  useEffect(() => {
    if (editRecord) {
      if (update_vehicle_service_record_status === ASYNC_STATUS.SUCCEEDED) {
        dispatch(setUpdateVehicleServiceRecordsStatus());
        navigation.goBack();
      }
    } else {
      if (add_vehicle_service_records_bulk_status === ASYNC_STATUS.SUCCEEDED) {
        dispatch(setAddVehicleServiceRecordsStatus());
        formikRef.current?.resetForm();
        setAttachmentIds([]);
        addNew ? navigation.goBack() :
          (navigation as any).navigate('AddAccidents', { vehicleId });
      }
    }
  }, [add_vehicle_service_records_bulk_status, update_vehicle_service_record_status, vehicleId, navigation, addNew, editRecord]);

  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('VehicleServiceType'));
  }, [dispatch]));

  const handleSubmit = (values: ServiceRecordFormValues): void => {
    if (!vehicleId) {
      navigation.navigate('AddAccidents' as never);
      return;
    }

    const payload: ServiceRecordPayload = {
      date: values.date,
      type: values.type,
      vendor: values.vendorShop,
      odometer: Number(values.odometer) || 0,
      cost: Number(values.cost) || 0,
      notes: values.notes,
      attachment: attachmentIds.length > 0 ? attachmentIds : [],
    };

    if (editRecord) {
      dispatch(updateVehicleServiceRecordAsync({
        vehicleId: Number(vehicleId),
        recordId: editRecord.id,
        data: payload,
      })).then((a: any) => saveLinksAfter(links, a, editRecord.id, undefined, recordNotes));
    } else {
      dispatch(addVehicleServiceRecordsBulkAsync({ vehicleId, data: { ...payload, ...(ownerUserId ? { ownerUserId } : {}) } })).then((a: any) => saveLinksAfter(links, a, undefined, undefined, recordNotes));
    }
  };

  const handleSkip = (): void => {
    (navigation as any).navigate('AddAccidents', { vehicleId });
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
              marginTop: 10,
              textAlign: 'left',
            }}
            backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
          />
          {!editRecord && !addNew && (
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
              {t('vehicles.service_records_tab')}
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
            validationSchema={validationSchema('add_service_record')}
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
                  {/* Date and Type */}
                  <View
                    style={[
                      // styles.rowContainer,
                      // { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.date')} *
                      </Text>
                      <CustomDateTimePicker
                        placeholder={t('real_estate.select')}
                        value={values.date || null}
                        onChange={(selectedDate: any) => setFieldValue('date', selectedDate)}
                        mode="date"
                        displayFormat="MM/DD/YYYY"
                        labelStyle={{ textAlign: 'left' }}
                        suffixIcon={
                          <Feather name="calendar" size={20} color={colors.gray} />
                        }
                      />
                      {touched.date && errors.date && (
                        <Text style={styles.errorText}>{String(errors.date)}</Text>
                      )}
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.type')} *
                      </Text>
                      <CustomDropDown
                        options={get_dropdown_options_data}
                        selectedItems={values.type}
                        onSelect={(selectedValue: any) => setFieldValue('type', selectedValue)}
                        placeholder={t('common.oil_change')}
                        search={false}
                        leftIcon={true}
                        multiSelect={true}
                      />
                      {touched.type && errors.type && (
                        <Text style={styles.errorText}>{String(errors.type)}</Text>
                      )}
                    </View>
                  </View>

                  {/* Vendor/Shop and Odometer */}
                  <View
                    style={[
                      styles.rowContainer,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.vendor_shop')}
                      </Text>
                      <VendorAutocompleteInput category="vehicle_shop"
                        placeholder={t('common.vendor')}
                        value={values.vendorShop}
                        onChangeText={handleChange('vendorShop')}
                        onBlur={handleBlur('vendorShop')}
                        containerStyle={styles.inputContainerNoMargin}
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        autoCapitalize="words"
                        error={touched.vendorShop && errors.vendorShop ? String(errors.vendorShop) : undefined}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('vehicles.odometer')}
                      </Text>
                      <CustomInput
                        placeholder={t('common.odometer')}
                        value={values.odometer}
                        onChangeText={handleChange('odometer')}
                        onBlur={handleBlur('odometer')}
                        containerStyle={styles.inputContainerNoMargin}
                        keyboardType="numeric"
                        labelStyle={{ textAlign: 'left' }}
                        inputStyle={{ textAlign: 'left' }}
                        error={touched.odometer && errors.odometer ? String(errors.odometer) : undefined}
                      />
                    </View>
                  </View>

                  {/* Cost */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('vehicles.cost')}
                    </Text>
                    <CustomInput
                      placeholder="0.00"
                      value={values.cost}
                      onChangeText={handleChange('cost')}
                      onBlur={handleBlur('cost')}
                      containerStyle={styles.inputContainer}
                      keyboardType="decimal-pad"
                      error={touched.cost && errors.cost ? String(errors.cost) : undefined}
                    />
                  </View>

                  {/* Upload Attachments */}
                  <MixedMediaUploader
                    mediaIds={attachmentIds}
                    onMediaChange={(ids: any) => setAttachmentIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                    label={t('real_estate.upload_attachments') || 'Upload Attachments'}
                    uploadType="box"
                    maxItems={5}
                    removable={true}
                    autoUpload={true}
                  />

                  {/* Notes */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('vehicles.notes')}
                    </Text>
                    <TextInput
                      placeholder={t('common.notes_placeholder')}
                      placeholderTextColor={colors.gray}
                      value={values.notes}
                      onChangeText={handleChange('notes')}
                      onBlur={handleBlur('notes')}
                      multiline={true}
                      numberOfLines={4}
                      textAlignVertical="top"
                      style={styles.notesInput}
                    />
                  </View>

                  {/* Continue Button */}
                  <OfflineChainGuard isWizardMode={!editRecord && !addNew}>
                    <PrimaryButton
                      title={`${editRecord ? t('common.update') : t('common.add')} ${t('vehicles.service_record')}`}
                      onPress={() => formikSubmit()}
                      buttonStyle={[
                        styles.addVehicleButton,
                        { backgroundColor: themeColors.primary },
                      ]}
                      loading={isLoading}
                      disabled={isLoading}
                    />
                  </OfflineChainGuard>
                </View>
              <RecordNotesEncryptRow notes={recordNotes} />
              <RecordLinksField links={links} />
              </ScrollView>
            )}
          </Formik>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default AddServiceRecords;
