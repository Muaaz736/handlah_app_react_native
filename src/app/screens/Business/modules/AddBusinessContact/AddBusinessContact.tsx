import {
  ScrollView, Text, View, Switch, ActivityIndicator,
} from 'react-native';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../components/notes/RecordNotesField';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, FormikProps } from 'formik';
import { validationSchema } from '../../../../../utils/validationSchemas';
import {
  AddBusinessContactNavigationProp,
  FormData,
  ContactParams,
  StatusType,
  PrimaryType,
  ContactTypeValue,
} from './AddBusinessContact.types';
import { addBusinessContactAsync, updateBusinessContactAsync } from '../../../../../redux/services/businessContactsService';
import { resetAddBusinessContactStatus, resetUpdateBusinessContactStatus } from '../../../../../redux/slices/businessContactsSlice';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { ASYNC_STATUS } from '../../../../../config/constants';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { useUserRole } from '../../../../../hooks/useUserRole';
import colors from '../../../../../utils/colors';
import {
  AuthHeader,
  CustomInput,
  CustomDropDown,
  PrimaryButton,
  VendorAutocompleteInput,
} from '../../../../../components/common';
import { makeAddBusinessContactStyles } from './AddBusinessContact.styles';
import { getBusinessContactTypesAsync, getDropdownOptionsAsync } from '../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../constants/recordLinkModules';

