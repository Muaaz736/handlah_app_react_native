import {
  ScrollView,
  Text,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../../components/notes/RecordNotesField';
import React, { useCallback, useRef, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthHeader,
  CustomInput,
  CustomDateTimePicker,
  CustomDropDown,
  AssignmentDropdownField,
  PrimaryButton,
  ImageUploader,
  MixedMediaUploader,
  VendorAutocompleteInput
} from '../../../../../../components/common';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { useAssignmentFields } from '../../../../../../hooks/useAssignmentFields';
import { isIOS, isOtherSelected } from '../../../../../../utils/helpers';
import {
  RouteParams,
  AddUtilityNavigationProp
} from './AddUtility.types';
import { useDispatch, useSelector } from 'react-redux';
import {
  addUtilityAsync,
  updateUtilityAsync
} from '../../../../../../redux/services/liabilitiesService';
import { getDropdownOptionsAsync } from '../../../../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { useFormik } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeAddUtilityStyles } from './AddUtility.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { billingFrequencyOptions } from '../../../../../../utils/billingFrequency';
import { groupedExpenseTypeOptions } from '../../../../../../utils/expenseTypes';
import { useRecordLinkSelection } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';
import { createdRecordId, parseRecordLinkKey } from '../../../../../../services/recordLinks';


const AddUtility = (): React.ReactElement => {
  const navigation = useNavigation<AddUtilityNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeAddUtilityStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();
  const route = useRoute();
  // Get route params for edit mode — must be declared before useState calls that depend on them
  const { utility, isEdit } = (route?.params as RouteParams) || {};
  const ownerUserId = (route?.params as any)?.ownerUserId;
  const ownerBusinessId = (route?.params as any)?.ownerBusinessId;
  const ownerName = (route?.params as any)?.ownerName;
  const isFromEmergencyAccess = (route?.params as any)?.isFromEmergencyAccess;
  const isOwnerScoped = !!ownerUserId;

  const [notes, setNotes] = useState<string>((utility as any)?.notes || '');
  const [attachmentIds, setAttachmentIds] = useState<string[]>(() => {
    const existing = utility?.uploadAttachments || (utility as any)?.uploadattachments;
    return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
  });
  const [utilityTypeOther, setUtilityTypeOther] = useState<string>(
    utility?.utilitytypeother || '',
  );

  // Check if user is in business mode
  const isBusiness = isBusinessRole();

  // Redux state
  const { add_utility_status, update_utility_status } = useSelector(
    (state: any) => state.liabilities_slice,
  );
  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);
  const isLoading =
    add_utility_status === ASYNC_STATUS.LOADING ||
    update_utility_status === ASYNC_STATUS.LOADING;

  const linkedRealEstateId = (utility as any)?.realestateid ?? (utility as any)?.realEstateId;

  // "Select Records to Link" (as on the web). It also assigns the real estate: picking a property here sets the
  // expense's real estate, so the separate "Link to Real Estate" field only shows where links can't be used
  // (adding for someone who shared with you, emergency access).
  const links = useRecordLinkSelection({
    moduleKey: RECORD_LINK_MODULE.Expense,
    recordId: isEdit && utility?.id ? Number(utility.id) : null,
    businessId: isBusiness ? selectedBusinessId ?? null : null,
    enabled: !isOwnerScoped && !isFromEmergencyAccess,
    preselectKey: (route?.params as any)?.linkTo ?? null,
  });
  // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Expense, recordId: isEdit && utility?.id ? Number(utility.id) : null, enabled: links.enabled, choiceOnly: true });
  const linkedRealEstateFromLinks = (): number | null => {
    const keys = links.selected.filter(k => k.startsWith(`${RECORD_LINK_MODULE.RealEstate}:`));
    const current = linkedRealEstateId ? `${RECORD_LINK_MODULE.RealEstate}:${linkedRealEstateId}` : null;
    const pick = current && keys.includes(current) ? current : keys[0];
    return pick ? parseRecordLinkKey(pick)?.id ?? null : null;
  };

  const assignment = useAssignmentFields({
    slots: ['realestate'],
    isOwnerScoped,
    isEmergency: !!isFromEmergencyAccess,
    ownerUserId,
    ownerName,
    ownerBusinessId,
    isBusiness,
    myBusinessId: selectedBusinessId,
    linkedIds: { realestate: linkedRealEstateId },
    linkedAssets: { realestate: (utility as any)?.realestate ?? (utility as any)?.realEstate },
  });

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('UtilityType'));
  }, [dispatch]));

  const scrollViewRef = useRef<ScrollView>(null);
  const formContainerRef = useRef<View>(null);
  const vendorRowRef = useRef<View>(null);
  const endDateRef = useRef<View>(null);
  const accountNumberRef = useRef<View>(null);
  const dueDayRowRef = useRef<View>(null);
  const websiteRef = useRef<View>(null);

  const scrollToRef = (ref: React.RefObject<View | null>) => {
    if (ref.current && formContainerRef.current) {
      ref.current.measureLayout(
        formContainerRef.current as any,
        (_x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 16, animated: true });
        },
        () => { },
      );
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: (utility as any)?.name || '',
      utilityType: utility?.utilityType || (utility as any)?.utilitytype || '',
      utilityTypeOther: (utility as any)?.utilityTypeOther || (utility as any)?.utilitytypeother || '',
      vendor: utility?.vendor || '',
      averageMonthlyAmount:
        utility?.averageMonthlyAmount?.toString() ||
        (utility as any)?.averagemonthlyamount?.toString() ||
        '',
      startDate: (utility as any)?.startdate || (utility as any)?.startDate || null,
      endDate: utility?.endDate || (utility as any)?.enddate || null,
      accountNumber:
        utility?.accountNumber || (utility as any)?.accountnumber || '',
      dueDay:
        utility?.dueDay?.toString() ||
        (utility as any)?.dueday?.toString() ||
        '',
      phone: utility?.phone || (utility as any)?.phonenumber || '',
      website: utility?.website || '',
      uploadAttachments: '',
      realEstateId: linkedRealEstateId ? String(linkedRealEstateId) : '',
      billingFrequency: (utility?.billingFrequency || (utility as any)?.billingfrequency || '').toLowerCase()
    },
    validationSchema: validationSchema('add_utility'),
    onSubmit: async values => {
      const formattedStartDate = values.startDate
        ? values.startDate instanceof Date
          ? values.startDate.toISOString()
          : new Date(values.startDate).toISOString()
        : undefined;

      const formattedEndDate = values.endDate
        ? values.endDate instanceof Date
          ? values.endDate.toISOString()
          : new Date(values.endDate).toISOString()
        : undefined;

      const utilityData = {
        // The expense's own name; sent even when blank so clearing it on edit sticks.
        name: (values.name || '').trim(),
        utilityType: values.utilityType,
        ...(isOtherSelected(get_dropdown_options_data?.find((item: any) => item.value === values.utilityType)?.label) && utilityTypeOther
          ? { utilityTypeOther }
          : {}),
        // utilityTypeOther cleared when not Other
        vendor: values.vendor,
        averageMonthlyAmount: parseFloat(values.averageMonthlyAmount) || 0,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        accountNumber: values.accountNumber,
        dueDay: parseInt(values.dueDay) || 0,
        phoneNumber: values.phone,
        website: values.website,
        notes: notes,
        uploadAttachments: attachmentIds.length > 0 ? attachmentIds : [],
        ...(isBusiness &&
          selectedBusinessId && { businessId: selectedBusinessId }),
        ...(links.enabled
          ? (linkedRealEstateFromLinks() ? { realEstateId: linkedRealEstateFromLinks() } : {})
          : values.realEstateId ? { realEstateId: parseInt(values.realEstateId) } : {}),
        ...(values.billingFrequency ? { billingFrequency: values.billingFrequency } : {})
      };

      try {
        if (isEdit && utility?.id) {
          await dispatch(
            updateUtilityAsync({
              id: utility.id,
              data: {
                ...utilityData,
                realEstateId: links.enabled
                  ? linkedRealEstateFromLinks()
                  : values.realEstateId ? parseInt(values.realEstateId) : null,
              },
            }),
          ).unwrap();
          await links.saveOrWarn(Number(utility.id));
          await recordNotes.saveOrWarn(Number(utility.id));
        } else {
          const created = await dispatch(addUtilityAsync({ ...utilityData, ...(ownerUserId ? { ownerUserId } : {}) })).unwrap();
          if (links.enabled && !(created as any)?._offlineQueued) await links.saveOrWarn(createdRecordId(created));
          if (links.enabled && !(created as any)?._offlineQueued) await recordNotes.saveOrWarn(createdRecordId(created));
        }
        navigation.goBack();
      } catch (error) {
        console.error('Failed to save utility:', error);
      }
    }
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader
          title={
            isEdit ? t('utilities.edit_utility') : t('utilities.add_utility')
          }
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View ref={formContainerRef} style={styles.formContainer}>
              {/* Expense name */}
              <View style={styles.fullWidthContainer}>
                <Text style={[styles.label, { textAlign: 'left' }]}>
                  {t('utilities.expense_name', { defaultValue: 'Expense name' })}
                </Text>
                <CustomInput
                  value={formik.values.name}
                  onChangeText={text => formik.setFieldValue('name', text)}
                  placeholder={t('utilities.expense_name_placeholder', { defaultValue: 'e.g. Lake house electric' })}
                  inputStyle={{ textAlign: 'left' }}
                  maxLength={200}
                />
              </View>

              {/* Utility Type Dropdown */}
              <View style={styles.fullWidthContainer}>
                <Text style={[styles.label, { textAlign: 'left' }]}>
                  {t('utilities.utility_type')} *
                </Text>
                <CustomDropDown
                  options={groupedExpenseTypeOptions(get_dropdown_options_data)}
                  value={formik.values.utilityType}
                  onSelect={value => {
                    formik.setFieldValue('utilityType', (value as string) || '');
                    formik.setFieldTouched('utilityType', true, false);
                    if (!isOtherSelected(get_dropdown_options_data?.find((item: any) => item.value === value)?.label)) {
                      setUtilityTypeOther('');
                    }
                  }}
                  placeholder={t('utilities.select')}
                  search={true}
                  leftIcon
                />
                {isOtherSelected(get_dropdown_options_data?.find((item: any) => item.value === formik.values.utilityType)?.label) && (
                  <View style={{ marginTop: 12 }}>
                    <CustomInput
                      value={utilityTypeOther}
                      onChangeText={text => setUtilityTypeOther(text)}
                      placeholder={t('common.other_type_placeholder') || 'Please specify...'}
                      inputStyle={{ textAlign: 'left' }}
                    />
                  </View>
                )}
                {formik.touched.utilityType && formik.errors.utilityType ? (
                  <Text style={styles.errorText}>
                    {String(formik.errors.utilityType)}
                  </Text>
                ) : null}
              </View>

              {/* Vendor and Average Monthly Amount Row */}
              <View ref={vendorRowRef} style={styles.rowContainer}>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, styles.rowLabel, { textAlign: 'left' }]}>
                    {t('utilities.vendor')} *
                  </Text>
                  <VendorAutocompleteInput
                    category="utility_vendor"
                    placeholder={t('utilities.vendor_placeholder')}
                    value={formik.values.vendor}
                    onChangeText={text => formik.setFieldValue('vendor', text)}
                    onBlur={() => formik.setFieldTouched('vendor', true)}
                    onFocus={() => scrollToRef(vendorRowRef)}
                    containerStyle={styles.inputContainerNoMargin}
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                  />
                  {formik.touched.vendor && formik.errors.vendor ? (
                    <Text style={styles.errorText}>{formik.errors.vendor}</Text>
                  ) : null}
                </View>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, styles.rowLabel, { textAlign: 'left' }]}>
                    {t('utilities.average_monthly_amount')} *
                  </Text>
                  <CustomInput
                    placeholder="0.00"
                    value={formik.values.averageMonthlyAmount}
                    onChangeText={text =>
                      formik.setFieldValue('averageMonthlyAmount', text)
                    }
                    onBlur={() =>
                      formik.setFieldTouched('averageMonthlyAmount', true)
                    }
                    onFocus={() => scrollToRef(vendorRowRef)}
                    containerStyle={styles.inputContainerNoMargin}
                    keyboardType="decimal-pad"
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                  />
                  {formik.touched.averageMonthlyAmount &&
                    formik.errors.averageMonthlyAmount ? (
                    <Text style={styles.errorText}>
                      {String(formik.errors.averageMonthlyAmount)}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Start Date */}
              <View style={styles.fullWidthContainer}>
                <Text style={[styles.label, { textAlign: 'left' }]}>
                  {t('utilities.start_date')}
                </Text>
                <CustomDateTimePicker
                  placeholder={t('utilities.select')}
                  value={formik.values.startDate}
                  onChange={date => {
                    formik.setFieldValue('startDate', date);
                    formik.setFieldTouched('startDate', true, false);
                    // If existing endDate is now before or equal to new startDate, clear endDate
                    if (formik.values.endDate) {
                      const sel = new Date(new Date(date as any).setHours(0, 0, 0, 0));
                      const end = new Date(new Date(formik.values.endDate as any).setHours(0, 0, 0, 0));
                      if (sel >= end) {
                        formik.setFieldValue('endDate', null);
                      }
                    }
                  }}
                  mode="date"
                  displayFormat="MM/DD/YYYY"
                  labelStyle={{ textAlign: 'left' }}
                  maximumDate={formik.values.endDate ? new Date(formik.values.endDate as any) : undefined}
                  inputContainerStyle={{ borderRadius: 9 }}
                  suffixIcon={
                    <Feather name="calendar" size={20} color={colors.gray} />
                  }
                />
              </View>

              {/* End Date */}
              <View ref={endDateRef} style={styles.fullWidthContainer}>
                <Text style={[styles.label, { textAlign: 'left' }]}>
                  {t('utilities.end_date')}
                </Text>
                <CustomDateTimePicker
                  placeholder={t('utilities.select')}
                  value={formik.values.endDate}
                  onChange={date => {
                    formik.setFieldValue('endDate', date);
                    formik.setFieldTouched('endDate', true, false);
                  }}
                  mode="date"
                  displayFormat="MM/DD/YYYY"
                  labelStyle={{ textAlign: 'left' }}
                  minimumDate={formik.values.startDate ? new Date(formik.values.startDate as any) : undefined}
                  inputContainerStyle={{ borderRadius: 9 }}
                  suffixIcon={
                    <Feather name="calendar" size={20} color={colors.gray} />
                  }
                />
                {formik.touched.endDate && formik.errors.endDate ? (
                  <Text style={styles.errorText}>
                    {formik.errors.endDate as string}
                  </Text>
                ) : null}
              </View>

              {/* Billing Frequency */}
              <View style={styles.fullWidthContainer}>
                <Text style={[styles.label, { textAlign: 'left' }]}>
                  {t('utilities.billing_frequency')}
                </Text>
                <CustomDropDown
                  options={billingFrequencyOptions()}
                  value={formik.values.billingFrequency}
                  onSelect={value =>
                    formik.setFieldValue('billingFrequency', (value as string) || '')
                  }
                  placeholder={t('utilities.billing_frequency_placeholder')}
                  search={false}
                  leftIcon
                />
              </View>

              {/* Account # */}
              <View ref={accountNumberRef} style={styles.fullWidthContainer}>
                <Text style={[styles.label, { textAlign: 'left' }]}>
                  {t('utilities.account_number_optional')}
                </Text>
                <CustomInput
                  placeholder={t('utilities.account_number_placeholder')}
                  value={formik.values.accountNumber}
                  onChangeText={text =>
                    formik.setFieldValue('accountNumber', text)
                  }
                  onBlur={() => formik.setFieldTouched('accountNumber', true)}
                  onFocus={() => scrollToRef(accountNumberRef)}
                  containerStyle={styles.inputContainerNoMargin}
                  labelStyle={{ textAlign: 'left' }}
                  inputStyle={{ textAlign: 'left' }}
                />
              </View>

              {/* Due day and Phone# Row */}
              <View ref={dueDayRowRef} style={styles.rowContainer}>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, { textAlign: 'left' }]}>
                    {t('utilities.due_day_optional')}
                  </Text>
                  <CustomInput
                    placeholder="2"
                    value={formik.values.dueDay}
                    onChangeText={text => formik.setFieldValue('dueDay', text)}
                    onBlur={() => formik.setFieldTouched('dueDay', true)}
                    onFocus={() => scrollToRef(dueDayRowRef)}
                    containerStyle={styles.inputContainerNoMargin}
                    keyboardType="number-pad"
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                  />
                  {formik.touched.dueDay && formik.errors.dueDay ? (
                    <Text style={styles.errorText}>
                      {String(formik.errors.dueDay)}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.halfInput}>
                  <Text style={[styles.label, { textAlign: 'left' }]}>
                    {t('utilities.phone_optional')}
                  </Text>
                  <CustomInput
                    placeholder="(621)-111 1111"
                    value={formik.values.phone}
                    onChangeText={text => formik.setFieldValue('phone', text)}
                    onBlur={() => formik.setFieldTouched('phone', true)}
                    onFocus={() => scrollToRef(dueDayRowRef)}
                    containerStyle={styles.inputContainerNoMargin}
                    keyboardType="phone-pad"
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                  />
                </View>
              </View>
              <View style={styles.notesSection}>
                <CustomInput
                  label={t('request_access_data.notes_optional')}
                  placeholder={t('request_access_data.notes_placeholder')}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  inputStyle={styles.notesInput}
                  inputContainerStyle={styles.notesInputContainer}
                />
              </View>

              {/* Website (optional) */}
              <View ref={websiteRef} style={styles.fullWidthContainer}>
                <Text style={[styles.label, { textAlign: 'left' }]}>
                  {t('utilities.website')}
                </Text>
                <CustomInput
                  placeholder={t('utilities.website_placeholder')}
                  value={formik.values.website}
                  onChangeText={text => formik.setFieldValue('website', text)}
                  onBlur={() => formik.setFieldTouched('website', true)}
                  onFocus={() => scrollToRef(websiteRef)}
                  containerStyle={styles.inputContainerNoMargin}
                  keyboardType="url"
                  labelStyle={{ textAlign: 'left' }}
                  inputStyle={{ textAlign: 'left' }}
                />
                {formik.touched.website && formik.errors.website ? (
                  <Text style={styles.errorText}>{formik.errors.website}</Text>
                ) : null}
              </View>

              {/* Link to Real Estate — in mode B/D always shows, either as a
                  dropdown of the owner's real estate or a locked field when
                  they didn't share Real Estate at all. */}
              <RecordNotesEncryptRow notes={recordNotes} />
              <RecordLinksField links={links} />

              {!links.enabled && (isOwnerScoped || (assignment.slotStates.realestate?.options.length ?? 0) > 0) && assignment.slotStates.realestate && (
                <>
                  <View style={styles.linkInfoRow}>
                    <Feather name="info" size={14} color={themeColors?.isDark ? themeColors.primary : themeColors.secondary} />
                    <Text style={[styles.linkInfoText, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}>{t('utilities.link_subtitle')}</Text>
                  </View>
                  <View style={styles.fullWidthContainer}>
                    <Text style={[styles.label, { textAlign: 'left' }]}>
                      {t('utilities.link_real_estate')}
                    </Text>
                    <AssignmentDropdownField
                      slot={assignment.slotStates.realestate}
                      value={formik.values.realEstateId}
                      loading={assignment.isLoading}
                      emptyOptionLabel="-None-"
                      onSelect={(v) => formik.setFieldValue('realEstateId', v || '')}
                      placeholder={t('utilities.link_real_estate_placeholder')}
                    />
                    {assignment.sectionMessage && (
                      <Text style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>
                        {assignment.sectionMessage}
                      </Text>
                    )}
                  </View>
                </>
              )}

              {/* Upload Attachments */}
              <View style={styles.fullWidthContainer}>
                <MixedMediaUploader
                  mediaIds={attachmentIds}
                  onMediaChange={(ids: any) => setAttachmentIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                  label={t('utilities.upload_attachments')}
                  uploadType="box"
                  maxItems={5}
                  removable={true}
                  autoUpload={true}
                />
              </View>

              {/* Add Utility Button */}
              <PrimaryButton
                title={
                  isLoading
                    ? t('common.loading')
                    : isEdit
                      ? t('common.save_changes')
                      : t('utilities.add_utility')
                }
                onPress={formik.handleSubmit}
                disabled={isLoading}
                buttonStyle={[
                  styles.addUtilityButton,
                  { backgroundColor: themeColors.primary },
                ]}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default AddUtility;
