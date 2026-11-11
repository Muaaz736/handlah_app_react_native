import { ScrollView, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../components/notes/RecordNotesField';
import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthHeader,
  CustomInput,
  CustomDateTimePicker,
  PrimaryButton,
  ImageUploader,
  AssignmentDropdownField,
  MixedMediaUploader,
  VendorAutocompleteInput,
} from '../../../../../components/common';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import BillingFrequencyField from '../../../../../components/common/BillingFrequencyField';
import { insuranceFrequency } from '../../../../../utils/billingFrequency';
import Feather from 'react-native-vector-icons/Feather';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { useAssignmentFields } from '../../../../../hooks/useAssignmentFields';
import { isIOS } from '../../../../../utils/helpers';
import {
  AddInsurancePolicyScreenProps,
  InsurancePolicy,
} from './Insurance.types';
import { InsurancePayload } from '../Vehicles/AddVehicleInsurance/AddVehicleInsurance.types';
import { useDispatch, useSelector } from 'react-redux';
import {
  addInsuranceAsync,
  updateInsuranceAsync,
} from '../../../../../redux/services/liabilitiesService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { useFormik } from 'formik';
import validationSchema from '../../../../../utils/validationSchemas';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles } from './Insurance.styles';
import { makeAddInsurancePolicyStyles } from './AddInsurancePolicy.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../constants/recordLinkModules';

