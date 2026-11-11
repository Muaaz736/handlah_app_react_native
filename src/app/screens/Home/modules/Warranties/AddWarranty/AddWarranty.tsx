import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../../components/notes/RecordNotesField';
import { Formik } from 'formik';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BillingFrequencyField from '../../../../../../components/common/BillingFrequencyField';
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import {
  AuthHeader,
  CustomDateTimePicker,
  AssignmentDropdownField,
  CustomInput,
  MixedMediaUploader,
  PrimaryButton,
  VendorAutocompleteInput
} from '../../../../../../components/common';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useAssignmentFields } from '../../../../../../hooks/useAssignmentFields';
import { addWarrantyAsync, updateWarrantyAsync } from '../../../../../../redux/services/liabilitiesService';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { AppDispatch } from '../../../../../../types/store.types';
import colors from '../../../../../../utils/colors';
import { isIOS } from '../../../../../../utils/helpers';
import validationSchema from '../../../../../../utils/validationSchemas';
import { makeAddWarrantyStyles } from './AddWarranty.styles';
import { RouteParams } from './AddWarranty.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

const AddWarranty = (): React.ReactElement => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { t } = useTranslation();
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeAddWarrantyStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();
  const formikRef = useRef<any>(null);

  const isBusiness = isBusinessRole();
  const { warranty, isEdit, ownerUserId, ownerBusinessId, ownerName, isFromEmergencyAccess } = (route?.params as any) || {};
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.Warranty,
      recordId: isEdit && warranty?.id ? Number(warranty.id) : null,
      businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
      enabled: !ownerUserId && !isFromEmergencyAccess,
  });
  // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Warranty, recordId: isEdit && warranty?.id ? Number(warranty.id) : null, enabled: links.enabled, choiceOnly: true });
  const isOwnerScoped = !!ownerUserId;

  const { add_warranty_status, update_warranty_status } = useSelector(
    (state: any) => state.liabilities_slice,
  );

  const propertyDropdownLabel = isBusiness
    ? (t('warranties.link_business_property') || 'Business Property')
    : (t('warranties.link_personal_property') || 'Personal Property');

  const propertyDropdownPlaceholder = isBusiness
    ? (t('warranties.link_business_property_placeholder') || 'Select a business property...')
    : (t('warranties.link_personal_property_placeholder') || 'Select a personal property...');

  const linkedVehicleId = (warranty as any)?.vehicleid ?? (warranty as any)?.vehicleId;
  const linkedPropertyId =
    (warranty as any)?.personalpropertyid ??
    (warranty as any)?.personalPropertyId ??
    (warranty as any)?.propertyid ??
    (warranty as any)?.propertyId ??
    (warranty as any)?.property?.id;
  const linkedRealEstateId = (warranty as any)?.realestateid ?? (warranty as any)?.realEstateId;

  const assignment = useAssignmentFields({
    slots: ['vehicle', 'property', 'realestate'],
    isOwnerScoped,
    isEmergency: !!isFromEmergencyAccess,
    ownerUserId,
    ownerName,
    ownerBusinessId,
    isBusiness,
    myBusinessId: selectedBusinessId,
    linkedIds: {
      vehicle: linkedVehicleId,
      property: linkedPropertyId,
      realestate: linkedRealEstateId,
    },
    linkedAssets: {
      vehicle: (warranty as any)?.vehicle,
      property: (warranty as any)?.property,
      realestate: (warranty as any)?.realestate ?? (warranty as any)?.realEstate,
    },
  });

  const isLoading =
    add_warranty_status === ASYNC_STATUS.LOADING ||
    update_warranty_status === ASYNC_STATUS.LOADING;

  const [attachmentIds, setAttachmentIds] = useState<string[]>(() => {
    const existing = (warranty as any)?.uploadattachments || warranty?.uploadAttachments;
    return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
  });

  const formikInitialValues = {
    itemName: (warranty as any)?.itemname || warranty?.itemName || '',
    warrantyProvider:
      (warranty as any)?.warrantyprovider || warranty?.warrantyProvider || '',
    startDate:
      (warranty as any)?.startdate || warranty?.startDate || (null as string | null),
    expiration:
      (warranty as any)?.expiration || warranty?.expiration || (null as string | null),
    notes: (warranty as any)?.notes || warranty?.notes || '',
    website: (warranty as any)?.website || warranty?.website || '',
    warrantyNumber: (warranty as any)?.warrantynumber || (warranty as any)?.warrantyNumber || '',
    cost:
      (warranty as any)?.cost !== undefined && (warranty as any)?.cost !== null
        ? String((warranty as any).cost)
        : '',
    billingFrequency: (warranty as any)?.billingfrequency || (warranty as any)?.billingFrequency || '',
    realEstateId: linkedRealEstateId ? String(linkedRealEstateId) : '',
    vehicleId: linkedVehicleId ? String(linkedVehicleId) : '',
    personalPropertyId: linkedPropertyId ? String(linkedPropertyId) : ''
  };

  const handleSubmit = async (values: any): Promise<void> => {
    const formatDate = (date: string | null): string | null => {
      if (!date) return null;
      try {
        return new Date(date).toISOString();
      } catch {
        return null;
      }
    };

    const warrantyData = {
      itemName: values.itemName,
      warrantyProvider: values.warrantyProvider,
      notes: values.notes,
      ...(formatDate(values.startDate) ? { startDate: formatDate(values.startDate) } : {}),
      ...(formatDate(values.expiration) ? { expiration: formatDate(values.expiration) } : {}),
      website: values.website,
      ...(values.warrantyNumber ? { warrantyNumber: values.warrantyNumber } : {}),
      ...(values.cost ? { cost: parseFloat(values.cost) } : {}),
            ...(values.billingFrequency ? { billingFrequency: values.billingFrequency } : {}),
      uploadAttachments: attachmentIds.length > 0 ? attachmentIds : [],
      ...(values.realEstateId ? { realEstateId: parseInt(values.realEstateId) } : {}),
      ...(values.vehicleId ? { vehicleId: parseInt(values.vehicleId) } : {}),
      ...(values.personalPropertyId ? { propertyId: parseInt(values.personalPropertyId) } : {}),
      ...(isBusiness && selectedBusinessId && { businessId: selectedBusinessId })
    };

    try {
      if (isEdit && warranty?.id) {
        await dispatch(
          updateWarrantyAsync({
            id: warranty.id,
            data: {
              ...warrantyData,
              realEstateId: values.realEstateId ? parseInt(values.realEstateId) : null,
              vehicleId: values.vehicleId ? parseInt(values.vehicleId) : null,
              propertyId: values.personalPropertyId ? parseInt(values.personalPropertyId) : null,
              personalPropertyId: values.personalPropertyId ? parseInt(values.personalPropertyId) : null,
            },
          }),
        ).unwrap();
        await links.saveOrWarn(Number(warranty.id));
      } else {
        const created = await dispatch(addWarrantyAsync({ ...warrantyData, ...(ownerUserId ? { ownerUserId } : {}) })).unwrap();
        saveLinksAfter(links, { meta: { requestStatus: 'fulfilled' }, payload: created }, undefined, undefined, recordNotes);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save warranty:', error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader
          title={isEdit ? t('warranties.edit_warranty') : t('warranties.add_warranty')}
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
        <KeyboardAvoidingView behavior={isIOS ? undefined : 'height'} style={{ flex: 1 }}>
          <Formik
            innerRef={formikRef}
            initialValues={formikInitialValues}
            validationSchema={validationSchema('warranty')}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
            enableReinitialize={true}
          >
            {({
              values,
              handleChange,
              handleBlur,
              handleSubmit: formikSubmit,
              setFieldValue,
              setFieldTouched,
              touched,
              errors,
              validateForm
            }) => (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={true}
                keyboardDismissMode="interactive"
              >
                <View style={styles.formContainer}>
                  {/* Item name */}
                  <View style={styles.fullWidthContainer}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('warranties.item_name')} *
                    </Text>
                    <CustomInput
                      placeholder={t('warranties.item_name_placeholder')}
                      value={values.itemName}
                      onChangeText={handleChange('itemName')}
                      onBlur={handleBlur('itemName')}
                      containerStyle={styles.inputContainerNoMargin}
                      error={
                        touched.itemName && errors.itemName
                          ? String(errors.itemName)
                          : undefined
                      }
                    />
                  </View>

                  {/* Warranty Provider */}
                  <View style={styles.fullWidthContainer}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('warranties.warranty_provider')} *
                    </Text>
                    <VendorAutocompleteInput
                      category="warranty_provider"
                      placeholder={t('warranties.warranty_provider_placeholder')}
                      value={values.warrantyProvider}
                      onChangeText={handleChange('warrantyProvider')}
                      onBlur={handleBlur('warrantyProvider')}
                      containerStyle={styles.inputContainerNoMargin}
                      error={
                        touched.warrantyProvider && errors.warrantyProvider
                          ? String(errors.warrantyProvider)
                          : undefined
                      }
                    />
                  </View>

                  {/* Warranty Number & Cost */}
                  <View style={styles.rowContainer}>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('warranties.warranty_number') || 'Warranty #'}
                      </Text>
                      <CustomInput
                        placeholder={t('warranties.warranty_number')}
                        value={values.warrantyNumber}
                        onChangeText={handleChange('warrantyNumber')}
                        onBlur={handleBlur('warrantyNumber')}
                        containerStyle={styles.inputContainerNoMargin}
                        inputStyle={{ textAlign: 'left' }}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.label, { textAlign: 'left' }]}>
                        {t('real_estate.cost')}
                      </Text>
                      <CustomInput
                        placeholder="0.00"
                        value={values.cost}
                        onChangeText={handleChange('cost')}
                        onBlur={handleBlur('cost')}
                        containerStyle={styles.inputContainerNoMargin}
                        keyboardType="decimal-pad"
                        inputStyle={{ textAlign: 'left' }}
                      />
                    </View>
                  </View>

                  {/* Billing frequency of the cost (as on the website) */}
                  <BillingFrequencyField
                    value={values.billingFrequency}
                    onChange={(v) => setFieldValue('billingFrequency', v)}
                  />

                  {/* Start Date */}
                  <View style={styles.fullWidthContainer}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('warranties.start_date')}
                    </Text>
                    <CustomDateTimePicker
                      placeholder={t('warranties.select')}
                      value={values.startDate}
                      onChange={(date: any) => {
                        setFieldValue('startDate', date).then(() => {
                          setFieldTouched('expiration', true, false);
                          validateForm();
                        });
                      }}
                      mode="date"
                      displayFormat="MM/DD/YYYY"
                      inputContainerStyle={{ borderRadius: 9 }}
                      suffixIcon={
                        <Feather name="calendar" size={20} color={colors.gray} />
                      }
                      error={
                        touched.startDate && errors.startDate
                          ? String(errors.startDate)
                          : undefined
                      }
                    />
                  </View>

                  {/* Expiration */}
                  <View style={styles.fullWidthContainer}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('warranties.expiration')}
                    </Text>
                    <CustomDateTimePicker
                      placeholder={t('warranties.select')}
                      value={values.expiration}
                      onChange={(date: any) => {
                        setFieldValue('expiration', date).then(() => {
                          setFieldTouched('expiration', true, false);
                          validateForm();
                        });
                      }}
                      mode="date"
                      displayFormat="MM/DD/YYYY"
                      inputContainerStyle={{ borderRadius: 9 }}
                      suffixIcon={
                        <Feather name="calendar" size={20} color={colors.gray} />
                      }
                      error={
                        touched.expiration && errors.expiration
                          ? String(errors.expiration)
                          : undefined
                      }
                    />
                  </View>

                  {/* Notes */}
                  <View style={styles.fullWidthContainer}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('warranties.notes')}
                    </Text>
                    <TextInput
                      placeholder={t('warranties.notes')}
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

                  {/* Website (optional) */}
                  <View style={styles.fullWidthContainer}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('warranties.website')}
                    </Text>
                    <CustomInput
                      placeholder={t('warranties.website_placeholder')}
                      value={values.website}
                      onChangeText={handleChange('website')}
                      onBlur={handleBlur('website')}
                      containerStyle={styles.inputContainerNoMargin}
                      keyboardType="url"
                      error={
                        touched.website && errors.website
                          ? String(errors.website)
                          : undefined
                      }
                    />
                  </View>

                  {/* Link to Real Estate, Vehicle or Property — mutually exclusive.
                      In mode B/D all three always show, either as a dropdown of
                      THEIR assets or a locked field when not shared at all. */}
                  {(() => {
                    const showRealEstate = isOwnerScoped || (assignment.slotStates.realestate?.options.length ?? 0) > 0;
                    const showVehicle = isOwnerScoped || (assignment.slotStates.vehicle?.options.length ?? 0) > 0;
                    const showProperty = isOwnerScoped || (assignment.slotStates.property?.options.length ?? 0) > 0;
                    if (!showRealEstate && !showVehicle && !showProperty) return null;

                    return (
                      <>
                        <View style={styles.linkInfoRow}>
                          <Feather name="info" size={14} color={themeColors?.isDark ? themeColors.primary : themeColors.secondary} />
                          <Text style={[styles.linkInfoText, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}>
                            {t('warranties.link_subtitle') || 'Tie this warranty to a real estate property, a vehicle, or a personal property (select only one).'}
                          </Text>
                        </View>

                        {showRealEstate && assignment.slotStates.realestate && (
                          <View style={styles.fullWidthContainer}>
                            <Text style={[styles.label, { textAlign: 'left' }]}>
                              {t('warranties.link_real_estate') || 'Real Estate Property'}
                            </Text>
                            <AssignmentDropdownField
                              slot={assignment.slotStates.realestate}
                              value={values.realEstateId}
                              loading={assignment.isLoading}
                              emptyOptionLabel="-None-"
                              onSelect={(v) => {
                                setFieldValue('realEstateId', v || '');
                                if (v) {
                                  setFieldValue('vehicleId', '');
                                  setFieldValue('personalPropertyId', '');
                                }
                              }}
                              placeholder={t('warranties.link_real_estate_placeholder') || 'Select a property...'}
                            />
                          </View>
                        )}

                        {showVehicle && assignment.slotStates.vehicle && (
                          <View style={styles.fullWidthContainer}>
                            <Text style={[styles.label, { textAlign: 'left' }]}>
                              {t('warranties.link_vehicle') || 'Vehicle'}
                            </Text>
                            <AssignmentDropdownField
                              slot={assignment.slotStates.vehicle}
                              value={values.vehicleId}
                              loading={assignment.isLoading}
                              emptyOptionLabel="-None-"
                              onSelect={(v) => {
                                setFieldValue('vehicleId', v || '');
                                if (v) {
                                  setFieldValue('realEstateId', '');
                                  setFieldValue('personalPropertyId', '');
                                }
                              }}
                              placeholder={t('warranties.link_vehicle_placeholder') || 'Select a vehicle...'}
                            />
                          </View>
                        )}

                        {showProperty && assignment.slotStates.property && (
                          <View style={styles.fullWidthContainer}>
                            <Text style={[styles.label, { textAlign: 'left' }]}>
                              {propertyDropdownLabel}
                            </Text>
                            <AssignmentDropdownField
                              slot={assignment.slotStates.property}
                              value={values.personalPropertyId}
                              loading={assignment.isLoading}
                              emptyOptionLabel="-None-"
                              onSelect={(v) => {
                                setFieldValue('personalPropertyId', v || '');
                                if (v) {
                                  setFieldValue('realEstateId', '');
                                  setFieldValue('vehicleId', '');
                                }
                              }}
                              placeholder={propertyDropdownPlaceholder}
                            />
                          </View>
                        )}

                        {assignment.sectionMessage && (
                          <Text style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>
                            {assignment.sectionMessage}
                          </Text>
                        )}
                      </>
                    );
                  })()}

                  <RecordNotesEncryptRow notes={recordNotes} />
                  <RecordLinksField links={links} />
                  {/* Upload Attachments */}
                  <View style={styles.uploadSection}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('warranties.upload_attachments')}
                    </Text>
                    <MixedMediaUploader
                      mediaIds={attachmentIds}
                      onMediaChange={(ids: any) => setAttachmentIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                      uploadType="box"
                      maxItems={5}
                      removable={true}
                      autoUpload={true}
                    />
                  </View>

                  {/* Submit Button */}
                  <PrimaryButton
                    title={isEdit ? t('common.save_changes') : t('warranties.add_warranty')}
                    onPress={() => formikSubmit()}
                    loading={isLoading}
                    disabled={isLoading}
                    buttonStyle={[
                      styles.addWarrantyButton,
                      { backgroundColor: themeColors.primary },
                    ]}
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

export default AddWarranty;
