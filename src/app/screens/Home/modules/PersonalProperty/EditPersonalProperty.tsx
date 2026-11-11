import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../components/notes/RecordNotesField';
import {
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Switch,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {
  AuthHeader,
  CustomDropDown,
  AssignmentDropdownField,
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
  getPersonalPropertyByIdAsync,
  updatePersonalPropertyAsync,
} from '../../../../../redux/services/assetsService';
import { setUpdatePersonalPropertyStatus } from '../../../../../redux/slices/assetsSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../utils/validationSchemas';
import type {
  EditPersonalPropertyRouteProp,
  PersonalPropertyFormData,
} from './PersonalProperty.types';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { useAssignmentFields } from '../../../../../hooks/useAssignmentFields';
import { getDropdownOptionsAsync } from '../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles } from './PersonalProperty.styles';
import { makeEditPersonalPropertyStyles } from './EditPersonalProperty.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../hooks/useRecordLinkSelection';
import { RecordExpensesEditor, useExpenseDrafts } from '../../../../../components/expenses/RecordExpensesEditor';
import { RecordLinksField } from '../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../constants/recordLinkModules';

const EditPersonalProperty = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const formikRef = useRef<FormikProps<PersonalPropertyFormData> | null>(null);
  const { selectedBusinessId } = useSelectedBusiness();
  const { isBusinessRole, themeColors, userRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeEditPersonalPropertyStyles(themeColors as RoleTheme), [themeColors]);

  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
  const [warrantyDocIds, setWarrantyDocIds] = useState<string[]>([]);
  const [insuranceDocIds, setInsuranceDocIds] = useState<string[]>([]);
  const [loanDocIds, setLoanDocIds] = useState<string[]>([]);

  const { propertyId, ownerUserId, property: passedProperty, ownerBusinessId, ownerName, isFromEmergencyAccess } =
    (route?.params as EditPersonalPropertyRouteProp) || {};
  const isOwnerScoped = !!ownerUserId;
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.Property,
      recordId: propertyId ? Number(propertyId) : null,
      businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
      enabled: !ownerUserId && !isFromEmergencyAccess,
  });
  // Notes' "Encrypt notes" choice; saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Property, recordId: propertyId ? Number(propertyId) : null, enabled: links.enabled });
  // New expenses typed on this form, created and linked when it's saved (as on the web).
  const expenseDrafts = useExpenseDrafts(isBusinessRole() ? selectedBusinessId ?? null : null);

  // Redux state selectors
  const {
    update_personal_property_status,
    get_personal_property_by_id_data,
    get_personal_property_by_id_status,
  } = useSelector((state: any) => state.assets_slice);

  const property = passedProperty || get_personal_property_by_id_data;
  // Personal Property has no linked "realestate" object (§7 of the
  // shared-record-linkage spec) — only the flat id, so an unshared link shows
  // as "Assigned (not shared with you)" rather than a name.
  const linkedRealEstateId = property?.realestateid ?? property?.realEstateId;

  const assignment = useAssignmentFields({
    slots: ['realestate'],
    isOwnerScoped,
    isEmergency: !!isFromEmergencyAccess,
    ownerUserId,
    ownerName,
    ownerBusinessId,
    isBusiness: isBusinessRole(),
    myBusinessId: selectedBusinessId,
    linkedIds: { realestate: linkedRealEstateId },
    dropPastEndDateRealEstate: true,
  });

  const isLoading = update_personal_property_status === ASYNC_STATUS.LOADING;
  const getDataLoading =
    !passedProperty && get_personal_property_by_id_status === ASYNC_STATUS.LOADING;

  const { get_dropdown_options_data } = useSelector(
    (state: any) => state.user_auth,
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(getDropdownOptionsAsync('PropertyCategory'));
    }, [dispatch]),
  );

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      e => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Fetch property data by ID — skipped when the caller already handed us the
  // full record (e.g. editing a connection's shared property from its list).
  // GET /properties/:id 404s for a property you don't directly own even with
  // ownerUserId, same as web, which never makes this call in that case either.
  useEffect(() => {
    if (propertyId && !passedProperty) {
      dispatch(getPersonalPropertyByIdAsync(ownerUserId ? { id: propertyId, ownerUserId } : propertyId) as any);
    }
  }, [dispatch, propertyId, ownerUserId, passedProperty]);

  const handleRemoveWarrantyDocument = (setFieldValue: any) => {
    setWarrantyDocIds([]);
  };

  const handleRemoveInsuranceDocument = (setFieldValue: any) => {
    setInsuranceDocIds([]);
  };

  const handleRemoveLoanDocument = (setFieldValue: any) => {
    setLoanDocIds([]);
  };

  const initialValues: PersonalPropertyFormData = {
    name: '',
    category: '',
    attachment: '',
    modelSerial: '',
    purchaseDate: null,
    price: '',
    dateSoldDiscarded: null,
    isAssigned: false,
    assignedProperty: linkedRealEstateId ? String(linkedRealEstateId) : '',
    soldAmount: '',
    isAddedToWallet: false,
    warrantyItemName: '',
    warrantyProvider: '',
    warrantyExpiration: null,
    warrantyStartDate: null,
    warrantyNotes: '',
    warrantyWebsite: '',
    warrantyNumber: '',
    warrantyCost: '',
    warrantyUploadAttachments: '',
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

  // Helper to convert Date to ISO string
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

  // Helper to safely parse a number
  const safeParseFloat = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const safeParseInt = (value: string): number => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Check if the warranty section has any user-entered data
  const hasWarrantyData = (values: PersonalPropertyFormData): boolean => {
    return !!(
      values.warrantyItemName?.trim() ||
      values.warrantyProvider?.trim() ||
      values.warrantyExpiration ||
      values.warrantyStartDate ||
      values.warrantyNotes?.trim() ||
      values.warrantyWebsite?.trim() ||
      values.warrantyNumber?.trim() ||
      values.warrantyCost?.trim() ||
      warrantyDocIds.length > 0
    );
  };

  // Check if the insurance section has any user-entered data
  const hasInsuranceData = (values: PersonalPropertyFormData): boolean => {
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

  // Check if the loan section has any user-entered data
  const hasLoanData = (values: PersonalPropertyFormData): boolean => {
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

  const handleSubmit = (values: PersonalPropertyFormData): void => {
    const propertyPayload: any = {
      name: values.name,
      category: values.category,
      attachment: attachmentIds.length > 0 ? attachmentIds : [],
      modelSerial: values.modelSerial,
      soldamount: values.soldAmount ? safeParseFloat(values.soldAmount) : undefined,
      purchaseDate: formatDateToISO(values.purchaseDate),
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
        expiration: formatDateToISO(values.warrantyExpiration),
        startDate: formatDateToISO(values.warrantyStartDate),
        notes: values.warrantyNotes,
        website: values.warrantyWebsite,
        ...(values.warrantyNumber ? { warrantyNumber: values.warrantyNumber } : {}),
        ...(values.warrantyCost ? { cost: safeParseFloat(values.warrantyCost) } : {}),
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
    dispatch(
      updatePersonalPropertyAsync({
        id: propertyId,
        data: propertyPayload,
        ...(ownerUserId ? { ownerUserId } : {}),
      }) as any,
    ).then((a: any) => saveLinksAfter(links, a, propertyId, expenseDrafts.createAll, recordNotes));
  };

  // Populate form when data is loaded — from the by-id fetch normally, or
  // straight from the caller-supplied record when that fetch is skipped.
  useEffect(() => {
    const property = passedProperty || get_personal_property_by_id_data;
    if (property && propertyId && formikRef.current) {
      if (property) {
        // Parse dates from ISO strings
        const parsePurchaseDate = property.purchasedate
          ? new Date(property.purchasedate)
          : null;
        const parseDateSoldDiscarded = property.datesolddiscarded
          ? new Date(property.datesolddiscarded)
          : null;
        const parseWarrantyExpiration = property.warranty?.expiration
          ? new Date(property.warranty.expiration)
          : null;
        const parseWarrantyStartDate = property.warranty?.startdate
          ? new Date(property.warranty.startdate)
          : null;
        const parseInsuranceStartDate = property.insurance?.startdate
          ? new Date(property.insurance.startdate)
          : null;
        const parseInsuranceRenewalDate = property.insurance?.renewaldate
          ? new Date(property.insurance.renewaldate)
          : null;
        const parseInsuranceEndDate = property.insurance?.enddate
          ? new Date(property.insurance.enddate)
          : null;
        const parseLoanStartDate = property.loan?.startdate
          ? new Date(property.loan.startdate)
          : null;
        const parseLoanEndDate = property.loan?.enddate
          ? new Date(property.loan.enddate)
          : null;

        // Restore attachment image IDs from API data
        const normAttachments = Array.isArray(property.attachment)
          ? property.attachment
          : property.attachment
            ? [property.attachment as string]
            : [];
        setAttachmentIds(normAttachments);

        // Restore document IDs for warranty
        const normWarrantyDocs = Array.isArray(
          property.warranty?.uploadattachments,
        )
          ? (property.warranty!.uploadattachments as string[])
          : property.warranty?.uploadattachments
            ? [property.warranty.uploadattachments as string]
            : [];
        setWarrantyDocIds(normWarrantyDocs);

        // Restore document IDs for insurance
        const normInsuranceDocs = Array.isArray(
          property.insurance?.uploadattachments,
        )
          ? (property.insurance!.uploadattachments as string[])
          : property.insurance?.uploadattachments
            ? [property.insurance.uploadattachments as string]
            : [];
        setInsuranceDocIds(normInsuranceDocs);

        // Restore document IDs for loan
        const normLoanDocs = Array.isArray(property.loan?.uploadattachments)
          ? (property.loan!.uploadattachments as string[])
          : property.loan?.uploadattachments
            ? [property.loan.uploadattachments as string]
            : [];
        setLoanDocIds(normLoanDocs);
        formikRef.current.setValues({
          name: property.name || '',
          category: property.category || '',
          attachment: '', // managed via attachmentIds state
          modelSerial: property.modelserial || '',
          purchaseDate: parsePurchaseDate,
          price: property.price?.toString() || '',
          dateSoldDiscarded: parseDateSoldDiscarded,
          soldAmount: property.soldamount?.toString() || '',
          isAssigned: property.isassigned || false,
          assignedProperty: property.realestateid
            ? String(property.realestateid)
            : '',
          isAddedToWallet: property.isaddedtowallet || false,
          warrantyItemName: property.warranty?.itemname || '',
          warrantyProvider: property.warranty?.warrantyprovider || '',
          warrantyExpiration: parseWarrantyExpiration,
          warrantyStartDate: parseWarrantyStartDate,
          warrantyNotes: property.warranty?.notes || '',
          warrantyWebsite: property.warranty?.website || '',
          warrantyNumber: property.warranty?.warrantynumber || '',
          warrantyCost: property.warranty?.cost !== undefined && property.warranty?.cost !== null ? String(property.warranty.cost) : '',
          warrantyUploadAttachments: '', // managed via warrantyDocIds state
          insuranceItemName: property.insurance?.itemname || '',
          agentEmail: property.insurance?.agentemail || '',
          insuranceCarrier: property.insurance?.insurancecarrier || '',
          policyNumber: property.insurance?.policynumber || '',
          annualPremium: property.insurance?.annualpremium?.toString() || '',
          insuranceStartDate: parseInsuranceStartDate,
          insuranceRenewalDate: parseInsuranceRenewalDate,
          insuranceEndDate: parseInsuranceEndDate,
          insuranceDueDay: property.insurance?.dueday?.toString() || '',
          insuranceIsPaidAnnually: property.insurance?.ispaidannually ?? property.insurance?.isPaidAnnually ?? false,
          insuranceAgent: property.insurance?.agent || '',
          insuranceAgentPhone: property.insurance?.agentphone || '',
          insuranceUploadAttachments: '', // managed via insuranceDocIds state
          lenderProvider: property.loan?.lenderprovider || '',
          lenderLocation: property.loan?.lenderlocation || '',
          lenderPhoneNumber: property.loan?.lenderphonenumber || '',
          lenderEmail: property.loan?.lenderemail || '',
          accountNumber: property.loan?.accountnumber || '',
          balance: property.loan?.balance?.toString() || '',
          estBalance: property.loan?.estbalance?.toString() || '',
          monthlyPayment: property.loan?.monthlypayment?.toString() || '',
          loanStartDate: parseLoanStartDate,
          loanEndDate: parseLoanEndDate,
          loanDueDay: property.loan?.dueday?.toString() || '',
          ratePercentage: property.loan?.ratepercent?.toString() || '',
          loanItemName: property.loan?.bestname || '',
          loanUploadAttachments: '', // managed via loanDocIds state
        });
      }
    }
  }, [passedProperty, get_personal_property_by_id_data, propertyId]);

  useEffect(() => {
    if (update_personal_property_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(setUpdatePersonalPropertyStatus());
      navigation.goBack();
    }
  }, [update_personal_property_status, dispatch, navigation]);

  if (getDataLoading) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <AuthHeader
          title={t('edit_personal_property.screen_title')}
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
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>
            {t('edit_personal_property.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView
        style={commonStyles.container}
        behavior={isIOS ? 'padding' : undefined}
      >
        <AuthHeader
          // title={t('edit_personal_property.screen_title')}
          title={userRole
            ? t('edit_personal_property.business_screen_title')
            : t('edit_personal_property.screen_title')}
          onBackPress={() => navigation.goBack()}
          containerStyle={styles.headerContainer}
          titleStyle={{
            marginBottom: 0,
            marginTop: 20,
          }}
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
                          onBlur={handleBlur('modelSerial')}
                          containerStyle={commonStyles.inputContainerNoMargin}
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
                        />
                      </View>
                    </View>

                    {/* Price and Date Sold/Discarded */}
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
                          value={values.soldAmount as any}
                          onChangeText={handleChange('soldAmount')}
                          onBlur={handleBlur('soldAmount')}
                          keyboardType="decimal-pad"
                          containerStyle={commonStyles.inputContainerNoMargin}
                        />
                      </View>
                    </View>

                    {/* Assigned Property Dropdown — in mode B/D this lists
                        the owner's real estate, or a locked field when they
                        didn't share Real Estate at all. */}
                    {assignment.slotStates.realestate && (
                      <View style={commonStyles.inputGroup}>
                        <Text style={[commonStyles.label]}>
                          {t('add_personal_property.assigned_property')}
                        </Text>
                        <AssignmentDropdownField
                          slot={assignment.slotStates.realestate}
                          value={values.assignedProperty}
                          loading={assignment.isLoading}
                          search={false}
                          emptyOptionLabel={t('add_personal_property.unassigned')}
                          onSelect={(val) => {
                            setFieldValue('assignedProperty', val);
                            setFieldValue('isAssigned', !!val);
                          }}
                          placeholder={t(
                            'add_personal_property.select_assigned_property',
                          )}
                        />
                        <Text style={commonStyles.helperText}>
                          {t('add_personal_property.assign_property_helper')}
                        </Text>
                        {assignment.sectionMessage && (
                          <Text style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>
                            {assignment.sectionMessage}
                          </Text>
                        )}
                      </View>
                    )}

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
                      {t('add_personal_property.warranty_optional')}
                    </Text>

                    <CustomInput
                      label={t('add_personal_property.item_name')}
                      placeholder={t('add_personal_property.item_name_example')}
                      value={values.warrantyItemName}
                      onChangeText={handleChange('warrantyItemName')}
                      onBlur={handleBlur('warrantyItemName')}
                      containerStyle={commonStyles.inputContainer}
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
                    />

                    <View style={commonStyles.rowContainer}>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={t('warranties.warranty_number') || 'Warranty #'}
                          placeholder={t('warranties.warranty_number') || 'Warranty #'}
                          value={values.warrantyNumber}
                          onChangeText={handleChange('warrantyNumber')}
                          onBlur={handleBlur('warrantyNumber')}
                          containerStyle={commonStyles.inputContainerNoMargin}
                        />
                      </View>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={t('real_estate.cost')}
                          placeholder="0.00"
                          value={values.warrantyCost}
                          onChangeText={handleChange('warrantyCost')}
                          onBlur={handleBlur('warrantyCost')}
                          containerStyle={commonStyles.inputContainerNoMargin}
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>

                    <CustomDateTimePicker
                      label={t('add_personal_property.expiration')}
                      placeholder={t('add_personal_property.select')}
                      value={values.warrantyExpiration}
                      onChange={(val: any) =>
                        setFieldValue('warrantyExpiration', val as Date)
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
                    />

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
                    />

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

                    <CustomInput
                      label={t('add_personal_property.item_name')}
                      placeholder={t('add_personal_property.item_name_example')}
                      value={values.insuranceItemName}
                      onChangeText={handleChange('insuranceItemName')}
                      onBlur={handleBlur('insuranceItemName')}
                      containerStyle={commonStyles.inputContainer}
                    />



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

                    <View style={commonStyles.rowContainer}>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={`${t('add_personal_property.due_day_loan')} *`}
                          placeholder={t(
                            'add_personal_property.due_day_placeholder',
                          )}
                          value={values.loanDueDay}
                          onChangeText={handleChange('loanDueDay')}
                          onBlur={handleBlur('loanDueDay')}
                          keyboardType="number-pad"
                          containerStyle={commonStyles.inputContainerNoMargin}
                          error={
                            touched.loanDueDay && errors.loanDueDay
                              ? String(errors.loanDueDay)
                              : undefined
                          }
                        />
                      </View>
                      <View style={commonStyles.halfInput}>
                        <CustomInput
                          label={`${t(
                            'add_personal_property.rate_percentage',
                          )} *`}
                          placeholder={t(
                            'add_personal_property.rate_percentage_placeholder',
                          )}
                          value={values.ratePercentage}
                          onChangeText={handleChange('ratePercentage')}
                          onBlur={handleBlur('ratePercentage')}
                          keyboardType="decimal-pad"
                          containerStyle={commonStyles.inputContainerNoMargin}
                          error={
                            touched.ratePercentage && errors.ratePercentage
                              ? String(errors.ratePercentage)
                              : undefined
                          }
                        />
                      </View>
                    </View>

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

                {/* Update Button */}
                <View style={commonStyles.buttonContainer}>
                  <PrimaryButton
                    title={t('edit_personal_property.update_button')}
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

export default EditPersonalProperty;
