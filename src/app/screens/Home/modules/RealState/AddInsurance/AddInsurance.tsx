import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Keyboard,
  } from 'react-native';
import React, { useState, useRef, useEffect, FC, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthHeader,
  CustomInput,
  PrimaryButton,
  CustomDateTimePicker,
  OfflineChainGuard,
  MixedMediaUploader,
  VendorAutocompleteInput,
} from '../../../../../../components/common';
import { makeAddInsuranceStyles } from './AddInsurance.styles';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import BillingFrequencyField from '../../../../../../components/common/BillingFrequencyField';
import { insuranceFrequency } from '../../../../../../utils/billingFrequency';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import {
  addRealStateInsuranceAsync,
  updateRealStateInsuranceAsync,
} from '../../../../../../redux/services/assetsService';
import {
  setAddRealStateInsuranceStatus,
  setUpdateRealStateInsuranceStatus,
} from '../../../../../../redux/slices/assetsSlice';
import validationSchema from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { isIOS } from '../../../../../../utils/helpers';
import Feather from 'react-native-vector-icons/Feather';
import type {
  InsuranceFormData,
  AddInsuranceRouteParams,
  AddInsuranceProps,
} from './addInsurance.types';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeSharedStyles } from '../RealState.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const AddInsurance: FC<AddInsuranceProps> = ({ route }) => {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const routeParams = (route?.params as AddInsuranceRouteParams) || {};
  const {
    insurance,
    isEdit = false,
    addNew = false,
    realEstateId,
  } = routeParams;
  const ownerUserId = (route?.params as any)?.ownerUserId;
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(
    () => ({
      ...makeSharedStyles(themeColors as RoleTheme),
      ...makeAddInsuranceStyles(themeColors as RoleTheme),
    }),
    [themeColors]
  );
  const isRTL = i18n.language === 'ar';
  const formikRef = useRef<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { selectedBusinessId } = useSelectedBusiness();

  // single insurance entry only
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [docIds, setDocIds] = useState<string[]>([]);

  const {
    add_real_state_insurance_status,
    update_real_state_insurance_status,
    add_real_state_overview_data,
  } = useSelector((state: any) => state?.assets_slice);

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

  const isLoading =
    add_real_state_insurance_status === ASYNC_STATUS.LOADING ||
    update_real_state_insurance_status === ASYNC_STATUS.LOADING;

  const initialValues: InsuranceFormData = {
    itemName: insurance?.itemName ?? (insurance as any)?.itemname ?? '',
    insuranceCarrier:
      insurance?.insuranceCarrier ?? (insurance as any)?.insurancecarrier ?? '',
    policyNumber:
      insurance?.policyNumber ?? (insurance as any)?.policynumber ?? '',
    annualPremium:
      insurance?.annualPremium !== undefined
        ? String(insurance.annualPremium)
        : (insurance as any)?.annualpremium
          ? String((insurance as any).annualpremium)
          : '',
    agentEmail: insurance?.agentEmail ?? (insurance as any)?.agentemail ?? '',
    startDate: insurance?.startDate
      ? new Date(insurance.startDate)
      : (insurance as any)?.startdate
        ? new Date((insurance as any).startdate)
        : null,
    renewalDate: insurance?.renewalDate
      ? new Date(insurance.renewalDate)
      : (insurance as any)?.renewaldate
        ? new Date((insurance as any).renewaldate)
        : null,
    endDate: insurance?.endDate
      ? new Date(insurance.endDate)
      : (insurance as any)?.enddate
        ? new Date((insurance as any).enddate)
        : null,
    dueDay:
      insurance?.dueDay !== undefined
        ? String(insurance.dueDay)
        : (insurance as any)?.dueday
          ? String((insurance as any).dueday)
          : '',
    agent: insurance?.agent || '',
    agentPhone: insurance?.agentPhone ?? (insurance as any)?.agentphone ?? '',
    uploadAttachments:
      insurance?.uploadAttachments ??
      (insurance as any)?.uploadattachments ??
      '',
    realEstateId:
      realEstateId ??
      (insurance as any)?.realestateid ??
      add_real_state_overview_data?.id ??
      null,
    isPaidAnnually: insurance?.isPaidAnnually ?? (insurance as any)?.ispaidannually ?? false,
    billingFrequency: insuranceFrequency(insurance),
  };

  const handleRemoveDocument = () => {
    setDocIds([]);
  };

  const handleSubmitData = (values: any) => {
    let startDateISO = null;
    if (values.startDate) {
      if (values.startDate instanceof Date)
        startDateISO = values.startDate.toISOString();
      else if (typeof values.startDate === 'string')
        startDateISO = values.startDate;
    }
    let renewalDateISO = null;
    if (values.renewalDate) {
      if (values.renewalDate instanceof Date)
        renewalDateISO = values.renewalDate.toISOString();
      else if (typeof values.renewalDate === 'string')
        renewalDateISO = values.renewalDate;
    }
    let endDateISO = null;
    if (values.endDate) {
      if (values.endDate instanceof Date)
        endDateISO = values.endDate.toISOString();
      else if (typeof values.endDate === 'string') endDateISO = values.endDate;
    }

    const resolvedRealEstateId =
      values.realEstateId ||
      realEstateId ||
      (insurance as any)?.realestateid ||
      add_real_state_overview_data?.id ||
      null;

    const payload: any = {
      itemName: values.itemName,
      insuranceCarrier: values.insuranceCarrier,
      policyNumber: values.policyNumber,
      annualPremium:
        values.annualPremium !== '' ? Number(values.annualPremium) : 0,
      agentEmail: values.agentEmail,
      startDate: startDateISO,
      renewalDate: renewalDateISO,
      endDate: endDateISO,
      agent: values.agent,
      agentPhone: values.agentPhone,
      uploadAttachments: docIds.length > 0 ? docIds : [],
      realEstateId: resolvedRealEstateId,
      isPaidAnnually: values.isPaidAnnually || false,
        billingFrequency: values.billingFrequency || undefined,
    };

    // Only include dueDay if not paid annually and a value was entered
    if (!values.isPaidAnnually && values.dueDay !== '') {
      payload.dueDay = Number(values.dueDay);
    }

    if (isBusinessRole()) {
      payload.businessId = selectedBusinessId;
    }

    if (isEdit && insurance?.id) {
      dispatch(
        updateRealStateInsuranceAsync({
          id: insurance.id,
          data: payload,
        } as any),
      );
    } else {
      dispatch(
        addRealStateInsuranceAsync({
          insurances: [{ ...payload, ...(ownerUserId ? { ownerUserId } : {}) }],
        } as any),
      );
    }
  };

  const handleSkip = (): void => {
    navigation.navigate('AddWarranties', { realEstateId: realEstateId });
  };

  useEffect(() => {
    if (insurance && formikRef.current) {
      const uploadUrl =
        (insurance as any).uploadattachments ||
        (insurance as any).uploadAttachments;
      if (uploadUrl) {
        const existing = Array.isArray(uploadUrl)
          ? uploadUrl
          : [uploadUrl as string];
        setDocIds(existing);
      }

      formikRef.current.setValues({
        ...initialValues,
        uploadAttachments: '',
        // override realEstateId in case the overview data has arrived
        realEstateId: realEstateId || add_real_state_overview_data?.id,
      });
    }
  }, [insurance, add_real_state_overview_data]);

  useEffect(() => {
    if (
      add_real_state_insurance_status === ASYNC_STATUS.SUCCEEDED ||
      update_real_state_insurance_status === ASYNC_STATUS.SUCCEEDED
    ) {
      if (add_real_state_insurance_status === ASYNC_STATUS.SUCCEEDED) {
        dispatch(setAddRealStateInsuranceStatus());
      }
      if (update_real_state_insurance_status === ASYNC_STATUS.SUCCEEDED) {
        dispatch(setUpdateRealStateInsuranceStatus());
      }

      if (isEdit || addNew) {
        navigation.goBack();
      } else {
        navigation.navigate('AddWarranties', { realEstateId: realEstateId });
      }
      setDocIds([]);
    }
  }, [add_real_state_insurance_status, update_real_state_insurance_status]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <AuthHeader
            title={
              isEdit
                ? t('real_estate.edit_insurance')
                : t('real_estate.your_property')
            }
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
              textAlign: isRTL ? 'right' : 'left',
            }}
            backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
          />
          {!isEdit && !addNew && (
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
            <Text
              style={[
                styles.activeTabText,
                { textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('real_estate.insurance')}
            </Text>
          </View>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: isKeyboardVisible ? keyboardHeight - 30 : 0,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* single entry only – no summary list */}

          {/* Form */}
          <View style={styles.formContainer}>
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              enableReinitialize={true}
              validationSchema={validationSchema('real_state_insurance')}
              onSubmit={handleSubmitData}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                setFieldValue,
                setFieldTouched,
                validateForm,
                touched,
                errors,
              }) => (
                <>
                  {/* Item name */}
                  <View style={styles.inputGroup}>
                    <Text
                      style={[
                        styles.label,
                        { textAlign: isRTL ? 'right' : 'left' },
                      ]}
                    >
                      {t('real_estate.item_name')} *
                    </Text>
                    <CustomInput
                      placeholder={t(
                        'real_estate.item_name_insurance_placeholder',
                      )}
                      value={values.itemName}
                      onChangeText={handleChange('itemName')}
                      onBlur={handleBlur('itemName')}
                      containerStyle={styles.inputContainer}
                      error={
                        touched.itemName && errors.itemName
                          ? String(errors.itemName)
                          : undefined
                      }
                    />
                  </View>

                  {/* Insurance carrier */}
                  <View style={styles.inputGroup}>
                    <Text
                      style={[
                        styles.label,
                        { textAlign: isRTL ? 'right' : 'left' },
                      ]}
                    >
                      {t('real_estate.insurance_carrier')}
                    </Text>
                    <VendorAutocompleteInput
                      category="insurance_carrier_real_estate"
                      placeholder={t(
                        'real_estate.insurance_carrier_placeholder',
                      )}
                      value={values.insuranceCarrier}
                      onChangeText={handleChange('insuranceCarrier')}
                      onBlur={handleBlur('insuranceCarrier')}
                      containerStyle={styles.inputContainer}
                      error={
                        touched.insuranceCarrier && errors.insuranceCarrier
                          ? String(errors.insuranceCarrier)
                          : undefined
                      }
                    />
                  </View>

                  {/* Policy # */}
                  <View style={styles.inputGroup}>
                    <Text
                      style={[
                        styles.label,
                        { textAlign: isRTL ? 'right' : 'left' },
                      ]}
                    >
                      {t('real_estate.policy_number')}
                    </Text>
                    <CustomInput
                      placeholder={t('real_estate.policy_number_placeholder')}
                      value={values.policyNumber}
                      onChangeText={handleChange('policyNumber')}
                      onBlur={handleBlur('policyNumber')}
                      containerStyle={styles.inputContainer}
                      error={
                        touched.policyNumber && errors.policyNumber
                          ? String(errors.policyNumber)
                          : undefined
                      }
                    />
                  </View>

                  {/* Annual premium */}
                  <View style={styles.inputGroup}>
                    <Text
                      style={[
                        styles.label,
                        { textAlign: isRTL ? 'right' : 'left' },
                      ]}
                    >
                      {t('real_estate.annual_premium')}
                    </Text>
                    <CustomInput
                      placeholder="0.00"
                      value={values.annualPremium}
                      onChangeText={handleChange('annualPremium')}
                      onBlur={handleBlur('annualPremium')}
                      containerStyle={styles.inputContainer}
                      error={
                        touched.annualPremium && errors.annualPremium
                          ? String(errors.annualPremium)
                          : undefined
                      }
                    />
                  </View>

                  {/* Billing frequency (as on the website); "Annually" also sets the older Paid Annually flag. */}
                  <BillingFrequencyField
                    value={values.billingFrequency}
                    onChange={(v) => {
                      setFieldValue('billingFrequency', v);
                      setFieldValue('isPaidAnnually', v === 'annually');
                      if (v === 'annually') setFieldValue('dueDay', '');
                    }}
                  />

                  {/* Start Date and Renewal Date */}
                  <View
                    style={[
                      styles.rowContainer,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View style={styles.halfInput}>
                      <Text
                        style={[
                          styles.label,
                          { textAlign: isRTL ? 'right' : 'left' },
                        ]}
                      >
                        {t('real_estate.start_date')}
                      </Text>
                      <CustomDateTimePicker
                        placeholder={t('real_estate.select')}
                        value={values.startDate}
                        onChange={date => {
                          setFieldValue('startDate', date as Date).then(() => {
                            setFieldTouched('renewalDate', true, false);
                            setFieldTouched('endDate', true, false);
                            validateForm();
                          });
                        }}
                        mode="date"
                        displayFormat="MM/DD/YYYY"
                        labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                        containerStyle={{ flex: 1, width: 'auto' }}
                        inputContainerStyle={{ borderRadius: 12 }}
                        suffixIcon={
                          <Feather
                            name="calendar"
                            size={20}
                            color={colors.gray}
                          />
                        }
                        error={
                          touched.startDate && errors.startDate
                            ? String(errors.startDate)
                            : undefined
                        }
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text
                        style={[
                          styles.label,
                          { textAlign: isRTL ? 'right' : 'left' },
                        ]}
                      >
                        {t('real_estate.renewal_date')}
                      </Text>
                      <CustomDateTimePicker
                        placeholder={t('real_estate.select')}
                        value={values.renewalDate}
                        onChange={date => {
                          setFieldValue('renewalDate', date as Date);
                          setFieldTouched('renewalDate', true);
                        }}
                        mode="date"
                        displayFormat="MM/DD/YYYY"
                        labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                        containerStyle={{ flex: 1, width: 'auto' }}
                        inputContainerStyle={{ borderRadius: 12 }}
                        suffixIcon={
                          <Feather
                            name="calendar"
                            size={20}
                            color={colors.gray}
                          />
                        }
                        error={
                          (touched.renewalDate || !!values.startDate) &&
                            errors.renewalDate
                            ? String(errors.renewalDate)
                            : undefined
                        }
                      />
                    </View>
                  </View>

                  {/* End Date and Due Day */}
                  <View
                    style={[
                      styles.rowContainer,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View style={styles.halfInput}>
                      <Text
                        style={[
                          styles.label,
                          { textAlign: isRTL ? 'right' : 'left' },
                        ]}
                      >
                        {t('real_estate.end_date')}
                      </Text>
                      <CustomDateTimePicker
                        placeholder={t('real_estate.select')}
                        value={values.endDate}
                        onChange={date => {
                          setFieldValue('endDate', date as Date);
                          setFieldTouched('endDate', true);
                        }}
                        mode="date"
                        displayFormat="MM/DD/YYYY"
                        labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                        containerStyle={{ flex: 1, width: 'auto' }}
                        inputContainerStyle={{ borderRadius: 12 }}
                        suffixIcon={
                          <Feather
                            name="calendar"
                            size={20}
                            color={colors.gray}
                          />
                        }
                        error={
                          (touched.endDate || !!values.startDate) &&
                            errors.endDate
                            ? String(errors.endDate)
                            : undefined
                        }
                      />
                    </View>
                    {!values.isPaidAnnually && (
                      <View style={styles.halfInput}>
                        <Text
                          style={[
                            styles.label,
                            { textAlign: isRTL ? 'right' : 'left' },
                          ]}
                        >
                          {t('real_estate.due_day_1_31')}
                        </Text>
                        <CustomInput
                          placeholder={t('common.eg_4_placeholder')}
                          value={values.dueDay}
                          onChangeText={handleChange('dueDay')}
                          onBlur={handleBlur('dueDay')}
                          containerStyle={styles.inputContainerNoMargin}
                          keyboardType="numeric"
                          labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                          inputStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                          error={
                            touched.dueDay && errors.dueDay
                              ? String(errors.dueDay)
                              : undefined
                          }
                        />
                      </View>
                    )}
                  </View>

                  {/* Agent Email */}
                  <View style={styles.inputGroup}>
                    <Text
                      style={[
                        styles.label,
                        { textAlign: isRTL ? 'right' : 'left' },
                      ]}
                    >
                      {t('real_estate.agent_email')}
                    </Text>
                    <CustomInput
                      placeholder={t('real_estate.agent_email')}
                      value={values.agentEmail}
                      onChangeText={handleChange('agentEmail')}
                      onBlur={handleBlur('agentEmail')}
                      containerStyle={styles.inputContainer}
                      keyboardType="email-address"
                      error={
                        touched.agentEmail && errors.agentEmail
                          ? String(errors.agentEmail)
                          : undefined
                      }
                    />
                  </View>

                  {/* Agent and Agent phone */}
                  <View
                    style={[
                      styles.rowContainer,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View style={styles.halfInput}>
                      <Text
                        style={[
                          styles.label,
                          { textAlign: isRTL ? 'right' : 'left' },
                        ]}
                      >
                        {t('real_estate.agent_optional')}
                      </Text>
                      <CustomInput
                        placeholder={t('real_estate.agent')}
                        value={values.agent}
                        onChangeText={handleChange('agent')}
                        containerStyle={styles.inputContainerNoMargin}
                        labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                        inputStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                        error={
                          touched.agent && errors.agent
                            ? String(errors.agent)
                            : undefined
                        }
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text
                        style={[
                          styles.label,
                          { textAlign: isRTL ? 'right' : 'left' },
                        ]}
                      >
                        {t('real_estate.agent_phone_optional')}
                      </Text>
                      <CustomInput
                        placeholder={t('common.agent_hash')}
                        value={values.agentPhone}
                        onChangeText={handleChange('agentPhone')}
                        containerStyle={styles.inputContainerNoMargin}
                        keyboardType="phone-pad"
                        labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                        inputStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                        error={
                          touched.agentPhone && errors.agentPhone
                            ? String(errors.agentPhone)
                            : undefined
                        }
                      />
                    </View>
                  </View>

                  {/* Upload Attachments */}
                  <View style={styles.inputGroup}>
                    <MixedMediaUploader
                      mediaIds={docIds}
                      onMediaChange={(ids: any) => setDocIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                      placeholder={t('real_estate.upload')}
                      label={t('legal.upload_document')}
                      uploadType="box"
                      maxItems={5}
                      removable={true}
                      autoUpload={true}
                    />
                  </View>

                  {/* Submit + continue */}
                  <OfflineChainGuard isWizardMode={!isEdit && !addNew}>
                    <PrimaryButton
                      title={
                        isEdit
                          ? t('common.update')
                          : addNew
                            ? t('common.add')
                            : t('common.continue')
                      }
                      onPress={() => handleSubmit()}
                      loading={isLoading}
                      buttonStyle={[
                        styles.continueButton,
                        { backgroundColor: themeColors.primary },
                      ]}
                      disabled={isLoading}
                    />
                  </OfflineChainGuard>
                </>
              )}
            </Formik>
          </View>
        </ScrollView>
      </SafeAreaView >
    </View >
  );
};

export default AddInsurance;