const AddInsurancePolicy: React.FC<AddInsurancePolicyScreenProps> = ({
  route,
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeAddInsurancePolicyStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();

  const isBusiness = isBusinessRole();

  const insurance = route?.params?.insurance as InsurancePolicy | undefined;
  const isEdit = route?.params?.isEdit ?? false;
  const ownerUserId = (route?.params as any)?.ownerUserId;
  const ownerBusinessId = (route?.params as any)?.ownerBusinessId;
  const ownerName = (route?.params as any)?.ownerName;
  const isFromEmergencyAccess = (route?.params as any)?.isFromEmergencyAccess;
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.Insurance,
      recordId: isEdit && insurance?.id ? Number(insurance.id) : null,
      businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
      enabled: !ownerUserId && !isFromEmergencyAccess,
  });
  // Notes' "Encrypt notes" choice; saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Insurance, recordId: isEdit && insurance?.id ? Number(insurance.id) : null, enabled: links.enabled });
  const isOwnerScoped = !!ownerUserId;

  const [manualTouched, setManualTouched] = useState<Record<string, boolean>>({});
  const [attachmentIds, setAttachmentIds] = useState<string[]>(() => {
    const existing = insurance?.uploadattachments;
    return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
  });

  const touchField = (field: string) => {
    setManualTouched(prev => ({ ...prev, [field]: true }));
  };


  const { add_insurance_status, update_insurance_status } = useSelector(
    (state: any) => state.liabilities_slice,
  );
  const propertyDropdownLabel = isBusiness
    ? (t('insurance.link_business_property') || 'Business Property')
    : (t('insurance.link_personal_property') || 'Personal Property');

  const propertyDropdownPlaceholder = isBusiness
    ? (t('insurance.link_business_property_placeholder') || 'Select a business property...')
    : (t('insurance.link_personal_property_placeholder') || 'Select a personal property...');

  const linkedVehicleId = insurance?.vehicleid ?? (insurance as any)?.vehicleId;
  const linkedPropertyId =
    (insurance as any)?.personalpropertyid ??
    (insurance as any)?.personalPropertyId ??
    (insurance as any)?.propertyid ??
    (insurance as any)?.propertyId ??
    (insurance as any)?.property?.id;
  const linkedRealEstateId = insurance?.realestateid ?? (insurance as any)?.realEstateId;

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
      vehicle: (insurance as any)?.vehicle,
      property: (insurance as any)?.property,
      realestate: (insurance as any)?.realestate ?? (insurance as any)?.realEstate,
    },
  });

  const isLoading =
    add_insurance_status === ASYNC_STATUS.LOADING ||
    update_insurance_status === ASYNC_STATUS.LOADING;

  const formatDate = (date: string): string | undefined => {
    if (!date) return undefined;
    try {
      const d = new Date(date);
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    } catch {
      return undefined;
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      itemName: insurance?.itemname || insurance?.itemName || '',
      agentEmail: insurance?.agentemail || insurance?.agentEmail || '',
      insuranceCarrier:
        insurance?.insurancecarrier || insurance?.insuranceCarrier || '',
      policyNumber: insurance?.policynumber || insurance?.policyNumber || '',
      annualPremium:
        insurance?.annualpremium?.toString() ||
        insurance?.annualPremium?.toString() ||
        '',
      startDate: insurance?.startdate || insurance?.startDate || '',
      renewalDate: insurance?.renewaldate || insurance?.renewalDate || '',
      endDate: insurance?.enddate || insurance?.endDate || '',
      dueDay:
        insurance?.dueday?.toString() || insurance?.dueDay?.toString() || '',
      agent: insurance?.agent || '',
      agentPhone: insurance?.agentphone || insurance?.agentPhone || '',
      uploadAttachments: insurance?.uploadattachments || [],
      realEstateId: linkedRealEstateId ? String(linkedRealEstateId) : '',
      vehicleId: linkedVehicleId ? String(linkedVehicleId) : '',
      personalPropertyId: linkedPropertyId ? String(linkedPropertyId) : '',
      isPaidAnnually: insurance?.isPaidAnnually || insurance?.ispaidannually || false,
      billingFrequency: insuranceFrequency(insurance),
    },
    validationSchema: validationSchema('add_insurance'),
    onSubmit: async values => {
      const insuranceData: InsurancePayload = {
        itemName: values.itemName,
        insuranceCarrier: values.insuranceCarrier,
        policyNumber: values.policyNumber,
        annualPremium: parseFloat(values.annualPremium),
        agentEmail: values.agentEmail,
        startDate: formatDate(values.startDate),
        renewalDate: formatDate(values.renewalDate),
        agent: values.agent,
        agentPhone: values.agentPhone,
        uploadAttachments: attachmentIds.length > 0 ? attachmentIds : [],
        isPaidAnnually: values.isPaidAnnually || false,
        billingFrequency: values.billingFrequency || undefined,
        ...(values.realEstateId ? { realEstateId: parseInt(values.realEstateId) } : {}),
        ...(values.vehicleId ? { vehicleId: parseInt(values.vehicleId) } : {}),
        ...(values.personalPropertyId ? { propertyId: parseInt(values.personalPropertyId) } : {}),
        ...(isBusiness &&
          selectedBusinessId && { businessId: selectedBusinessId }),
      };

      // Only include dueDay if not paid annually and a value was entered
      if (!values.isPaidAnnually && values.dueDay) {
        insuranceData.dueDay = parseInt(values.dueDay);
      }

      // Only include endDate if the user actually set one
      const formattedEndDate = formatDate(values.endDate);
      if (formattedEndDate) {
        insuranceData.endDate = formattedEndDate;
      }
      try {
        if (isEdit && insurance?.id) {
          await dispatch(
            updateInsuranceAsync({
              id: insurance.id,
              data: {
                ...insuranceData,
                realEstateId: values.realEstateId ? parseInt(values.realEstateId) : null,
                vehicleId: values.vehicleId ? parseInt(values.vehicleId) : null,
                propertyId: values.personalPropertyId ? parseInt(values.personalPropertyId) : null,
                personalPropertyId: values.personalPropertyId ? parseInt(values.personalPropertyId) : null,
              },
            }),
          ).unwrap();
          await links.saveOrWarn(Number(insurance.id));
        } else {
          const created = await dispatch(addInsuranceAsync({ ...insuranceData, ...(ownerUserId ? { ownerUserId } : {}) } as InsurancePayload)).unwrap();
          saveLinksAfter(links, { meta: { requestStatus: 'fulfilled' }, payload: created }, undefined, undefined, recordNotes);
        }
        navigation.goBack();
      } catch (error) {
        console.error('Failed to save insurance:', error);
      }
    },
  });

  const handleSubmitPress = async () => {
    const errors = await formik.validateForm();

    // Touch all fields so errors are displayed
    const allTouched = Object.keys(formik.values).reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    formik.setTouched(allTouched);
    setManualTouched(allTouched);

    if (Object.keys(errors).length === 0) {
      formik.handleSubmit();
    }
  };

  const showError = (field: string): boolean => {
    const touched =
      !!(formik.touched as Record<string, boolean>)[field] ||
      !!manualTouched[field];
    return touched && !!(formik.errors as Record<string, string>)[field];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader
        onBackPress={() => navigation.goBack()}
        containerStyle={{
          paddingHorizontal: 16,
          marginBottom: 0,
          paddingTop: isIOS ? 0 : 20,
        }}
        backButtonStyle={{ marginBottom: 0 }}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
        titleStyle={{ marginTop: -60 }}
      />
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={commonStyles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            {isEdit
              ? t('insurance.edit_insurance')
              : t('insurance.add_insurance')}
          </Text>

          {/* Item name */}
          <CustomInput
            label={`${t('insurance.item_name')} *`}
            value={formik.values.itemName}
            onChangeText={text => formik.setFieldValue('itemName', text)}
            onBlur={() => formik.setFieldTouched('itemName', true)}
            placeholder={t('insurance.item_name_placeholder')}
            // inputStyle={{ backgroundColor: colors.white }}
          />
          {/* FIX: Check touched before showing error */}
          {showError('itemName') ? (
            <Text style={styles.errorText}>{formik.errors.itemName}</Text>
          ) : null}

          {/* Insurance carrier */}
         <VendorAutocompleteInput
            category="insurance_carrier"
            label={`${t('insurance.insurance_carrier')} *`}
            value={formik.values.insuranceCarrier}
            onChangeText={text => formik.setFieldValue('insuranceCarrier', text)}
            onBlur={() => formik.setFieldTouched('insuranceCarrier', true)}
            placeholder={t('insurance.carrier_placeholder')}
            // inputStyle={{ backgroundColor: colors.white }}
          />
          {/* FIX: Check touched before showing error */}
          {showError('insuranceCarrier') ? (
            <Text style={styles.errorText}>{formik.errors.insuranceCarrier}</Text>
          ) : null}

          {/* Policy # */}
          <CustomInput
            label={`${t('insurance.policy_number')} *`}
            value={formik.values.policyNumber}
            onChangeText={text => formik.setFieldValue('policyNumber', text)}
            onBlur={() => formik.setFieldTouched('policyNumber', true)}
            placeholder={t('insurance.policy_number')}
            // inputStyle={{ backgroundColor: colors.white }}
          />
          {/* FIX: Check touched before showing error */}
          {showError('policyNumber') ? (
            <Text style={styles.errorText}>{formik.errors.policyNumber}</Text>
          ) : null}

          {/* Annual premium */}
          <CustomInput
            label={`${t('insurance.annual_premium')} *`}
            value={formik.values.annualPremium}
            onChangeText={text => formik.setFieldValue('annualPremium', text)}
            onBlur={() => formik.setFieldTouched('annualPremium', true)}
            placeholder="0.00"
            keyboardType="decimal-pad"
            // inputStyle={{ backgroundColor: colors.white }}
          />
          {/* FIX: Check touched before showing error */}
          {showError('annualPremium') ? (
            <Text style={styles.errorText}>{formik.errors.annualPremium}</Text>
          ) : null}

          {/* Start Date and Renewal Date */}
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <CustomDateTimePicker
                label={`${t('insurance.start_date')} *`}
                value={formik.values.startDate}
                onChange={date => {
                  const newStartDate = date instanceof Date ? date.toISOString() : date;
                  formik.setFieldValue('startDate', newStartDate);
                  touchField('startDate');
                  // Clear endDate if it is now on or before the new startDate
                  if (formik.values.endDate) {
                    const sel = new Date(new Date(newStartDate as any).setHours(0, 0, 0, 0));
                    const end = new Date(new Date(formik.values.endDate as any).setHours(0, 0, 0, 0));
                    if (sel >= end) {
                      formik.setFieldValue('endDate', '');
                      touchField('endDate');
                    }
                  }
                }}
                placeholder={t('insurance.select')}
                displayFormat="MM/DD/YYYY"
                // inputContainerStyle={{ backgroundColor: colors.white }}
                labelStyle={styles.pickerLabel}
                suffixIcon={
                  <Feather name="calendar" size={18} color={colors.gray} />
                }
              />
              {showError('startDate') ? (
                <Text style={styles.errorTextWithoutMargin}>
                  {formik.errors.startDate}
                </Text>
              ) : null}
            </View>
            <View style={styles.halfWidth}>
              <CustomDateTimePicker
                label={`${t('insurance.renewal_date')} *`}
                value={formik.values.renewalDate}
                onChange={date => {
                  formik.setFieldValue(
                    'renewalDate',
                    date instanceof Date ? date.toISOString() : date,
                  );
                  touchField('renewalDate');
                }}
                placeholder={t('insurance.select')}
                displayFormat="MM/DD/YYYY"
                // inputContainerStyle={{ backgroundColor: colors.white }}
                labelStyle={styles.pickerLabel}
                suffixIcon={
                  <Feather name="calendar" size={18} color={colors.gray} />
                }
              />
              {/* FIX: Check touched before showing error */}
              {showError('renewalDate') ? (
                <Text style={styles.errorTextWithoutMargin}>
                  {formik.errors.renewalDate}
                </Text>
              ) : null}
            </View>
          </View>

          {/* End Date and Due Day */}
          <View style={[styles.rowContainer, { marginTop: 20 }]}>
            <View style={styles.halfWidth}>
              <CustomDateTimePicker
                label={t('insurance.end_date')}
                value={formik.values.endDate}
                onChange={date => {
                  formik.setFieldValue(
                    'endDate',
                    date instanceof Date ? date.toISOString() : date,
                  );
                  touchField('endDate');
                }}
                placeholder={t('insurance.select')}
                displayFormat="MM/DD/YYYY"
                minimumDate={formik.values.startDate ? new Date(new Date(formik.values.startDate as any).getTime() + 86400000) : undefined}
                // inputContainerStyle={{ backgroundColor: colors.white }}
                labelStyle={styles.pickerLabel}
                suffixIcon={
                  <Feather name="calendar" size={18} color={colors.gray} />
                }
              />
              {!!formik.values.endDate && (
                <Text
                  style={styles.clearDateText}
                  onPress={() => {
                    formik.setFieldValue('endDate', '');
                    touchField('endDate');
                  }}
                >
                  {t('common.clear') || 'Clear'}
                </Text>
              )}
              {showError('endDate') ? (
                <Text style={styles.errorTextWithoutMargin}>
                  {formik.errors.endDate}
                </Text>
              ) : null}
            </View>
            {!formik.values.isPaidAnnually ? (
              <View style={styles.halfWidth}>
                <CustomInput
                  label={`${t('insurance.due_day')}`}
                  value={formik.values.dueDay}
                  onChangeText={text => formik.setFieldValue('dueDay', text)}
                  onBlur={() => formik.setFieldTouched('dueDay', true)}
                  placeholder={t('insurance.due_day_placeholder')}
                  keyboardType="number-pad"
                  // inputStyle={{ backgroundColor: colors.white }}
                  labelStyle={styles.pickerLabel}
                />
                {/* FIX: Check touched before showing error */}
                {showError('dueDay') ? (
                  <Text style={styles.errorText}>{formik.errors.dueDay}</Text>
                ) : null}
              </View>
            ) : <View style={styles.halfWidth}></View>}
          </View>
          {/* Billing frequency (as on the website); "Annually" also sets the older Paid Annually flag. */}
          <BillingFrequencyField
            value={formik.values.billingFrequency}
            onChange={(v) => {
              formik.setFieldValue('billingFrequency', v);
              formik.setFieldValue('isPaidAnnually', v === 'annually');
              if (v === 'annually') formik.setFieldValue('dueDay', '');
            }}
          />

          {/* Agent and Agent phone */}
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <CustomInput
                label={t('insurance.agent')}
                value={formik.values.agent}
                onChangeText={text => formik.setFieldValue('agent', text)}
                onBlur={() => formik.setFieldTouched('agent', true)}
                placeholder={t('insurance.agent')}
                // inputStyle={{ backgroundColor: colors.white }}
              />
            </View>
            <View style={styles.halfWidth}>
              <CustomInput
                label={t('insurance.agent_phone')}
                value={formik.values.agentPhone}
                onChangeText={text => formik.setFieldValue('agentPhone', text)}
                onBlur={() => formik.setFieldTouched('agentPhone', true)}
                placeholder={t('insurance.agent_phone_placeholder')}
                keyboardType="phone-pad"
                // inputStyle={{ backgroundColor: colors.white }}
              />
            </View>
          </View>

          
          {/* Agent Email */}
          <CustomInput
            label={`${t('insurance.agent_email')} *`}
            value={formik.values.agentEmail}
            onChangeText={text => formik.setFieldValue('agentEmail', text)}
            onBlur={() => formik.setFieldTouched('agentEmail', true)}
            placeholder={t('insurance.agent_email')}
            keyboardType="email-address"
            // inputStyle={{ backgroundColor: colors.white }}
          />
          {/* FIX: Check touched before showing error */}
          {showError('agentEmail') ? (
            <Text style={styles.errorText}>{formik.errors.agentEmail}</Text>
          ) : null}

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
                  <Feather name="info" size={14} color={themeColors.secondary} />
                  <Text style={[styles.linkInfoText, { color: themeColors.secondary }]}>
                    {t('insurance.link_subtitle') || 'Tie this insurance to a real estate property or a vehicle (select only one).'}
                  </Text>
                </View>

                {showRealEstate && assignment.slotStates.realestate && (
                  <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>{t('insurance.link_real_estate') || 'Real Estate Property'}</Text>
                    <AssignmentDropdownField
                      slot={assignment.slotStates.realestate}
                      value={formik.values.realEstateId}
                      loading={assignment.isLoading}
                      emptyOptionLabel="-None-"
                      onSelect={(v) => {
                        formik.setFieldValue('realEstateId', v || '');
                        if (v) {
                          formik.setFieldValue('vehicleId', '');
                          formik.setFieldValue('personalPropertyId', '');
                        }
                      }}
                      placeholder={t('insurance.link_real_estate_placeholder') || 'Select a property...'}
                    />
                  </View>
                )}

                {showVehicle && assignment.slotStates.vehicle && (
                  <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>{t('insurance.link_vehicle') || 'Vehicle'}</Text>
                    <AssignmentDropdownField
                      slot={assignment.slotStates.vehicle}
                      value={formik.values.vehicleId}
                      loading={assignment.isLoading}
                      emptyOptionLabel="-None-"
                      onSelect={(v) => {
                        formik.setFieldValue('vehicleId', v || '');
                        if (v) {
                          formik.setFieldValue('realEstateId', '');
                          formik.setFieldValue('personalPropertyId', '');
                        }
                      }}
                      placeholder={t('insurance.link_vehicle_placeholder') || 'Select a vehicle...'}
                    />
                  </View>
                )}

                {showProperty && assignment.slotStates.property && (
                  <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>{propertyDropdownLabel}</Text>
                    <AssignmentDropdownField
                      slot={assignment.slotStates.property}
                      value={formik.values.personalPropertyId}
                      loading={assignment.isLoading}
                      emptyOptionLabel="-None-"
                      onSelect={(v) => {
                        formik.setFieldValue('personalPropertyId', v || '');
                        if (v) {
                          formik.setFieldValue('realEstateId', '');
                          formik.setFieldValue('vehicleId', '');
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

          <RecordNotesField notes={recordNotes} />
          <RecordLinksField links={links} />
          {/* Upload Attachments */}
          <Text style={styles.label}>{`${t(
            'insurance.upload_attachments',
          )} *`}</Text>
          <MixedMediaUploader
            mediaIds={attachmentIds}
            onMediaChange={(ids: any) => {
              setAttachmentIds(Array.isArray(ids) ? ids : ids ? [ids] : []);
              touchField('uploadAttachments');
            }}
            uploadType="box"
            maxItems={5}
            removable={true}
            autoUpload={true}
          />
          {showError('uploadAttachments') ? (
            <Text style={styles.errorText}>
              {formik.errors.uploadAttachments}
            </Text>
          ) : null}

          {/* FIX: Use handleSubmitPress instead of formik.handleSubmit */}
          <PrimaryButton
            title={
              isEdit ? t('common.save_changes') : t('insurance.add_insurance')
            }
            onPress={handleSubmitPress}
            loading={isLoading}
            disabled={isLoading}
            buttonStyle={{ marginTop: 24, marginBottom: 20 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddInsurancePolicy;
