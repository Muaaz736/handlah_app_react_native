import {
  ScrollView, Text, View, Image, ActivityIndicator, Keyboard,
} from 'react-native';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../components/notes/RecordNotesField';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import {
  AuthHeader,
  CustomInput,
  CustomDropDown,
  CustomDateTimePicker,
  PrimaryButton,
  AddCredentialsModal,
} from '../../../../../components/common';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { makeAddLicenseStyles } from './AddLicense.styles';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { ICONS } from '../../../../../utils/Images';
import { isIOS } from '../../../../../utils/helpers';
import { addBusinessLicenseAsync, updateBusinessLicenseAsync, getBusinessLicenseByIdAsync } from '../../../../../redux/services/businessLicensesService';
import { resetAddBusinessLicenseStatus, resetUpdateBusinessLicenseStatus } from '../../../../../redux/slices/businessLicensesSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import validationSchema from '../../../../../utils/validationSchemas';
import { Credentials, FormValues } from './AddLicense.types';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { VendorAutocompleteInput } from '../../../../../components/common';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../constants/recordLinkModules';
import { LICENSE_KINDS, LICENSE_PERIODS, LICENSE_STATUSES, US_STATES, isSoftwareLicense } from '../../../../../constants/licenseKinds';


const AddLicense = (): React.ReactElement => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAddLicenseStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();

  const formikRef = useRef<FormikProps<FormValues> | null>(null);
  const [credentialsModalVisible, setCredentialsModalVisible] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

  // Get licenseId from route params if in edit mode
  const licenseId = (route.params as any)?.licenseId;
  const ownerUserId = (route.params as any)?.ownerUserId;
  const unlockedCredentials = (route.params as any)?.unlockedCredentials;
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.BusinessLicense,
      recordId: licenseId ? Number(licenseId) : null,
      businessId: selectedBusinessId ?? null,
      enabled: !ownerUserId,
  });
  // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.BusinessLicense, recordId: licenseId ? Number(licenseId) : null, enabled: links.enabled, choiceOnly: true });
  const isEditMode = !!licenseId;

  const { add_business_license_status, update_business_license_status, get_business_license_status, get_business_license_data } = useSelector(
    (state: any) => state.business_licenses_slice,
  );

  const isLoading =
    add_business_license_status === ASYNC_STATUS.LOADING ||
    update_business_license_status === ASYNC_STATUS.LOADING ||
    get_business_license_status === ASYNC_STATUS.LOADING;

  const autoRenewOptions = [
    { label: t('common.yes'), value: 'true' },
    { label: t('common.no'), value: 'false' },
  ];

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Fetch license data by ID when in edit mode
  useEffect(() => {
    if (isEditMode && licenseId) {
      dispatch(getBusinessLicenseByIdAsync(licenseId) as any);
    }
  }, [isEditMode, licenseId, dispatch]);

  // Handle after successful submission
  useEffect(() => {
    if (isEditMode) {
      if (update_business_license_status === ASYNC_STATUS.SUCCEEDED) {
        dispatch(resetUpdateBusinessLicenseStatus());
        navigation.goBack();
      }
    } else {
      if (add_business_license_status === ASYNC_STATUS.SUCCEEDED) {
        formikRef?.current?.resetForm();
        dispatch(resetAddBusinessLicenseStatus());
        navigation.goBack();
      }
    }
  }, [add_business_license_status, update_business_license_status]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dispatch(resetAddBusinessLicenseStatus());
      dispatch(resetUpdateBusinessLicenseStatus());
    };
  }, [dispatch]);

  const initialValues: FormValues = isEditMode && get_business_license_data
    ? {
      vendorProvider: get_business_license_data.vendorProvider || '',
      product: get_business_license_data.product || '',
      plan: get_business_license_data.plan || '',
      seats: get_business_license_data.seats?.toString() || '',
      renewalDate: get_business_license_data.renewalDate || get_business_license_data.renewaldate || '',
      autoRenew: (get_business_license_data.autoRenew ?? get_business_license_data.autorenew) ? 'true' : 'false',
      cost: (get_business_license_data.cost)?.toString() || '',
      period: get_business_license_data.period || '',
      licenseKey: get_business_license_data.licenseKey || get_business_license_data.licensekey || '',
      notes: get_business_license_data.notes || '',
      username: unlockedCredentials?.username || get_business_license_data.username || '',
      password: unlockedCredentials?.password || get_business_license_data.password || '',
      licenseKind: get_business_license_data.licenseKind || 'software',
      licenseNumber: get_business_license_data.licenseNumber || '',
      states: get_business_license_data.state ? [get_business_license_data.state] : [],
      jurisdiction: get_business_license_data.jurisdiction || '',
      holderName: get_business_license_data.holderName || '',
      status: get_business_license_data.status || '',
      issueDate: get_business_license_data.issueDate || '',
      location: get_business_license_data.location || '',
    }
    : {
      vendorProvider: '',
      product: '',
      plan: '',
      seats: '',
      renewalDate: '',
      autoRenew: '',
      cost: '',
      period: '',
      licenseKey: '',
      notes: '',
      username: '',
      password: '',
      licenseKind: 'software',
      licenseNumber: '',
      states: [],
      jurisdiction: '',
      holderName: '',
      status: 'active',
      issueDate: '',
      location: '',
    };

  const handleSaveCredentials = (credentials: Credentials, setFieldValue: any) => {
    setFieldValue('username', credentials.username);
    setFieldValue('password', credentials.password);
    setCredentialsModalVisible(false);
  };

  const handleSubmitData = (values: FormValues) => {
    if (!selectedBusinessId) {
      console.error('Business ID is not available');
      return;
    }
    const software = isSoftwareLicense(values.licenseKind);

    const basePayload = {
      businessId: selectedBusinessId,
      licenseKind: values.licenseKind || 'software',
      vendorProvider: values.vendorProvider,
      product: values.product,
      plan: values.plan,
      seats: software ? parseInt(values.seats, 10) || 0 : null,
      renewalDate: values.renewalDate || null,
      autoRenew: software ? values.autoRenew === 'true' : false,
      cost: values.cost ? parseFloat(values.cost) || 0 : null,
      period: values.period || null,
      licenseKey: software ? values.licenseKey : '',
      notes: values.notes || '',
      username: software ? values.username || '' : '',
      password: software ? values.password || '' : '',
      ...(software ? {} : {
        licenseNumber: values.licenseNumber || null,
        jurisdiction: values.jurisdiction || null,
        holderName: values.holderName || null,
        status: values.status || null,
        issueDate: values.issueDate || null,
        location: values.location || null,
      }),
    };

    if (isEditMode) {
      dispatch(
        updateBusinessLicenseAsync({
          id: licenseId,
          payload: { ...basePayload, ...(software ? {} : { state: values.states[0] || null }) },
        } as any) as any,
      ).then((a: any) => saveLinksAfter(links, a, licenseId, undefined, recordNotes));
      return;
    }
    // A license held in several states is saved as one license per state (each has its own number and expiration).
    const states = software || values.states.length === 0 ? [null] : values.states;
    states.forEach((state, index) => {
      const payload = { ...basePayload, ...(state ? { state } : {}), ...(ownerUserId ? { ownerUserId } : {}) };
      const action = dispatch(addBusinessLicenseAsync(payload as any) as any);
      if (index === 0) action.then((a: any) => saveLinksAfter(links, a, undefined, undefined, recordNotes));
    });
  };

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <AuthHeader
        title={t('business.add_license.title')}
        subtitle={t('business.add_license.subtitle')}
        onBackPress={() => navigation.goBack()}
        containerStyle={[styles.headerContainerStyle, { paddingTop: isIOS ? 0 : 20 }]}
        subtitleStyle={{ color: themeColors.textSecondary }}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          {
            paddingBottom: isKeyboardVisible ? keyboardHeight - 350 : 0,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            enableReinitialize={true}
            validationSchema={Yup.lazy((v: FormValues) => (isSoftwareLicense(v?.licenseKind)
              ? validationSchema("business_license")
              : Yup.object().shape({
                  vendorProvider: Yup.string().required(t('license_permits.permit.issuingAuthority') + ' *'),
                  product: Yup.string().required(t('license_permits.permit.name') + ' *'),
                })))}
            onSubmit={handleSubmitData}
          >
            {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
              <View style={styles.formContainer}>
                {/* What kind of license (software, or a license / permit the business holds) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('license_permits.kindLabel')}</Text>
                  <CustomDropDown
                    options={LICENSE_KINDS.map(k => ({ label: t(`license_permits.kinds.${k}`), value: k }))}
                    value={values.licenseKind}
                    onSelect={(value: any) => setFieldValue('licenseKind', value)}
                    placeholder={t('business.add_license.select')}
                    containerStyle={styles.dropdownContainer}
                    leftIcon={true}
                    search={false}
                    maxHeight={320}
                  />
                  <Text style={[styles.label, { fontSize: 12, marginTop: 6, color: themeColors.textSecondary }]}>
                    {t(isSoftwareLicense(values.licenseKind) ? 'license_permits.kindHintSoftware' : 'license_permits.kindHintPermit')}
                  </Text>
                </View>

                {/* Vendor Provider / issuing agency */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{isSoftwareLicense(values.licenseKind) ? t('business.add_license.vendor_provider') : t('license_permits.permit.issuingAuthority')} *</Text>
                  <VendorAutocompleteInput category="business_license_vendor"
                    label={''}
                    placeholder={isSoftwareLicense(values.licenseKind) ? t('business.add_license.vendor_placeholder') : t('license_permits.permit.authorityPlaceholder')}
                    value={values.vendorProvider}
                    onChangeText={handleChange('vendorProvider')}
                    containerStyle={styles.inputContainer}
                    error={touched.vendorProvider && errors.vendorProvider ? errors.vendorProvider : ''}
                  />
                </View>

                {/* Product */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{isSoftwareLicense(values.licenseKind) ? t('business.add_license.product') : t('license_permits.permit.name')} *</Text>
                  <CustomInput
                    label={''}
                    placeholder={isSoftwareLicense(values.licenseKind) ? t('business.add_license.product_placeholder') : t('license_permits.permit.namePlaceholder')}
                    value={values.product}
                    onChangeText={handleChange('product')}
                    containerStyle={styles.inputContainer}
                    error={touched.product && errors.product ? errors.product : ''}
                  />
                </View>

{isSoftwareLicense(values.licenseKind) ? (
<>
                {/* Plan & Seats */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>{t('business.add_license.plan')} *</Text>
                    <CustomInput
                      label={''}
                      placeholder={t('business.add_license.plan_placeholder')}
                      value={values.plan}
                      onChangeText={handleChange('plan')}
                      containerStyle={styles.inputContainer}
                      error={touched.plan && errors.plan ? errors.plan : ''}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>{t('business.add_license.seats')} *</Text>
                    <CustomInput
                      label={''}
                      placeholder={t('business.add_license.seats_placeholder')}
                      value={values.seats}
                      onChangeText={handleChange('seats')}
                      keyboardType="numeric"
                      containerStyle={styles.inputContainer}
                      error={touched.seats && errors.seats ? errors.seats : ''}
                    />
                  </View>
                </View>

                {/* Renewal Date & Auto-Renew */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <CustomDateTimePicker
                      label={t('business.add_license.renewal_date')}
                      placeholder={t('business.add_license.select')}
                      value={values.renewalDate}
                      onChange={(date: any) => setFieldValue('renewalDate', date)}
                      mode="date"
                      displayFormat="MM/DD/YYYY"
                      labelStyle={styles.label}
                      suffixIcon={
                        <Image
                          source={ICONS.CALENDER_ICON}
                          style={styles.calendarIcon}
                        />
                      }
                    />
                    {touched.renewalDate && errors.renewalDate && (
                      <Text style={styles.errorText}>{errors.renewalDate}</Text>
                    )}
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>{t('business.add_license.auto_renew')} *</Text>
                    <CustomDropDown
                      options={autoRenewOptions}
                      value={values.autoRenew}
                      onSelect={(value: any) => setFieldValue('autoRenew', value)}
                      placeholder={t('business.add_license.select')}
                      containerStyle={styles.dropdownContainer}
                      leftIcon={true}
                      search={false}
                    />
                    {touched.autoRenew && errors.autoRenew && (
                      <Text style={styles.errorText}>{errors.autoRenew}</Text>
                    )}
                  </View>
                </View>

</>
) : (
<>
                {/* License number & class (licenses and permits) */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>{t('license_permits.permit.licenseNumber')}</Text>
                    <CustomInput label={''} placeholder="ABC-123456" value={values.licenseNumber} onChangeText={handleChange('licenseNumber')} containerStyle={styles.inputContainer} />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>{t('license_permits.permit.classOrType')}</Text>
                    <CustomInput label={''} placeholder={t('license_permits.permit.classPlaceholder')} value={values.plan} onChangeText={handleChange('plan')} containerStyle={styles.inputContainer} />
                  </View>
                </View>

                {/* State(s) & county/city */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{isEditMode ? t('license_permits.permit.state') : t('license_permits.permit.states')}</Text>
                  <CustomDropDown
                    options={US_STATES.map(st => ({ label: st, value: st }))}
                    multiSelect={!isEditMode}
                    selectedItems={values.states}
                    value={values.states[0] ?? ''}
                    onSelect={(value: any) => setFieldValue('states', Array.isArray(value) ? value : value ? [value] : [])}
                    placeholder={t('license_permits.permit.statePlaceholder')}
                    containerStyle={styles.dropdownContainer}
                    leftIcon={true}
                    search={true}
                    maxHeight={320}
                  />
                  {!isEditMode && values.states.length > 1 && (
                    <Text style={[styles.label, { fontSize: 12, marginTop: 6, color: themeColors.primary }]}>
                      {t('license_permits.permit.multiStateHint', { count: values.states.length })}
                    </Text>
                  )}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('license_permits.permit.jurisdiction')}</Text>
                  <CustomInput label={''} placeholder={t('license_permits.permit.jurisdictionPlaceholder')} value={values.jurisdiction} onChangeText={handleChange('jurisdiction')} containerStyle={styles.inputContainer} />
                </View>

                {/* Holder & status */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>{t('license_permits.permit.holder')}</Text>
                    <CustomInput label={''} placeholder={t('license_permits.permit.holderPlaceholder')} value={values.holderName} onChangeText={handleChange('holderName')} containerStyle={styles.inputContainer} />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>{t('license_permits.permit.status')}</Text>
                    <CustomDropDown
                      options={LICENSE_STATUSES.map(st => ({ label: t(`license_permits.statuses.${st}`), value: st }))}
                      value={values.status}
                      onSelect={(value: any) => setFieldValue('status', value)}
                      placeholder={t('business.add_license.select')}
                      containerStyle={styles.dropdownContainer}
                      leftIcon={true}
                      search={false}
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('license_permits.permit.location')}</Text>
                  <CustomInput label={''} placeholder={t('license_permits.permit.locationPlaceholder')} value={values.location} onChangeText={handleChange('location')} containerStyle={styles.inputContainer} />
                </View>

                {/* Issue & expiration dates */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <CustomDateTimePicker
                      label={t('license_permits.permit.issueDate')}
                      placeholder={t('business.add_license.select')}
                      value={values.issueDate}
                      onChange={(date: any) => setFieldValue('issueDate', date)}
                      mode="date"
                      displayFormat="MM/DD/YYYY"
                      labelStyle={styles.label}
                      suffixIcon={<Image source={ICONS.CALENDER_ICON} style={styles.calendarIcon} />}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <CustomDateTimePicker
                      label={t('license_permits.permit.expirationDate')}
                      placeholder={t('business.add_license.select')}
                      value={values.renewalDate}
                      onChange={(date: any) => setFieldValue('renewalDate', date)}
                      mode="date"
                      displayFormat="MM/DD/YYYY"
                      labelStyle={styles.label}
                      suffixIcon={<Image source={ICONS.CALENDER_ICON} style={styles.calendarIcon} />}
                    />
                  </View>
                </View>

</>
)}

                {/* Cost & Period */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>{isSoftwareLicense(values.licenseKind) ? `${t('business.add_license.cost')} *` : t('license_permits.permit.fee')}</Text>
                    <CustomInput
                      label={''}
                      placeholder={t('business.add_license.cost_placeholder')}
                      value={values.cost}
                      onChangeText={handleChange('cost')}
                      keyboardType="decimal-pad"
                      containerStyle={styles.inputContainer}
                      error={touched.cost && errors.cost ? errors.cost : ''}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>{t('business.add_license.period')}{isSoftwareLicense(values.licenseKind) ? ' *' : ''}</Text>
                    <CustomDropDown
                      options={LICENSE_PERIODS.map(p => ({ label: t(`license_permits.period.${p.key}`), value: p.value }))}
                      value={values.period}
                      onSelect={(value: any) => setFieldValue('period', value)}
                      placeholder={t('business.add_license.select')}
                      containerStyle={styles.dropdownContainer}
                      leftIcon={true}
                      search={false}
                    />
                    {touched.period && errors.period && (
                      <Text style={styles.errorText}>{errors.period}</Text>
                    )}
                  </View>
                </View>

{isSoftwareLicense(values.licenseKind) && (
<>
                {/* License Key */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('business.add_license.license_key')} *</Text>
                  <CustomInput
                    label={''}
                    placeholder={t('business.add_license.license_key_placeholder')}
                    value={values.licenseKey}
                    onChangeText={handleChange('licenseKey')}
                    containerStyle={styles.inputContainer}
                    error={touched.licenseKey && errors.licenseKey ? errors.licenseKey : ''}
                  />
                </View>
</>
)}

                {/* Notes */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('business.add_license.notes')}</Text>
                  <CustomInput
                    label={''}
                    placeholder={t('business.add_license.notes_placeholder')}
                    value={values.notes}
                    onChangeText={handleChange('notes')}
                    containerStyle={styles.inputContainer}
                    inputContainerStyle={styles.textArea}
                    multiline
                    numberOfLines={4}
                  />
                </View>

{isSoftwareLicense(values.licenseKind) && (
<>
                {/* Add / Update Credentials Button */}
                <PrimaryButton
                  title={
                    isEditMode && (values.username || values.password)
                      ? t('business.add_license.update_credentials')
                      : t('business.add_license.add_credentials')
                  }
                  onPress={() => setCredentialsModalVisible(true)}
                  buttonStyle={[
                    styles.credentialsButton,
                    {
                      borderColor: themeColors.primary,
                      backgroundColor: getColorWithOpacity(themeColors.primary, 0.2),
                      borderWidth: 1,
                    },
                  ]}
                  textStyle={{ color: themeColors.primary }}
                  variant="outline"
                />

                {/* Display credentials status */}
                {values.username && values.password && (
                  <View style={styles.credentialsStatus}>
                    <Text style={styles.credentialsStatusText}>✓ Credentials Added</Text>
                  </View>
                )}

</>
)}
                <RecordNotesEncryptRow notes={recordNotes} />
                <RecordLinksField links={links} />
                {/* Submit Button */}
                <PrimaryButton
                  title={isEditMode ? t('common.update') : t('business.add_license.add_license')}
                  onPress={() => handleSubmit()}
                  buttonStyle={styles.submitButton}
                  loading={isLoading}
                  disabled={isLoading}
                />
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>

      <AddCredentialsModal
        visible={credentialsModalVisible}
        onClose={() => setCredentialsModalVisible(false)}
        initialUsername={initialValues.username}
        initialPassword={initialValues.password}
        isEditMode={isEditMode}
        onSave={(credentials) => {
          if (formikRef.current) {
            handleSaveCredentials(credentials, formikRef.current.setFieldValue);
          }
        }}
      />
    </ScreenWrapper>
  );
};

export default AddLicense;
