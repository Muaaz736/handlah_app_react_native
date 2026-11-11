import {
  ScrollView,
  Text,
  View,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthHeader,
  CustomInput,
  PrimaryButton,
  CustomDateTimePicker,
  DocumentPicker,
  VendorAutocompleteInput,
} from '../../../../../../components/common';
import { Formik, FormikProps } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { getRealStateInsuranceByIdAsync, updateRealStateInsuranceAsync } from '../../../../../../redux/services/assetsService';
import { setUpdateRealStateInsuranceStatus } from '../../../../../../redux/slices/assetsSlice';
import validationSchema from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import type { InsuranceFormData, EditInsuranceRouteParams, EditInsuranceProps } from './addInsurance.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import FONTS from '../../../../../../utils/fonts';
import { isIOS } from '../../../../../../utils/helpers';
import Feather from 'react-native-vector-icons/Feather';

import { makeEditInsuranceStyles } from './EditInsurance.styles';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const EditInsurance: React.FC<EditInsuranceProps> = () => {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [docIds, setDocIds] = useState<string[]>([]);

  const formikRef = useRef<FormikProps<InsuranceFormData> | null>(null);
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeEditInsuranceStyles(themeColors as RoleTheme), [themeColors]);

  const { insuranceId } = (route?.params as EditInsuranceRouteParams) || {};

  const dispatch = useDispatch<AppDispatch>();
  const {
    update_real_state_insurance_status,
    get_real_state_insurance_by_id_data,
    get_real_state_insurance_by_id_status
  } = useSelector((state: any) => state?.assets_slice);

  const isLoading = update_real_state_insurance_status === ASYNC_STATUS.LOADING;
  const getDataLoading = get_real_state_insurance_by_id_status === ASYNC_STATUS.LOADING;

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

  // Fetch insurance data by ID
  useEffect(() => {
    if (insuranceId) {
      dispatch(getRealStateInsuranceByIdAsync(insuranceId as any));
    }
  }, [insuranceId, dispatch]);

  // Populate form when data is loaded
  useEffect(() => {
    if (get_real_state_insurance_by_id_data?.insurances && insuranceId) {
      const insurance = get_real_state_insurance_by_id_data.insurances.find((ins: any) => ins.id === insuranceId);
      if (insurance && formikRef.current) {
        // Parse dates from ISO strings
        let startDateValue = null;
        if (insurance.startdate) {
          startDateValue = typeof insurance.startdate === 'string' ? new Date(insurance.startdate) : insurance.startdate;
        }

        let renewalDateValue = null;
        if (insurance.renewaldate) {
          renewalDateValue = typeof insurance.renewaldate === 'string' ? new Date(insurance.renewaldate) : insurance.renewaldate;
        }

        let endDateValue = null;
        if (insurance.enddate) {
          endDateValue = typeof insurance.enddate === 'string' ? new Date(insurance.enddate) : insurance.enddate;
        }

        // Restore doc IDs from existing insurance
        if (insurance.uploadattachments) {
          const existing = Array.isArray(insurance.uploadattachments)
            ? insurance.uploadattachments
            : [insurance.uploadattachments as string];
          setDocIds(existing);
        }

        formikRef.current.setValues({
          itemName: insurance.itemname || '',
          insuranceCarrier: insurance.insurancecarrier || '',
          policyNumber: insurance.policynumber || '',
          annualPremium: insurance.annualpremium !== undefined ? String(insurance.annualpremium) : '',
          agentEmail: insurance.agentemail || '',
          startDate: startDateValue,
          renewalDate: renewalDateValue,
          endDate: endDateValue,
          dueDay: insurance.dueday !== undefined ? String(insurance.dueday) : '',
          agent: insurance.agent || '',
          agentPhone: insurance.agentphone || '',
          uploadAttachments: '',
          realEstateId: insurance.realestateid || null,
        });
      }
    }
  }, [get_real_state_insurance_by_id_data, insuranceId]);

  const handleRemoveDocument = () => {
    setDocIds([]);
  };

  const initialValues: InsuranceFormData = {
    itemName: '',
    insuranceCarrier: '',
    policyNumber: '',
    annualPremium: '',
    agentEmail: '',
    startDate: null,
    renewalDate: null,
    endDate: null,
    dueDay: '',
    agent: '',
    agentPhone: '',
    uploadAttachments: '',
    realEstateId: null,
  };

  const handleSubmitData = (values: InsuranceFormData) => {
    // Convert dates to ISO string if they're Date objects, otherwise use as is
    let startDateISO: any = null;
    if (values.startDate) {
      if (values.startDate instanceof Date) {
        startDateISO = values.startDate.toISOString();
      } else if (typeof values.startDate === 'string') {
        startDateISO = values.startDate;
      }
    }

    let renewalDateISO: any = null;
    if (values.renewalDate) {
      if (values.renewalDate instanceof Date) {
        renewalDateISO = values.renewalDate.toISOString();
      } else if (typeof values.renewalDate === 'string') {
        renewalDateISO = values.renewalDate;
      }
    }

    let endDateISO: any = null;
    if (values.endDate) {
      if (values.endDate instanceof Date) {
        endDateISO = values.endDate.toISOString();
      } else if (typeof values.endDate === 'string') {
        endDateISO = values.endDate;
      }
    }

    const payload: any = {
      itemName: values.itemName,
      insuranceCarrier: values.insuranceCarrier,
      policyNumber: values.policyNumber,
      annualPremium: values.annualPremium !== '' ? Number(values.annualPremium) : 0,
      agentEmail: values.agentEmail,
      startDate: startDateISO,
      renewalDate: renewalDateISO,
      endDate: endDateISO,
      dueDay: values.dueDay !== '' ? Number(values.dueDay) : undefined,
      agent: values.agent,
      agentPhone: values.agentPhone,
      uploadAttachments: docIds.length > 0 ? docIds : [],
      realEstateId: values.realEstateId,
    };


    dispatch(updateRealStateInsuranceAsync({ id: insuranceId, data: payload }));
  };

  useEffect(() => {
    if (update_real_state_insurance_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(setUpdateRealStateInsuranceStatus());
      navigation.goBack();
    }
  }, [update_real_state_insurance_status]);

  if (getDataLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader
          title={t('real_estate.edit_insurance')}
          onBackPress={() => navigation.goBack()}
          containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
          backButtonStyle={{ marginBottom: 0 }}
          titleStyle={{
            marginBottom: 0,
            marginTop: 10,
            textAlign: 'left',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader
        title={t('real_estate.edit_insurance')}
        onBackPress={() => navigation.goBack()}
        containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
        backButtonStyle={{ marginBottom: 0 }}
        titleStyle={{
          marginBottom: 0,
          marginTop: 10,
          textAlign: 'left',
        }}
      />
      {/* Tab */}
      <View style={styles.activeTab}>
        <Text style={[styles.activeTabText, { textAlign: 'left' }]}>
          {t('real_estate.insurance')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {
          paddingBottom: isKeyboardVisible
            ? keyboardHeight - 30
            : 0,
        },]}
        showsVerticalScrollIndicator={false}
      >
        {/* Form */}
        <View style={styles.formContainer}>
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={validationSchema('real_state_insurance')}
            onSubmit={handleSubmitData}
            enableReinitialize
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, setFieldTouched, validateForm, touched, errors }) => (
              <>
                {/* Item Name */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('real_estate.item_name')} *
                  </Text>
                  <CustomInput
                    placeholder={t('real_estate.item_name_insurance_placeholder')}
                    value={values.itemName}
                    onChangeText={handleChange('itemName')}
                    onBlur={handleBlur('itemName')}
                    containerStyle={styles.inputContainer}
                    error={touched.itemName && errors.itemName ? String(errors.itemName) : undefined}
                  />
                </View>

                {/* Agent Email */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('real_estate.agent_email')}
                  </Text>
                  <CustomInput
                    placeholder={t('real_estate.agent_email')}
                    value={values.agentEmail}
                    onChangeText={handleChange('agentEmail')}
                    onBlur={handleBlur('agentEmail')}
                    containerStyle={styles.inputContainer}
                    keyboardType="email-address"
                    error={touched.agentEmail && errors.agentEmail ? String(errors.agentEmail) : undefined}
                  />
                </View>

                {/* Insurance Carrier */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('real_estate.insurance_carrier')}
                  </Text>
                  <VendorAutocompleteInput
                    category="insurance_carrier_real_estate"
                    placeholder={t('real_estate.insurance_carrier_placeholder')}
                    value={values.insuranceCarrier}
                    onChangeText={handleChange('insuranceCarrier')}
                    onBlur={handleBlur('insuranceCarrier')}
                    containerStyle={styles.inputContainer}
                    error={touched.insuranceCarrier && errors.insuranceCarrier ? String(errors.insuranceCarrier) : undefined}
                  />
                </View>

                {/* Policy Number */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('real_estate.policy_number')}
                  </Text>
                  <CustomInput
                    placeholder={t('real_estate.policy_number_placeholder')}
                    value={values.policyNumber}
                    onChangeText={handleChange('policyNumber')}
                    onBlur={handleBlur('policyNumber')}
                    containerStyle={styles.inputContainer}
                    error={touched.policyNumber && errors.policyNumber ? String(errors.policyNumber) : undefined}
                  />
                </View>

                {/* Annual Premium */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('real_estate.annual_premium')}
                  </Text>
                  <CustomInput
                    placeholder="0.00"
                    value={values.annualPremium}
                    onChangeText={handleChange('annualPremium')}
                    onBlur={handleBlur('annualPremium')}
                    containerStyle={styles.inputContainer}
                    keyboardType="numeric"
                    error={touched.annualPremium && errors.annualPremium ? String(errors.annualPremium) : undefined}
                  />
                </View>

                {/* Start Date and Renewal Date */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfInput}>
                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {t('real_estate.start_date')}
                    </Text>
                    <CustomDateTimePicker
                      value={values.startDate}
                      onChange={(date: string | Date) => {
                        setFieldValue('startDate', date).then(() => {
                          setFieldTouched('renewalDate', true, false);
                          setFieldTouched('endDate', true, false);
                          validateForm();
                        });
                      }}
                      placeholder={t('real_estate.select_date')}
                      displayFormat="MM/DD/YYYY"
                      containerStyle={styles.inputContainerNoMargin}
                      error={touched.startDate && errors.startDate ? String(errors.startDate) : undefined}
                      suffixIcon={
                        <Feather name="calendar" size={20} color={colors.gray} />
                      }
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {t('real_estate.renewal_date')}
                    </Text>
                    <CustomDateTimePicker
                      value={values.renewalDate}
                      onChange={(date: string | Date) => {
                        setFieldValue('renewalDate', date);
                        setFieldTouched('renewalDate', true);
                      }}
                      placeholder={t('real_estate.select_date')}
                      displayFormat="MM/DD/YYYY"
                      containerStyle={styles.inputContainerNoMargin}
                      error={(touched.renewalDate || !!values.startDate) && errors.renewalDate ? String(errors.renewalDate) : undefined}
                      suffixIcon={
                        <Feather name="calendar" size={20} color={colors.gray} />
                      }
                    />
                  </View>
                </View>

                {/* End Date and Due Day */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfInput}>
                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {t('real_estate.end_date')}
                    </Text>
                    <CustomDateTimePicker
                      value={values.endDate}
                      onChange={(date: string | Date) => {
                        setFieldValue('endDate', date);
                        setFieldTouched('endDate', true);
                      }}
                      placeholder={t('real_estate.select_date')}
                      displayFormat="MM/DD/YYYY"
                      containerStyle={styles.inputContainerNoMargin}
                      error={(touched.endDate || !!values.startDate) && errors.endDate ? String(errors.endDate) : undefined}
                      suffixIcon={
                        <Feather name="calendar" size={20} color={colors.gray} />
                      }
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {t('real_estate.due_day_1_31')}
                    </Text>
                    <CustomInput
                      placeholder={t('common.eg_4_placeholder')}
                      value={values.dueDay}
                      onChangeText={handleChange('dueDay')}
                      onBlur={handleBlur('dueDay')}
                      containerStyle={styles.inputContainerNoMargin}
                      keyboardType="numeric"
                      error={touched.dueDay && errors.dueDay ? String(errors.dueDay) : undefined}
                    />
                  </View>
                </View>

                {/* Agent and Agent Phone */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfInput}>
                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {t('real_estate.agent_optional')}
                    </Text>
                    <CustomInput
                      placeholder={t('real_estate.agent')}
                      value={values.agent}
                      onChangeText={handleChange('agent')}
                      containerStyle={styles.inputContainerNoMargin}
                      error={touched.agent && errors.agent ? String(errors.agent) : undefined}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {t('real_estate.agent_phone_optional')}
                    </Text>
                    <CustomInput
                      placeholder={t('common.agent_hash')}
                      value={values.agentPhone}
                      onChangeText={handleChange('agentPhone')}
                      containerStyle={styles.inputContainerNoMargin}
                      keyboardType="phone-pad"
                      error={touched.agentPhone && errors.agentPhone ? String(errors.agentPhone) : undefined}
                    />
                  </View>
                </View>

                {/* Document Upload */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('real_estate.upload_attachments')}
                  </Text>
                  <DocumentPicker
                    multiple={true}
                    maxDocuments={5}
                    documentIds={docIds}
                    onDocumentIdsChange={(ids) => setDocIds(ids)}
                    uploadType="box"
                    autoUpload={true}
                  />
                </View>

                {/* Update and Skip Buttons */}
                <PrimaryButton
                  title={t('common.update')}
                  onPress={handleSubmit}
                  buttonStyle={styles.updateButton}
                  loading={isLoading}
                />

                <PrimaryButton
                  title={t('common.skip')}
                  onPress={() => navigation.goBack()}
                  variant="outline"
                  buttonStyle={styles.skipButton}
                />
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditInsurance;
