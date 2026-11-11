import { ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../components/notes/RecordNotesField';
import { RECORD_NOTES_BUSINESS } from '../../../../../services/recordNotes';
import { createdRecordId } from '../../../../../services/recordLinks';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  AddBusinessDetailsNavigationProp,
  BusinessDetailsFormData,
  BusinessDetailsParams,
  EntityType,
} from './AddBusinessDetails.types';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { useUserRole } from '../../../../../hooks/useUserRole';
import {
  AuthHeader,
  CustomInput,
  CustomDropDown,
  PrimaryButton,
  showErrorToast,
} from '../../../../../components/common';
import {
  createBusinessAsync,
  updateBusinessAsync,
} from '../../../../../redux/services/businessService';
import {
  resetCreateBusinessStatus,
  resetUpdateBusinessStatus,
} from '../../../../../redux/slices/businessSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { makeAddBusinessDetailsStyles } from './AddBusinessDetails.styles';
import { getDropdownOptionsAsync, countriesAsync, statesAsync } from '../../../../../redux/services/authService';
import { findDefaultCountry } from '../../../../../utils/helpers';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const AddBusinessDetails: React.FC = () => {
  const navigation = useNavigation<AddBusinessDetailsNavigationProp>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAddBusinessDetailsStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const { create_business_status, update_business_status } = useSelector(
    (state: any) => state.business_slice,
  );

  // Get route params for edit mode
  const { businessDetails, businessId, isEdit } = (route?.params as any) || {};
  // Business profile notes, with the "Encrypt notes" choice; saved after the profile.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_NOTES_BUSINESS, recordId: isEdit && businessId ? Number(businessId) : null });

  const formikRef = useRef<FormikProps<BusinessDetailsFormData>>(null);

  // Formik initial values
  const initialValues: BusinessDetailsFormData = {
    businessName: businessDetails?.businessName || '',
    description: businessDetails?.description || '',
    ein: businessDetails?.ein || '',
    country: businessDetails?.country != null && businessDetails?.country !== ''
      ? String(businessDetails.country) : (businessDetails?.countryname || ''),
    stateOfFormation: businessDetails?.stateOfFormation != null && businessDetails?.stateOfFormation !== ''
      ? String(businessDetails.stateOfFormation) : (businessDetails?.statelabel || ''),
    entityType: businessDetails?.entityType || '',
    registeredAgentName: businessDetails?.registeredAgentName || '',
    registeredAgentAddress: businessDetails?.registeredAgentAddress || '',
    registeredAgentPhone: businessDetails?.registeredAgentPhone || '',
    principalBusinessAddress: businessDetails?.principalBusinessAddress || '',
  };

  // Validation schema
  const validationSchema = Yup.object().shape({
    businessName: Yup.string().required('Business name is required'),
    description: Yup.string().optional(),
    ein: Yup.string().optional(),
    country: Yup.string().optional(),
    stateOfFormation: Yup.string().optional(),
    entityType: Yup.string().optional(),
    registeredAgentName: Yup.string().optional(),
    registeredAgentAddress: Yup.string().optional(),
    registeredAgentPhone: Yup.string().optional(),
    principalBusinessAddress: Yup.string().optional(),
  });

  // Loading state
  const isLoading =
    create_business_status === ASYNC_STATUS.LOADING ||
    update_business_status === ASYNC_STATUS.LOADING;

  // Handle success for both create and update
  useEffect(() => {
    if (
      create_business_status === ASYNC_STATUS.SUCCEEDED ||
      update_business_status === ASYNC_STATUS.SUCCEEDED
    ) {
      formikRef.current?.resetForm();
      if (isEdit) {
        dispatch(resetUpdateBusinessStatus());
      } else {
        dispatch(resetCreateBusinessStatus());
      }
      navigation.goBack();
    }
  }, [
    create_business_status,
    update_business_status,
    isEdit,
    dispatch,
    navigation,
  ]);

  const { get_dropdown_options_data, countries_data, states_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('BusinessEntityType'));
    dispatch(countriesAsync());
  }, [dispatch]));

  useEffect(() => {
    const existingCountryId = businessDetails?.country?.toString();
    if (existingCountryId) {
      dispatch(statesAsync(existingCountryId as any));
    }
  }, [dispatch, businessDetails?.country]);

  useEffect(() => {
    if (countries_data && countries_data.length > 0) {
      const currentVal = formikRef.current?.values.country;
      if (currentVal) {
        const matchedById = countries_data.find((c: any) => c.id.toString() === currentVal);
        if (!matchedById) {
          const matchedByName = countries_data.find((c: any) => c.countryname === currentVal);
          if (matchedByName) {
            formikRef.current?.setFieldValue('country', matchedByName.id.toString());
            dispatch(statesAsync(matchedByName.id.toString() as any));
          }
        }
      }
    }
  }, [countries_data, dispatch]);

  useEffect(() => {
    if (countries_data && countries_data.length > 0 && !formikRef.current?.values.country) {
      const usCountry = findDefaultCountry(countries_data);
      if (usCountry) {
        formikRef.current?.setFieldValue('country', usCountry.id.toString());
        dispatch(statesAsync(usCountry.id.toString() as any));
      }
    }
  }, [countries_data, dispatch]);

  useEffect(() => {
    if (states_data && states_data.length > 0) {
      const currentVal = formikRef.current?.values.stateOfFormation;
      if (currentVal) {
        const matchedById = states_data.find((s: any) => s.id.toString() === currentVal);
        if (!matchedById) {
          const matchedByName = states_data.find((s: any) => (s.description || s.statelabel) === currentVal);
          if (matchedByName) {
            formikRef.current?.setFieldValue('stateOfFormation', matchedByName.id.toString());
          }
        }
      }
    }
  }, [states_data]);

  const handleSubmit = (values: BusinessDetailsFormData): void => {
    try {
      if (!values.businessName?.trim()) {
        showErrorToast('Business name is required');
        return;
      }

      const payload = {
        businessName: values.businessName.trim(),
        description: values.description?.trim() || '',
        ein: values.ein?.trim() || '',
        country: values.country || '',
        stateOfFormation: values.stateOfFormation || '',
        entityType: values.entityType || '',
        registeredAgentName: values.registeredAgentName?.trim() || '',
        registeredAgentAddress: values.registeredAgentAddress?.trim() || '',
        registeredAgentPhone: values.registeredAgentPhone?.trim() || '',
        principalBusinessAddress: values.principalBusinessAddress?.trim() || '',
      };

      if (isEdit && businessId) {
        dispatch(updateBusinessAsync({ id: businessId, data: payload })).then((a: any) => {
          if (a?.meta?.requestStatus === 'fulfilled') void recordNotes.saveOrWarn(Number(businessId));
        });
      } else {
        dispatch(createBusinessAsync(payload)).then((a: any) => {
          if (a?.meta?.requestStatus === 'fulfilled') void recordNotes.saveOrWarn(createdRecordId(a.payload));
        });
      }
    } catch (error) {
      console.error('Error submitting business:', error);
      showErrorToast('Failed to submit business. Please try again.');
    }
  };

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <View style={styles.headerMain}>
        <AuthHeader
          title={
            isEdit
              ? t('business.add_business_details.edit_title')
              : t('business.add_business_details.title')
          }
          titleStyle={{
            marginBottom: 0,
            marginTop: 8,
            textAlign: 'left',
          }}
          subtitle={t('business.add_business_details.subtitle')}
          onBackPress={() => navigation.goBack()}
          containerStyle={styles.headerContainerStyle}
        />
      </View>

      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit: formikSubmit,
          setFieldValue,
        }) => (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              {/* Business Name */}
              <View style={styles.inputGroup}>
                <CustomInput
                  label={t('business.add_business_details.business_name')}
                  placeholder={t(
                    'business.add_business_details.business_name_placeholder',
                  )}
                  value={values.businessName}
                  onChangeText={handleChange('businessName')}
                  onBlur={handleBlur('businessName')}
                  error={
                    touched.businessName && errors.businessName
                      ? errors.businessName
                      : undefined
                  }
                  containerStyle={styles.inputContainer}
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <CustomInput
                  label={t('business.add_business_details.description')}
                  placeholder={t(
                    'business.add_business_details.description_placeholder',
                  )}
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  containerStyle={styles.inputContainer}
                  inputContainerStyle={styles.textArea}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Row 1: EIN & Entity Type */}
              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <CustomInput
                    label={t('business.add_business_details.ein')}
                    placeholder={t(
                      'business.add_business_details.ein_placeholder',
                    )}
                    value={values.ein}
                    onChangeText={handleChange('ein')}
                    onBlur={handleBlur('ein')}
                    containerStyle={styles.inputContainer}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>
                    {t('business.add_business_details.entity_type')}
                  </Text>
                  <CustomDropDown
                    placeholder={t(
                      'business.add_business_details.entity_type_placeholder',
                    )}
                    value={values.entityType}
                    onSelect={(value: any) =>
                      setFieldValue('entityType', value)
                    }
                    options={get_dropdown_options_data}
                    containerStyle={styles.dropdownContainer}
                    leftIcon={true}
                  />
                </View>
              </View>

              {/* Country of Formation */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t('business.add_business_details.country')}
                </Text>
                <CustomDropDown
                  placeholder={t(
                    'business.add_business_details.country_placeholder',
                  )}
                  value={values.country}
                  onSelect={(val: any) => {
                    setFieldValue('country', val as string);
                    setFieldValue('stateOfFormation', '');
                    if (val) dispatch(statesAsync(val));
                  }}
                  options={(() => {
                    const mappedOptions =
                      countries_data?.map((country: any) => ({
                        label: country.countryname,
                        value: country.id.toString(),
                      })) || [];
                    
                    const fallbackVal = (businessDetails?.country != null && businessDetails?.country !== '') ? String(businessDetails.country) : businessDetails?.countryname;
                    if (fallbackVal && businessDetails?.countryname) {
                      const hasOption = mappedOptions.some(
                        (o: any) =>
                          o.value === fallbackVal || o.label === businessDetails.countryname
                      );
                      if (!hasOption) {
                        mappedOptions.unshift({
                          label: businessDetails.countryname,
                          value: fallbackVal,
                        });
                      }
                    }
                    return mappedOptions;
                  })()}
                  containerStyle={styles.dropdownContainer}
                  leftIcon={true}
                  search={true}
                  searchPlaceholder={t('common.search_country')}
                  maxHeight={300}
                />
              </View>

              {/* State of Formation */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t('business.add_business_details.state_of_formation')}
                </Text>
                <CustomDropDown
                  placeholder={t(
                    'business.add_business_details.state_of_formation_placeholder',
                  )}
                  value={values.stateOfFormation}
                  onSelect={(value: any) =>
                    setFieldValue('stateOfFormation', value)
                  }
                  options={(() => {
                    const mappedOptions =
                      states_data?.map((stateItem: any) => ({
                        label: stateItem.description || stateItem.statelabel,
                        value: stateItem.id.toString(),
                      })) || [];

                    const fallbackStateVal = (businessDetails?.stateOfFormation != null && businessDetails?.stateOfFormation !== '') ? String(businessDetails.stateOfFormation) : businessDetails?.statelabel;
                    if (fallbackStateVal && businessDetails?.statelabel) {
                      const hasOption = mappedOptions.some(
                        (o: any) =>
                          o.value === fallbackStateVal || o.label === businessDetails.statelabel
                      );
                      if (!hasOption) {
                        mappedOptions.unshift({
                          label: businessDetails.statelabel,
                          value: fallbackStateVal,
                        });
                      }
                    }
                    return mappedOptions;
                  })()}
                  containerStyle={styles.dropdownContainer}
                  leftIcon={true}
                  search={true}
                  searchPlaceholder={t('common.search_state')}
                  maxHeight={300}
                />
              </View>

              {/* Registered Agent Name */}
              <View style={styles.inputGroup}>
                <CustomInput
                  label={t(
                    'business.add_business_details.registered_agent_name',
                  )}
                  placeholder={t(
                    'business.add_business_details.registered_agent_name_placeholder',
                  )}
                  value={values.registeredAgentName}
                  onChangeText={handleChange('registeredAgentName')}
                  onBlur={handleBlur('registeredAgentName')}
                  containerStyle={styles.inputContainer}
                />
              </View>

              {/* Registered Agent Address */}
              <View style={styles.inputGroup}>
                <CustomInput
                  label={t(
                    'business.add_business_details.registered_agent_address',
                  )}
                  placeholder={t(
                    'business.add_business_details.registered_agent_address_placeholder',
                  )}
                  value={values.registeredAgentAddress}
                  onChangeText={handleChange('registeredAgentAddress')}
                  onBlur={handleBlur('registeredAgentAddress')}
                  containerStyle={styles.inputContainer}
                  inputContainerStyle={styles.textArea}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Registered Agent Phone */}
              <View style={styles.inputGroup}>
                <CustomInput
                  label={t(
                    'business.add_business_details.registered_agent_phone',
                  )}
                  placeholder={t(
                    'business.add_business_details.registered_agent_phone_placeholder',
                  )}
                  value={values.registeredAgentPhone}
                  onChangeText={handleChange('registeredAgentPhone')}
                  onBlur={handleBlur('registeredAgentPhone')}
                  keyboardType="phone-pad"
                  containerStyle={styles.inputContainer}
                />
              </View>

              {/* Principal Business Address */}
              <View style={styles.inputGroup}>
                <CustomInput
                  label={t(
                    'business.add_business_details.principal_business_address',
                  )}
                  placeholder={t(
                    'business.add_business_details.principal_business_address_placeholder',
                  )}
                  value={values.principalBusinessAddress}
                  onChangeText={handleChange('principalBusinessAddress')}
                  onBlur={handleBlur('principalBusinessAddress')}
                  containerStyle={styles.inputContainer}
                  inputContainerStyle={styles.textArea}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <RecordNotesField notes={recordNotes} />

              {/* Submit Button */}
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title={
                    isEdit
                      ? t('business.add_business_details.save_changes')
                      : t('business.add_business_details.add_account')
                  }
                  onPress={formikSubmit}
                  buttonStyle={[
                    styles.addButton,
                    { backgroundColor: themeColors.primary },
                  ]}
                  textStyle={styles.addButtonText}
                  loading={isLoading}
                  disabled={isLoading}
                />
              </View>
            </View>
          </ScrollView>
        )}
      </Formik>
    </ScreenWrapper>
  );
};

export default AddBusinessDetails;