const AddBusinessContact: React.FC = () => {
  const navigation = useNavigation<AddBusinessContactNavigationProp>();
  const route = useRoute<any>();
  const { t, i18n } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAddBusinessContactStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();
  const { selectedBusinessId } = useSelectedBusiness();

  // Get route params for edit mode
  const { contact, isEdit, ownerUserId } = (route?.params as any) || {};
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.BusinessContact,
      recordId: isEdit && contact?.id ? Number(contact.id) : null,
      businessId: selectedBusinessId ?? null,
      enabled: !ownerUserId,
  });
  // Notes' "Encrypt notes" choice; saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.BusinessContact, recordId: isEdit && contact?.id ? Number(contact.id) : null, enabled: links.enabled });

  // Redux state - single selector for better performance
  const businessContactsState = useSelector((state: any) => state.business_contacts_slice);

  // Memoized derived state
  const { addStatus, updateStatus } = useMemo(
    () => ({
      addStatus: businessContactsState?.add_business_contact_status,
      updateStatus: businessContactsState?.update_business_contact_status,
    }),
    [businessContactsState]
  );

  // Formik ref
  const formikRef = useRef<FormikProps<FormData>>(null);

  // Map contact type to API number
  const getContactTypeNumber = (type: ContactTypeValue): number => {
    const typeMap: Record<string, number> = {
      'client': 1,
      'vendor': 2,
      'partner': 3,
      'employee': 4,
    };
    return typeMap[type] || 1;
  };

  // Reverse: map API number back to form string value (for edit mode)
  const getContactTypeString = (type: number): ContactTypeValue => {
    const reverseMap: Record<number, ContactTypeValue> = {
      1: 'client',
      2: 'vendor',
      3: 'partner',
      4: 'employee',
    };
    return reverseMap[type] || '';
  };

  // Initial values from contact or empty
  const initialValues: FormData = {
    fullName: (contact as any)?.fullName || contact?.fullName || '',
    role: (contact as any)?.role || '',
    companyTeam: (contact as any)?.companyTeam || '',
    status: (contact as any)?.status || '',
    emailAddress: (contact as any)?.emailAddress || '',
    phoneNumber: (contact as any)?.phoneNumber || '',
    manager: (contact as any)?.manager || '',
    location: (contact as any)?.location || '',
    tags: (contact as any)?.tags || '',
    // B-027: isPrimary is boolean on APIBusinessContactItem; map to 'yes'|'no'
    primary: (contact as any)?.isPrimary === true
      ? 'yes'
      : (contact as any)?.isPrimary === false
        ? 'no'
        : (contact?.primary || ''),
    // B-028: contactType is a number on APIBusinessContactItem; reverse-map to string
    contactType: String(contact?.contactType) || '',
    reference: (contact as any)?.isReference ?? contact?.reference ?? false,
  };

  const { get_dropdown_options_data, get_business_contact_types_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getBusinessContactTypesAsync());
    dispatch(getDropdownOptionsAsync('BusinessContactRole'));
  }, [dispatch]));

  const statusOptions = [
    {
      label: t('business.add_business_contact.status_active'),
      value: 'active',
    },
    {
      label: t('business.add_business_contact.status_inactive'),
      value: 'inactive',
    },
  ];

  const primaryOptions = [
    { label: t('business.add_business_contact.primary_yes'), value: 'yes' },
    { label: t('business.add_business_contact.primary_no'), value: 'no' },
  ];

  // Map contact type to API number is declared above initialValues (for edit mode mapping)

  const handleSubmit = async (values: FormData): Promise<void> => {
    if (!selectedBusinessId) {
      return;
    }

    // Prepare payload for API
    const payload = {
      businessId: selectedBusinessId,
      fullName: values.fullName,
      role: values.role,
      companyTeam: values.companyTeam,
      status: values.status,
      emailAddress: values.emailAddress,
      phoneNumber: values.phoneNumber,
      manager: values.manager,
      location: values.location,
      tags: values.tags,
      contactType: Number(values.contactType),
      isPrimary: values.primary === 'yes',
      isReference: values.reference,
    };

    try {
      if (isEdit && contact?.id) {
        const action = await dispatch(updateBusinessContactAsync({ id: contact.id, data: payload } as any));
        saveLinksAfter(links, action, contact.id, undefined, recordNotes);
      } else {
        const action = await dispatch(addBusinessContactAsync({ ...payload, ...(ownerUserId ? { ownerUserId } : {}) } as any));
        saveLinksAfter(links, action, undefined, undefined, recordNotes);
      }
    } catch (error) {
      console.error('Error submitting business contact:', error);
    }
  };

  // Handle success and navigate back with refresh
  useEffect(() => {
    if (addStatus === ASYNC_STATUS.SUCCEEDED || updateStatus === ASYNC_STATUS.SUCCEEDED) {
      // Reset status
      if (addStatus === ASYNC_STATUS.SUCCEEDED) {
        dispatch(resetAddBusinessContactStatus());
      } else {
        dispatch(resetUpdateBusinessContactStatus());
      }

      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        navigation.goBack();
      }, 100);
    }
  }, [addStatus, updateStatus, dispatch, navigation]);

  // Memoized loading state
  const isLoading = useMemo(
    () => addStatus === ASYNC_STATUS.LOADING || updateStatus === ASYNC_STATUS.LOADING,
    [addStatus, updateStatus]
  );

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <AuthHeader
        title={
          isEdit
            ? t('business.add_business_contact.edit_contact')
            : t('business.add_business_contact.title')
        }
        subtitle={t('business.add_business_contact.subtitle')}
        onBackPress={() => navigation.goBack()}
        containerStyle={styles.headerContainerStyle}
      />

      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema('business_contact')}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ handleChange, handleSubmit: formikSubmit, values, setFieldValue, touched, errors }) => (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentCard}>
              <View style={styles.formContainer}>
                {/* Row 1: Full Name & Role */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <CustomInput
                      label={`${t('business.add_business_contact.full_name')} *`}
                      placeholder={t(
                        'business.add_business_contact.full_name_placeholder',
                      )}
                      value={values.fullName}
                      onChangeText={handleChange('fullName')}
                      error={touched.fullName && errors.fullName}
                      containerStyle={styles.inputContainer}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>
                      {t('business.add_business_contact.role')}
                    </Text>
                    <CustomDropDown
                      options={get_dropdown_options_data}
                      value={values.role}
                      onSelect={(value: any) => setFieldValue('role', value)}
                      placeholder={t(
                        'business.add_business_contact.role_placeholder',
                      )}
                      containerStyle={styles.dropdownContainer}
                      leftIcon={true}
                    />
                    {touched.role && errors.role && (
                      <Text style={styles.errorText}>{errors.role}</Text>
                    )}
                  </View>
                </View>

                {/* Row 2: Company/Team & Status */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <VendorAutocompleteInput category="business_contact_company"
                      label={t('business.add_business_contact.company_team')}
                      placeholder={t(
                        'business.add_business_contact.company_team_placeholder',
                      )}
                      value={values.companyTeam}
                      onChangeText={handleChange('companyTeam')}
                      error={touched.companyTeam && errors.companyTeam}
                      containerStyle={styles.inputContainer}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>
                      {t('business.add_business_contact.status')}
                    </Text>
                    <CustomDropDown
                      options={statusOptions}
                      value={values.status}
                      onSelect={(value: any) => setFieldValue('status', value)}
                      placeholder={t(
                        'business.add_business_contact.status_placeholder',
                      )}
                      containerStyle={styles.dropdownContainer}
                      leftIcon={true}
                      search={false}
                    />
                    {touched.status && errors.status && (
                      <Text style={styles.errorText}>{errors.status}</Text>
                    )}
                  </View>
                </View>

                {/* Row 3: Email & Phone */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <CustomInput
                      label={t('business.add_business_contact.email_address')}
                      placeholder={t(
                        'business.add_business_contact.email_placeholder',
                      )}
                      value={values.emailAddress}
                      onChangeText={handleChange('emailAddress')}
                      error={touched.emailAddress && errors.emailAddress}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      containerStyle={styles.inputContainer}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <CustomInput
                      label={t('business.add_business_contact.phone_number')}
                      placeholder={t(
                        'business.add_business_contact.phone_placeholder',
                      )}
                      value={values.phoneNumber}
                      onChangeText={handleChange('phoneNumber')}
                      error={touched.phoneNumber && errors.phoneNumber}
                      keyboardType="phone-pad"
                      containerStyle={styles.inputContainer}
                    />
                  </View>
                </View>

                {/* Row 4: Manager & Location */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <CustomInput
                      label={t('business.add_business_contact.manager')}
                      placeholder={t(
                        'business.add_business_contact.manager_placeholder',
                      )}
                      value={values.manager}
                      onChangeText={handleChange('manager')}
                      error={touched.manager && errors.manager}
                      containerStyle={styles.inputContainer}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <CustomInput
                      label={t('business.add_business_contact.location')}
                      placeholder={t(
                        'business.add_business_contact.location_placeholder',
                      )}
                      value={values.location}
                      onChangeText={handleChange('location')}
                      error={touched.location && errors.location}
                      containerStyle={styles.inputContainer}
                    />
                  </View>
                </View>

                {/* Row 5: Tags & Primary */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <CustomInput
                      label={t('business.add_business_contact.tags')}
                      placeholder={t(
                        'business.add_business_contact.tags_placeholder',
                      )}
                      value={values.tags}
                      onChangeText={handleChange('tags')}
                      error={touched.tags && errors.tags}
                      containerStyle={styles.inputContainer}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>
                      {t('business.add_business_contact.primary')}
                    </Text>
                    <CustomDropDown
                      options={primaryOptions}
                      value={values.primary}
                      onSelect={(value: any) => setFieldValue('primary', value)}
                      placeholder={t(
                        'business.add_business_contact.primary_placeholder',
                      )}
                      containerStyle={styles.dropdownContainer}
                      leftIcon={true}
                      search={false}
                    />
                    {touched.primary && errors.primary && (
                      <Text style={styles.errorText}>{errors.primary}</Text>
                    )}
                  </View>
                </View>

                {/* Contact Type */}
                <Text style={styles.label}>
                  {t('business.add_business_contact.contact_type')}
                </Text>
                <CustomDropDown
                  options={get_business_contact_types_data}
                  value={values.contactType as string}
                  onSelect={(value: any) => setFieldValue('contactType', value)}
                  placeholder={t(
                    'business.add_business_contact.contact_type_placeholder',
                  )}
                  containerStyle={styles.dropdownContainer}
                  style={styles.fullWidthDropdown}
                  leftIcon={true}
                  dropdownPosition="top"
                />
                {touched.contactType && errors.contactType && (
                  <Text style={styles.errorText}>{errors.contactType}</Text>
                )}

                {/* Reference Toggle */}
                <View style={styles.referenceContainer}>
                  <View style={styles.referenceLabelContainer}>
                    <Text style={styles.referenceLabel}>
                      {t('business.add_business_contact.reference')}
                    </Text>
                    <Text style={styles.referenceSubtitle}>
                      Mark if this contact is a reference
                    </Text>
                  </View>
                  <Switch
                    value={values.reference}
                    onValueChange={(value: boolean) => {
                      setFieldValue('reference', value);
                    }}
                    trackColor={{ false: '#E5E5EA', true: themeColors.primary }}
                    thumbColor={colors.white}
                    style={styles.switchStyle}
                  />
                </View>

                {/* Submit Button */}
                <RecordNotesField notes={recordNotes} />
                <RecordLinksField links={links} />
                <PrimaryButton
                  title={
                    isEdit
                      ? t('business.add_business_contact.save_contact')
                      : t('business.add_business_contact.add_business_contact_button')
                  }
                  onPress={() => formikSubmit()}
                  buttonStyle={styles.submitButton}
                  disabled={isLoading}
                />
                {isLoading && (
                  <ActivityIndicator size="small" color={themeColors.primary} style={{ marginTop: 10 }} />
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </Formik>
    </ScreenWrapper>
  );
};

export default AddBusinessContact;

