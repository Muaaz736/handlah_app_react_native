import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../components/notes/RecordNotesField';
import {
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import {
  AuthHeader,
  CustomDropDown,
  CustomInput,
  CustomDateTimePicker,
  PrimaryButton,
  MixedMediaUploader,
  ImageUploader,
  VendorAutocompleteInput,
} from '../../../../../components/common';
import colors from '../../../../../utils/colors';
import { isIOS } from '../../../../../utils/helpers';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
  addPersonalPropertyAsync,
  getBusinessRealStateOverviewAsync,
  getRealStateOverviewAsync,
} from '../../../../../redux/services/assetsService';
import { setAddPersonalPropertyStatus } from '../../../../../redux/slices/assetsSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { Formik } from 'formik';
import validationSchema from '../../../../../utils/validationSchemas';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { getDropdownOptionsAsync } from '../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles } from './PersonalProperty.styles';
import { makeAddPersonalPropertyStyles } from './AddPersonalProperty.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../hooks/useRecordLinkSelection';
import { RecordExpensesEditor, useExpenseDrafts } from '../../../../../components/expenses/RecordExpensesEditor';
import { RecordLinksField } from '../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../constants/recordLinkModules';

const AddPersonalProperty = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const ownerUserId = route?.params?.ownerUserId;
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedBusinessId } = useSelectedBusiness();
  const { isBusinessRole, userRole, themeColors } = useUserRole();
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.Property,
      recordId: null,
      businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
      enabled: !ownerUserId,
  });
  // Notes' "Encrypt notes" choice; saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Property, recordId: null, enabled: links.enabled });
  // New expenses typed on this form, created and linked when it's saved (as on the web).
  const expenseDrafts = useExpenseDrafts(isBusinessRole() ? selectedBusinessId ?? null : null);
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeAddPersonalPropertyStyles(themeColors as RoleTheme), [themeColors]);
  const formikRef = useRef<any>(null);
  // Redux state selectors
  const {
    add_personal_property_status,
    get_real_state_overview_data,
    get_real_state_overview_status,
  } = useSelector((state: any) => state.assets_slice);

  const isLoading = add_personal_property_status === ASYNC_STATUS.LOADING;

  const [realEstates, setRealEstates] = React.useState<
    { value: string; label: string }[]
  >([]);
  const [attachmentIds, setAttachmentIds] = React.useState<string[]>([]);
  const [warrantyDocIds, setWarrantyDocIds] = React.useState<string[]>([]);
  const [insuranceDocIds, setInsuranceDocIds] = React.useState<string[]>([]);
  const [loanDocIds, setLoanDocIds] = React.useState<string[]>([]);

  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('PropertyCategory'));
  }, [dispatch]));

  const initialValues = {
    // Personal Property
    name: '',
    category: '',
    attachment: '',
    modelSerial: '',
    purchaseDate: null,
    price: '',
    dateSoldDiscarded: null,
    isAssigned: false,
    assignedProperty: '',
    isAddedToWallet: false,
    soldAmount: '',

    // Warranty
    warrantyItemName: '',
    warrantyProvider: '',
    warrantyNumber: '',
    warrantyCost: '',
    warrantyExpiration: null,
    warrantyStartDate: null,
    warrantyNotes: '',
    warrantyWebsite: '',
    warrantyUploadAttachments: '',
    // Insurance
    insuranceItemName: '',
    agentEmail: '',
    insuranceCarrier: '',
    policyNumber: '',
    annualPremium: '',
    insuranceStartDate: null,
    insuranceRenewalDate: null,
    insuranceEndDate: null,
    insuranceDueDay: '',
    insuranceIsPaidAnnually: false,
    insuranceAgent: '',
    insuranceAgentPhone: '',
    insuranceUploadAttachments: '',
    // Loan
    lenderProvider: '',
    lenderLocation: '',
    lenderPhoneNumber: '',
    lenderEmail: '',
    accountNumber: '',
    balance: '',
    estBalance: '',
    monthlyPayment: '',
    loanStartDate: null,
    loanEndDate: null,
    loanDueDay: '',
    ratePercentage: '',
    loanItemName: '',
    loanUploadAttachments: '',
  };

  useFocusEffect(
    useCallback(() => {
      if (isBusinessRole()) {
        dispatch(getBusinessRealStateOverviewAsync(selectedBusinessId));
      } else {
        dispatch(getRealStateOverviewAsync());
      }
    }, [dispatch, selectedBusinessId]),
  );

  useEffect(() => {
    if (get_real_state_overview_status === ASYNC_STATUS.SUCCEEDED) {
      const mappedData =
        get_real_state_overview_data?.realestates?.map((estate: any) => ({
          value: String(estate.id),
          label: estate.nickname,
        })) || [];
      setRealEstates(mappedData);
    }
  }, [get_real_state_overview_status]);

  // Helper to convert Date or string to ISO string (same pattern as other modules)
  const formatDateToISO = (date: Date | string | null): string | null => {
    if (!date) return null;
    try {
      if (date instanceof Date) {
        return date.toISOString();
      }
      if (typeof date === 'string' && date.trim() !== '') {
        return new Date(date).toISOString();
      }
      return null;
    } catch {
      return null;
    }
  };

  // Helper to safely parse a number, returning 0 instead of NaN
  const safeParseFloat = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const safeParseInt = (value: string): number => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Check if a warranty section has any user-entered data
  const hasWarrantyData = (values: any): boolean => {
    return !!(
      values.warrantyItemName?.trim() ||
      values.warrantyProvider?.trim() ||
      values.warrantyNumber?.trim() ||
      values.warrantyCost?.trim() ||
      values.warrantyExpiration ||
      values.warrantyStartDate ||
      values.warrantyNotes?.trim() ||
      values.warrantyWebsite?.trim() ||
      warrantyDocIds.length > 0
    );
  };

  // Check if an insurance section has any user-entered data
  const hasInsuranceData = (values: any): boolean => {
    return !!(
      values.insuranceItemName?.trim() ||
      values.agentEmail?.trim() ||
      values.insuranceCarrier?.trim() ||
      values.policyNumber?.trim() ||
      values.annualPremium?.trim() ||
      values.insuranceStartDate ||
      values.insuranceRenewalDate ||
      values.insuranceEndDate ||
      values.insuranceDueDay?.trim() ||
      values.insuranceAgent?.trim() ||
      values.insuranceAgentPhone?.trim() ||
      insuranceDocIds.length > 0
    );
  };

  // Check if a loan section has any user-entered data
  const hasLoanData = (values: any): boolean => {
    return !!(
      values.lenderProvider?.trim() ||
      values.lenderLocation?.trim() ||
      values.lenderPhoneNumber?.trim() ||
      values.lenderEmail?.trim() ||
      values.accountNumber?.trim() ||
      values.balance?.trim() ||
      values.estBalance?.trim() ||
      values.monthlyPayment?.trim() ||
      values.loanStartDate ||
      values.loanEndDate ||
      values.loanDueDay?.trim() ||
      values.ratePercentage?.trim() ||
      values.loanItemName?.trim() ||
      loanDocIds.length > 0
    );
  };

  const handleSubmit = (values: any): void => {
    const propertyPayload: any = {
      name: values.name,
      category: values.category,
      attachment: attachmentIds.length > 0 ? attachmentIds : [],
      modelSerial: values.modelSerial,
      purchaseDate: formatDateToISO(values.purchaseDate),
      soldAmount: safeParseFloat(values.soldAmount),
      price: safeParseFloat(values.price),
      dateSoldDiscarded: formatDateToISO(values.dateSoldDiscarded),
      isAssigned: !!values.assignedProperty,
      realEstateId: values.assignedProperty ? Number(values.assignedProperty) : null,
      isAddedToWallet: values.isAddedToWallet,
    };

    // Only include warranty if the user has entered any warranty data
    if (hasWarrantyData(values)) {
      propertyPayload.warranty = {
        itemName: values.warrantyItemName,
        warrantyProvider: values.warrantyProvider,
        warrantyNumber: values.warrantyNumber,
        cost: safeParseFloat(values.warrantyCost) || undefined,
        expiration: formatDateToISO(values.warrantyExpiration),
        startDate: formatDateToISO(values.warrantyStartDate),
        notes: values.warrantyNotes,
        website: values.warrantyWebsite,
        uploadAttachments: warrantyDocIds.length > 0 ? warrantyDocIds : [],
      };
    }

    // Only include insurance if the user has entered any insurance data
    if (hasInsuranceData(values)) {
      propertyPayload.insurance = {
        itemName: values.insuranceItemName,
        insuranceCarrier: values.insuranceCarrier,
        policyNumber: values.policyNumber,
        annualPremium: safeParseFloat(values.annualPremium),
        agentEmail: values.agentEmail,
        startDate: formatDateToISO(values.insuranceStartDate),
        renewalDate: formatDateToISO(values.insuranceRenewalDate),
        endDate: formatDateToISO(values.insuranceEndDate),
        agent: values.insuranceAgent,
        agentPhone: values.insuranceAgentPhone,
        uploadAttachments: insuranceDocIds.length > 0 ? insuranceDocIds : [],
        isPaidAnnually: values.insuranceIsPaidAnnually || false,
      };
      // Only include dueDay when not paid annually
      if (!values.insuranceIsPaidAnnually) {
        propertyPayload.insurance.dueDay = safeParseInt(values.insuranceDueDay);
      }
    }

    // Only include loan if the user has entered any loan data
    if (hasLoanData(values)) {
      propertyPayload.loan = {
        lenderProvider: values.lenderProvider,
        lenderLocation: values.lenderLocation,
        lenderPhoneNumber: values.lenderPhoneNumber,
        lenderEmail: values.lenderEmail,
        accountNumber: values.accountNumber,
        balance: safeParseFloat(values.balance),
        estBalance: safeParseFloat(values.estBalance),
        monthlyPayment: safeParseFloat(values.monthlyPayment),
        startDate: formatDateToISO(values.loanStartDate),
        endDate: formatDateToISO(values.loanEndDate),
        dueDay: safeParseInt(values.loanDueDay),
        ratePercent: safeParseFloat(values.ratePercentage),
        bestName: values.loanItemName,
        uploadAttachments: loanDocIds.length > 0 ? loanDocIds : [],
      };
    }

    if (isBusinessRole()) {
      propertyPayload.businessId = selectedBusinessId;
    }

    dispatch(addPersonalPropertyAsync({ ...propertyPayload, ...(ownerUserId ? { ownerUserId } : {}) }) as any).then((a: any) => saveLinksAfter(links, a, undefined, expenseDrafts.createAll, recordNotes));
  };

  // Handle success navigation
  useEffect(() => {
    if (add_personal_property_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(setAddPersonalPropertyStatus());
      formikRef?.current?.resetForm();
      setAttachmentIds([]);
      setWarrantyDocIds([]);
      setInsuranceDocIds([]);
      setLoanDocIds([]);
      navigation.goBack();
    }
  }, [add_personal_property_status]);

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView
        style={commonStyles.container}
        behavior={isIOS ? 'padding' : undefined}
      >
        <AuthHeader
          onBackPress={() => navigation.goBack()}
          containerStyle={styles.headerContainer}
          title={userRole
            ? t('business.sub_items.business_property')
            : t('personal_property.title')}
          backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
        />

        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={validationSchema('real_state_personal_property')}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            handleSubmit,
          }) => {
            return (
              <>
                <ScrollView
                  style={commonStyles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >

                  <View style={commonStyles.formContainer}>
                    {/* Item Name */}
                    <CustomInput
                      label={`${t('add_personal_property.item_name')} *`}
                      placeholder={`${t(
                        'add_personal_property.item_name_placeholder',
                      )} *`}
                      value={values.name}
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.name && errors.name
                          ? String(errors.name)
                          : undefined
                      }
                    />
                    <ImageUploader
                      label={t('add_personal_property.upload_photo')}
                      multiple={true}
                      maxImages={5}
                      imageIds={attachmentIds}
                      onImageSelect={() => { }}
                      onImageUploaded={(ids: string[]) => setAttachmentIds(ids)}
                      uploadType="box"
                      iconType="ionicons"
                      iconName="cloud-upload-outline"
                      iconSize={24}
                      iconColor={colors.gray}
                      autoUpload={true}
                      containerStyle={{ marginBottom: 12 }}
                      removable={true}
                      onRemove={() => { }}
                    />

                    {/* Category */}
                    <View style={commonStyles.inputGroup}>
                      <Text style={[commonStyles.label]}>
                        {t('add_personal_property.category')} *
                      </Text>
                      <CustomDropDown
                        options={get_dropdown_options_data}
                        value={values.category}
                        onSelect={(val: string | string[] | null) => {
                          if (val && typeof val === 'string') {
                            setFieldValue('category', val);
                          }
                        }}
                        placeholder={t('add_personal_property.select_category')}
                        search={true}
                        leftIcon={true}
                        style={commonStyles.dropdown}
                      />
                      {touched.category && errors.category && (
                        <Text style={styles.errorText}>
                          {errors.category as string}
                        </Text>
                      )}
                    </View>

                    {/* Model/Serial # and Purchase Date */}
                    <View style={commonStyles.rowContainer}>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={t('add_personal_property.model_serial')}
                          placeholder={t(
                            'add_personal_property.serial_number_placeholder',
                          )}
                          value={values.modelSerial}
                          onChangeText={handleChange('modelSerial')}
                          containerStyle={commonStyles.inputContainerNoMargin}
                          error={
                            touched.modelSerial && errors.modelSerial
                              ? String(errors.modelSerial)
                              : undefined
                          }
                        />
                      </View>
                      <View style={commonStyles.halfInput}>
                        <CustomDateTimePicker
                          label={t('add_personal_property.purchase_date')}
                          placeholder={t('add_personal_property.select')}
                          value={values.purchaseDate}
                          onChange={(val: any) =>
                            setFieldValue('purchaseDate', val as Date)
                          }
                          mode="date"
                          displayFormat="MM/DD/YYYY"
                          suffixIcon={
                            <MaterialCommunityIcons
                              name="calendar-blank-outline"
                              size={20}
                              color={themeColors.textSecondary}
                            />
                          }
                          error={
                            touched.purchaseDate && errors.purchaseDate
                              ? String(errors.purchaseDate)
                              : undefined
                          }
                        />
                      </View>
                    </View>

                    {/* Price (Optional) and Date Sold/Discarded */}
                    <View style={commonStyles.rowContainer}>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={t('add_personal_property.price_optional')}
                          placeholder={t(
                            'add_personal_property.price_number_placeholder',
                          )}
                          value={values.price}
                          onChangeText={handleChange('price')}
                          onBlur={handleBlur('price')}
                          keyboardType="decimal-pad"
                          containerStyle={commonStyles.inputContainerNoMargin}
                        />
                      </View>
                      <View style={commonStyles.halfInput}>
                        <CustomDateTimePicker
                          label={t('add_personal_property.date_sold_discarded')}
                          placeholder={t('add_personal_property.select')}
                          value={values.dateSoldDiscarded}
                          onChange={(val: any) =>
                            setFieldValue('dateSoldDiscarded', val as Date)
                          }
                          mode="date"
                          displayFormat="MM/DD/YYYY"
                          clearable
                          suffixIcon={
                            <MaterialCommunityIcons
                              name="calendar-blank-outline"
                              size={20}
                              color={themeColors.textSecondary}
                            />
                          }
                          error={
                            touched.dateSoldDiscarded &&
                              errors.dateSoldDiscarded
                              ? String(errors.dateSoldDiscarded)
                              : undefined
                          }
                        />
                      </View>
                    </View>
                    <View style={commonStyles.rowContainer}>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={t('add_personal_property.soldAmount')}
                          placeholder={t(
                            'add_personal_property.soldAmount',
                          )}
                          value={values.soldAmount}
                          onChangeText={handleChange('soldAmount')}
                          onBlur={handleBlur('soldAmount')}
                          keyboardType="decimal-pad"
                          containerStyle={commonStyles.inputContainerNoMargin}
                        />
                      </View>
                    </View>

                    {/* Assigned Property Dropdown */}
                    <View style={commonStyles.inputGroup}>
                      <Text style={[commonStyles.label]}>
                        {t('add_personal_property.assigned_property')}
                      </Text>
                      <CustomDropDown
                        options={[
                          { value: '', label: t('add_personal_property.unassigned') },
                          ...realEstates,
                        ]}
                        value={values.assignedProperty}
                        onSelect={val => {
                          const assignedProperty = typeof val === 'string' ? val : '';
                          setFieldValue('assignedProperty', assignedProperty);
                          setFieldValue('isAssigned', !!assignedProperty);
                        }}
                        placeholder={t('add_personal_property.unassigned')}
                        search={true}
                        leftIcon={true}
                        style={commonStyles.dropdown}
                      />
                      <Text style={commonStyles.helperText}>
                        {t('add_personal_property.assign_property_helper')}
                      </Text>
                    </View>

                    <View style={commonStyles.toggleRow}>
                      <Text style={commonStyles.toggleLabel}>
                        {t('add_personal_property.add_to_wallet_question')}
                      </Text>
                      <Switch
                        value={values.isAddedToWallet}
                        onValueChange={value => {
                          setFieldValue('isAddedToWallet', value);
                        }}
                        trackColor={{ false: '#E8E8E8', true: colors.primary }}
                        thumbColor={colors.white}
                      />
                    </View>

                    {/* Warranty Section */}
                    <View style={commonStyles.sectionDivider} />
                    <Text style={[commonStyles.sectionTitle]}>
                      {' '}
                      {t('add_personal_property.warranty_optional')}
                    </Text>

                    <CustomInput
                      label={t('add_personal_property.item_name')}
                      placeholder={t('add_personal_property.item_name_example')}
                      value={values.warrantyItemName}
                      onChangeText={handleChange('warrantyItemName')}
                      onBlur={handleBlur('warrantyItemName')}
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.warrantyItemName && errors.warrantyItemName
                          ? String(errors.warrantyItemName)
                          : undefined
                      }
                    />

                    <VendorAutocompleteInput
                      category="warranty_provider_property"
                      label={t('add_personal_property.warranty_provider')}
                      placeholder={t(
                        'add_personal_property.warranty_provider_placeholder',
                      )}
                      value={values.warrantyProvider}
                      onChangeText={handleChange('warrantyProvider')}
                      onBlur={handleBlur('warrantyProvider')}
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.warrantyProvider && errors.warrantyProvider
                          ? String(errors.warrantyProvider)
                          : undefined
                      }
                    />

                    {/* Warranty Number & Cost */}
                    <View style={commonStyles.rowContainer}>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={t('warranties.warranty_number')}
                          placeholder={t('warranties.warranty_number_placeholder')}
                          value={values.warrantyNumber}
                          onChangeText={handleChange('warrantyNumber')}
                          onBlur={handleBlur('warrantyNumber')}
                          containerStyle={commonStyles.inputContainerNoMargin}
                        />
                      </View>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={t('warranties.cost')}
                          placeholder={t('warranties.cost_placeholder')}
                          value={values.warrantyCost}
                          onChangeText={handleChange('warrantyCost')}
                          onBlur={handleBlur('warrantyCost')}
                          keyboardType="decimal-pad"
                          containerStyle={commonStyles.inputContainerNoMargin}
                        />
                      </View>
                    </View>

                     {/* Warranty Start Date */}
                    <CustomDateTimePicker
                      label={t('add_personal_property.start_date')}
                      placeholder={t('add_personal_property.select')}
                      value={values.warrantyStartDate}
                      onChange={(val: any) =>
                        setFieldValue('warrantyStartDate', val as Date)
                      }
                      mode="date"
                      displayFormat="MM/DD/YYYY"
                      suffixIcon={
                        <MaterialCommunityIcons
                          name="calendar-blank-outline"
                          size={20}
                          color={themeColors.textSecondary}
                        />
                      }
                      containerStyle={commonStyles.datePickerContainer}
                    />

                    {/* Warranty Expiration */}
                    <CustomDateTimePicker
                      label={t('add_personal_property.expiration')}
                      placeholder={t('add_personal_property.select')}
                      value={values.warrantyExpiration}
                      onChange={(val: any) =>
                        setFieldValue('warrantyExpiration', val as Date)
                      }
                      mode="date"
                      displayFormat="MM/DD/YYYY"
                      clearable
                      suffixIcon={
                        <MaterialCommunityIcons
                          name="calendar-blank-outline"
                          size={20}
                          color={themeColors.textSecondary}
                        />
                      }
                      containerStyle={commonStyles.datePickerContainer}
                      error={
                        touched.warrantyExpiration && errors.warrantyExpiration
                          ? String(errors.warrantyExpiration)
                          : undefined
                      }
                    />

                   

                    {/* Warranty Notes */}
                    <CustomInput
                      label={t('add_personal_property.notes')}
                      placeholder={t('add_personal_property.notes')}
                      value={values.warrantyNotes}
                      onChangeText={handleChange('warrantyNotes')}
                      onBlur={handleBlur('warrantyNotes')}
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                      containerStyle={commonStyles.inputContainer}
                      inputContainerStyle={commonStyles.textAreaContainer}
                      inputStyle={[commonStyles.textAreaInput]}
                      error={
                        touched.warrantyNotes && errors.warrantyNotes
                          ? String(errors.warrantyNotes)
                          : undefined
                      }
                    />

                    {/* Warranty Website */}
                    <CustomInput
                      label={t('add_personal_property.website_optional')}
                      placeholder={t(
                        'add_personal_property.website_placeholder',
                      )}
                      value={values.warrantyWebsite}
                      onChangeText={handleChange('warrantyWebsite')}
                      onBlur={handleBlur('warrantyWebsite')}
                      autoCapitalize="none"
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.warrantyWebsite && errors.warrantyWebsite
                          ? String(errors.warrantyWebsite)
                          : undefined
                      }
                    />

                    {/* Upload Attachments for Warranty (multi-doc) */}
                    <MixedMediaUploader
                      mediaIds={warrantyDocIds}
                      onMediaChange={(ids: string[]) => setWarrantyDocIds(ids)}
                      label={t('add_personal_property.upload_attachments')}
                      uploadType="box"
                      maxItems={5}
                      autoUpload={true}
                      removable={true}
                    />

                    {/* Insurance Section */}
                    <View style={commonStyles.sectionDivider} />
                    <Text style={[commonStyles.sectionTitle]}>
                      {t('add_personal_property.insurance_optional')}
                    </Text>

                    {/* Insurance Item Name */}
                    <CustomInput
                      label={t('add_personal_property.item_name')}
                      placeholder={t('add_personal_property.item_name_example')}
                      value={values.insuranceItemName}
                      onChangeText={handleChange('insuranceItemName')}
                      onBlur={handleBlur('insuranceItemName')}
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.insuranceItemName && errors.insuranceItemName
                          ? String(errors.insuranceItemName)
                          : undefined
                      }
                    />



                    {/* Insurance Carrier */}
                    <VendorAutocompleteInput
                      category="insurance_carrier_property"
                      label={t('add_personal_property.insurance_carrier')}
                      placeholder={t(
                        'add_personal_property.insurance_carrier_placeholder',
                      )}
                      value={values.insuranceCarrier}
                      onChangeText={handleChange('insuranceCarrier')}
                      onBlur={handleBlur('insuranceCarrier')}
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.insuranceCarrier && errors.insuranceCarrier
                          ? String(errors.insuranceCarrier)
                          : undefined
                      }
                    />

                    {/* Policy # */}
                    <CustomInput
                      label={t('add_personal_property.policy_number')}
                      placeholder={t(
                        'add_personal_property.policy_number_placeholder',
                      )}
                      value={values.policyNumber}
                      onChangeText={handleChange('policyNumber')}
                      onBlur={handleBlur('policyNumber')}
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.policyNumber && errors.policyNumber
                          ? String(errors.policyNumber)
                          : undefined
                      }
                    />

                    {/* Annual Premium */}
                    <CustomInput
                      label={t('add_personal_property.annual_premium')}
                      placeholder={t(
                        'add_personal_property.annual_premium_placeholder',
                      )}
                      value={values.annualPremium}
                      onChangeText={handleChange('annualPremium')}
                      onBlur={handleBlur('annualPremium')}
                      keyboardType="decimal-pad"
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.annualPremium && errors.annualPremium
                          ? String(errors.annualPremium)
                          : undefined
                      }
                    />

                    {/* Insurance Start Date and Renewal Date */}
                    <View style={commonStyles.rowContainer}>
                      <View style={commonStyles.halfInput}>
                        <CustomDateTimePicker
                          label={t('add_personal_property.start_date')}
                          placeholder={t('add_personal_property.select')}
                          value={values.insuranceStartDate}
                          onChange={(val: any) =>
                            setFieldValue('insuranceStartDate', val as Date)
                          }
                          mode="date"
                          displayFormat="MM/DD/YYYY"
                          suffixIcon={
                            <MaterialCommunityIcons
                              name="calendar-blank-outline"
                              size={20}
                              color={themeColors.textSecondary}
                            />
                          }
                        />
                      </View>
                      <View style={commonStyles.halfInput}>
                        <CustomDateTimePicker
                          label={t('add_personal_property.renewal_date')}
                          placeholder={t('add_personal_property.select')}
                          value={values.insuranceRenewalDate}
                          onChange={(val: any) =>
                            setFieldValue('insuranceRenewalDate', val as Date)
                          }
                          mode="date"
                          displayFormat="MM/DD/YYYY"
                          suffixIcon={
                            <MaterialCommunityIcons
                              name="calendar-blank-outline"
                              size={20}
                              color={themeColors.textSecondary}
                            />
                          }
                        />
                      </View>
                    </View>

                    {/* Paid Annually Toggle */}
                    <View style={commonStyles.toggleRow}>
                      <Text style={commonStyles.toggleLabel}>
                        {t('real_estate.paid_annually')}
                      </Text>
                      <Switch
                        value={values.insuranceIsPaidAnnually}
                        onValueChange={value => {
                          setFieldValue('insuranceIsPaidAnnually', value);
                          if (value) {
                            setFieldValue('insuranceDueDay', '');
                          }
                        }}
                        trackColor={{ false: '#E8E8E8', true: colors.primary }}
                        thumbColor={colors.white}
                      />
                    </View>

                    {/* Insurance End Date and Due Day */}
                    <View style={commonStyles.rowContainer}>
                      <View style={commonStyles.halfInput}>
                        <CustomDateTimePicker
                          label={t('add_personal_property.end_date')}
                          placeholder={t('add_personal_property.select')}
                          value={values.insuranceEndDate}
                          onChange={(val: any) =>
                            setFieldValue('insuranceEndDate', val as Date)
                          }
                          mode="date"
                          displayFormat="MM/DD/YYYY"
                          clearable
                          suffixIcon={
                            <MaterialCommunityIcons
                              name="calendar-blank-outline"
                              size={20}
                              color={themeColors.textSecondary}
                            />
                          }
                        />
                      </View>
                      {!values.insuranceIsPaidAnnually && (
                        <View style={commonStyles.halfInput}>
                          <CustomInput
                            label={t('add_personal_property.due_day')}
                            placeholder={t(
                              'add_personal_property.due_day_placeholder',
                            )}
                            value={values.insuranceDueDay}
                            onChangeText={handleChange('insuranceDueDay')}
                            onBlur={handleBlur('insuranceDueDay')}
                            keyboardType="number-pad"
                            containerStyle={commonStyles.inputContainerNoMargin}
                            error={
                              touched.insuranceDueDay && errors.insuranceDueDay
                                ? String(errors.insuranceDueDay)
                                : undefined
                            }
                          />
                        </View>
                      )}
                    </View>
                    {/* Agent Email */}
                    <CustomInput
                      label={t('add_personal_property.agent_email')}
                      placeholder={t('add_personal_property.agent_email')}
                      value={values.agentEmail}
                      onChangeText={handleChange('agentEmail')}
                      onBlur={handleBlur('agentEmail')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.agentEmail && errors.agentEmail
                          ? String(errors.agentEmail)
                          : undefined
                      }
                    />
                    {/* Agent (Optional) and Agent Phone (Optional) */}
                    <View style={commonStyles.rowContainer}>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={t('add_personal_property.agent_optional')}
                          placeholder={t(
                            'add_personal_property.agent_placeholder',
                          )}
                          value={values.insuranceAgent}
                          onChangeText={handleChange('insuranceAgent')}
                          onBlur={handleBlur('insuranceAgent')}
                          containerStyle={commonStyles.inputContainerNoMargin}
                        />
                      </View>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={t(
                            'add_personal_property.agent_phone_optional',
                          )}
                          placeholder={t(
                            'add_personal_property.agent_phone_placeholder',
                          )}
                          value={values.insuranceAgentPhone}
                          onChangeText={handleChange('insuranceAgentPhone')}
                          onBlur={handleBlur('insuranceAgentPhone')}
                          keyboardType="phone-pad"
                          containerStyle={commonStyles.inputContainerNoMargin}
                        />
                      </View>
                    </View>

                    {/* Upload Attachments for Insurance (multi-doc) */}
                    <MixedMediaUploader
                      mediaIds={insuranceDocIds}
                      onMediaChange={(ids: string[]) => setInsuranceDocIds(ids)}
                      label={t('add_personal_property.upload_attachments')}
                      uploadType="box"
                      maxItems={5}
                      autoUpload={true}
                      removable={true}
                    />

                    {/* Loan Section */}
                    <View style={commonStyles.sectionDivider} />
                    <Text style={[commonStyles.sectionTitle]}>
                      {t('add_personal_property.loan_optional')}
                    </Text>

                    {/* Loan Item Name */}
                    <CustomInput
                      label={`${t('loans.best_name')} *`}
                      placeholder={t('loans.best_name')}
                      value={values.loanItemName}
                      onChangeText={handleChange('loanItemName')}
                      onBlur={handleBlur('loanItemName')}
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.loanItemName && errors.loanItemName
                          ? String(errors.loanItemName)
                          : undefined
                      }
                    />

                    {/* Lender/Provider */}
                    <VendorAutocompleteInput
                      category="lender_provider_property"
                      label={`${t('add_personal_property.lender_provider')} *`}
                      placeholder={t(
                        'add_personal_property.lender_placeholder',
                      )}
                      value={values.lenderProvider}
                      onChangeText={handleChange('lenderProvider')}
                      onBlur={handleBlur('lenderProvider')}
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.lenderProvider && errors.lenderProvider
                          ? String(errors.lenderProvider)
                          : undefined
                      }
                    />

                    {/* Lender Location */}
                    <CustomInput
                      label={`${t('add_personal_property.lender_location')} *`}
                      placeholder={t('add_personal_property.lender_location')}
                      value={values.lenderLocation}
                      onChangeText={handleChange('lenderLocation')}
                      onBlur={handleBlur('lenderLocation')}
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.lenderLocation && errors.lenderLocation
                          ? String(errors.lenderLocation)
                          : undefined
                      }
                    />

                    {/* Lender Phone Number */}
                    <CustomInput
                      label={`${t(
                        'add_personal_property.lender_phone_number',
                      )} *`}
                      placeholder={t(
                        'add_personal_property.lender_phone_number',
                      )}
                      value={values.lenderPhoneNumber}
                      onChangeText={handleChange('lenderPhoneNumber')}
                      onBlur={handleBlur('lenderPhoneNumber')}
                      keyboardType="phone-pad"
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.lenderPhoneNumber && errors.lenderPhoneNumber
                          ? String(errors.lenderPhoneNumber)
                          : undefined
                      }
                    />

                    {/* Lender Email */}
                    <CustomInput
                      label={`${t('add_personal_property.lender_email')} *`}
                      placeholder={t('add_personal_property.lender_email')}
                      value={values.lenderEmail}
                      onChangeText={handleChange('lenderEmail')}
                      onBlur={handleBlur('lenderEmail')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.lenderEmail && errors.lenderEmail
                          ? String(errors.lenderEmail)
                          : undefined
                      }
                    />

                    {/* Account Number */}
                    <CustomInput
                      label={`${t('add_personal_property.account_number')} *`}
                      placeholder={t('add_personal_property.account_number')}
                      value={values.accountNumber}
                      onChangeText={handleChange('accountNumber')}
                      onBlur={handleBlur('accountNumber')}
                      containerStyle={commonStyles.inputContainer}
                      keyboardType="numbers-and-punctuation"
                      error={
                        touched.accountNumber && errors.accountNumber
                          ? String(errors.accountNumber)
                          : undefined
                      }
                    />

                    {/* Balance and EST Balance */}
                    <View style={commonStyles.rowContainer}>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={`${t('add_personal_property.balance')} *`}
                          placeholder={t(
                            'add_personal_property.balance_placeholder',
                          )}
                          value={values.balance}
                          onChangeText={handleChange('balance')}
                          onBlur={handleBlur('balance')}
                          keyboardType="decimal-pad"
                          containerStyle={commonStyles.inputContainerNoMargin}
                          error={
                            touched.balance && errors.balance
                              ? String(errors.balance)
                              : undefined
                          }
                        />
                      </View>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={`${t('add_personal_property.est_balance')} *`}
                          placeholder={t(
                            'add_personal_property.est_balance_placeholder',
                          )}
                          value={values.estBalance}
                          onChangeText={handleChange('estBalance')}
                          onBlur={handleBlur('estBalance')}
                          keyboardType="decimal-pad"
                          containerStyle={commonStyles.inputContainerNoMargin}
                          error={
                            touched.estBalance && errors.estBalance
                              ? String(errors.estBalance)
                              : undefined
                          }
                        />
                      </View>
                    </View>

                    {/* Monthly Payment */}
                    <CustomInput
                      label={`${t('add_personal_property.monthly_payment')} *`}
                      placeholder={t(
                        'add_personal_property.est_balance_placeholder',
                      )}
                      value={values.monthlyPayment}
                      onChangeText={handleChange('monthlyPayment')}
                      onBlur={handleBlur('monthlyPayment')}
                      keyboardType="decimal-pad"
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.monthlyPayment && errors.monthlyPayment
                          ? String(errors.monthlyPayment)
                          : undefined
                      }
                    />

                    {/* Loan Start Date and End Date */}
                    <View style={commonStyles.rowContainer}>
                      <View style={commonStyles.halfInput}>
                        <CustomDateTimePicker
                          label={t('add_personal_property.start_date')}
                          placeholder={t('add_personal_property.select')}
                          value={values.loanStartDate}
                          onChange={(val: any) =>
                            setFieldValue('loanStartDate', val as Date)
                          }
                          mode="date"
                          displayFormat="MM/DD/YYYY"
                          suffixIcon={
                            <MaterialCommunityIcons
                              name="calendar-blank-outline"
                              size={20}
                              color={themeColors.textSecondary}
                            />
                          }
                        />
                      </View>
                      <View style={commonStyles.halfInput}>
                        <CustomDateTimePicker
                          label={t('add_personal_property.end_date')}
                          placeholder={t('add_personal_property.select')}
                          value={values.loanEndDate}
                          onChange={(val: any) =>
                            setFieldValue('loanEndDate', val as Date)
                          }
                          mode="date"
                          displayFormat="MM/DD/YYYY"
                          clearable
                          suffixIcon={
                            <MaterialCommunityIcons
                              name="calendar-blank-outline"
                              size={20}
                              color={themeColors.textSecondary}
                            />
                          }
                          error={
                            touched.loanEndDate && errors.loanEndDate
                              ? String(errors.loanEndDate)
                              : undefined
                          }
                        />
                      </View>
                    </View>

                    {/* Due Day */}
                    <CustomInput
                      label={`${t('add_personal_property.due_day_loan')} *`}
                      placeholder={
                        t('add_personal_property.due_day_placeholder') || '1-31'
                      }
                      value={values.loanDueDay}
                      onChangeText={handleChange('loanDueDay')}
                      onBlur={handleBlur('loanDueDay')}
                      keyboardType="number-pad"
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.loanDueDay && errors.loanDueDay
                          ? String(errors.loanDueDay)
                          : undefined
                      }
                    />

                    {/* Rate % */}
                    <CustomInput
                      label={`${t('add_personal_property.rate_percentage')} *`}
                      placeholder={t(
                        'add_personal_property.rate_percentage_placeholder',
                      )}
                      value={values.ratePercentage}
                      onChangeText={handleChange('ratePercentage')}
                      onBlur={handleBlur('ratePercentage')}
                      keyboardType="decimal-pad"
                      containerStyle={commonStyles.inputContainer}
                      error={
                        touched.ratePercentage && errors.ratePercentage
                          ? String(errors.ratePercentage)
                          : undefined
                      }
                    />


                    {/* Upload Attachments for Loan (multi-doc) */}
                    <MixedMediaUploader
                      mediaIds={loanDocIds}
                      onMediaChange={(ids: string[]) => setLoanDocIds(ids)}
                      label={t('add_personal_property.upload_attachments')}
                      uploadType="box"
                      maxItems={5}
                      autoUpload={true}
                      removable={true}
                    />
                  </View>
                </ScrollView>

                <RecordExpensesEditor links={links} drafts={expenseDrafts} />
                  <RecordNotesField notes={recordNotes} />
                  <RecordLinksField links={links} />

                {/* Add Item Button */}
                <View style={commonStyles.buttonContainer}>
                  <PrimaryButton
                    title={t('add_personal_property.add_item')}
                    onPress={() => handleSubmit()}
                    buttonStyle={commonStyles.addButton}
                    loading={isLoading}
                    disabled={isLoading}
                  />
                </View>
              </>
            );
          }}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddPersonalProperty;
