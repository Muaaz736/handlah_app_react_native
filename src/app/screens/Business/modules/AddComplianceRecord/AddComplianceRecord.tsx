import {
  ScrollView,
  Text,
  View,
  Image,
} from 'react-native';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../components/notes/RecordNotesField';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Formik, FormikProps } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import { FormValues, DropdownOption } from './AddComplianceRecord.types';
import {
  AuthHeader,
  CustomInput,
  CustomDropDown,
  PrimaryButton,
  CustomDateTimePicker,
  ImageUploader,
  MixedMediaUploader,
} from '../../../../../components/common';
import colors from '../../../../../utils/colors';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { makeAddComplianceRecordStyles } from './AddComplianceRecord.styles';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { ICONS } from '../../../../../utils/Images';
import { isIOS } from '../../../../../utils/helpers';
import { ASYNC_STATUS } from '../../../../../config/constants';
import validationSchema from '../../../../../utils/validationSchemas';
import {
  addComplianceRecordAsync,
  updateComplianceRecordAsync,
  getComplianceRecordByIdAsync,
} from '../../../../../redux/services/businessLicensesService';
import {
  resetAddComplianceRecordStatus,
  resetUpdateComplianceRecordStatus,
} from '../../../../../redux/slices/businessLicensesSlice';
import { getComplianceTypeOptionsAsync } from '../../../../../redux/services/authService';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../constants/recordLinkModules';

const AddComplianceRecord = (): React.ReactElement => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAddComplianceRecordStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();

  const formikRef = useRef<FormikProps<FormValues> | null>(null);

  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);

  // Route params
  const params = (route.params || {}) as {
    recordId?: number;
    folderId?: number;
    businessId?: number;
    ownerUserId?: number;
    userId?: number;
    sharedWithUserId?: number;
    ownerId?: number;
  };
  const { recordId, folderId, businessId, ownerUserId, userId, sharedWithUserId, ownerId } = params;
  const isEditMode = !!recordId;
  const resolvedBusinessId = businessId || selectedBusinessId;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.ComplianceDocument,
        recordId: recordId ? Number(recordId) : null,
        businessId: resolvedBusinessId ?? null,
        enabled: !ownerUserId,
    });
    // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.ComplianceDocument, recordId: recordId ? Number(recordId) : null, enabled: links.enabled, choiceOnly: true });

  const {
    add_compliance_record_status,
    update_compliance_record_status,
    get_compliance_record_status,
    get_compliance_record_data,
  } = useSelector((state: any) => state.business_licenses_slice);

  const isLoading =
    add_compliance_record_status === ASYNC_STATUS.LOADING ||
    update_compliance_record_status === ASYNC_STATUS.LOADING ||
    get_compliance_record_status === ASYNC_STATUS.LOADING;

  // Fetch record in edit mode
  useEffect(() => {
    if (isEditMode && recordId) {
      dispatch(getComplianceRecordByIdAsync({
        id: recordId,
        businessId,
        userId,
        sharedWithUserId,
        ownerId,
      }) as any);
    }
  }, [isEditMode, recordId, businessId, userId, sharedWithUserId, ownerId, dispatch]);

  // Pre-populate attachments when record data arrives
  useEffect(() => {
    if (isEditMode && get_compliance_record_data) {
      const existing = get_compliance_record_data.documentUrl;
      setAttachmentIds(
        Array.isArray(existing) ? existing : existing ? [existing as string] : []
      );
    }
  }, [isEditMode, get_compliance_record_data]);

  // Handle success
  useEffect(() => {
    if (isEditMode) {
      if (update_compliance_record_status === ASYNC_STATUS.SUCCEEDED) {
        dispatch(resetUpdateComplianceRecordStatus());
        navigation.goBack();
      }
    } else {
      if (add_compliance_record_status === ASYNC_STATUS.SUCCEEDED) {
        formikRef.current?.resetForm();
        dispatch(resetAddComplianceRecordStatus());
        navigation.goBack();
      }
    }
  }, [add_compliance_record_status, update_compliance_record_status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetAddComplianceRecordStatus());
      dispatch(resetUpdateComplianceRecordStatus());
    };
  }, [dispatch]);

  const { get_compliance_type_options_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getComplianceTypeOptionsAsync() as any);
  }, [dispatch]));

  const statusOptions: DropdownOption[] = [
    { label: t('business.add_compliance_record.status_valid'), value: '1' },
    { label: t('business.add_compliance_record.status_due'), value: '2' },
    { label: t('business.add_compliance_record.status_expired'), value: '3' },
    { label: t('business.add_compliance_record.status_pending'), value: '4' },
    { label: t('business.add_compliance_record.status_under_review'), value: '5' },
    { label: t('business.add_compliance_record.status_rejected'), value: '6' },
    { label: t('business.add_compliance_record.status_cancelled'), value: '7' },
  ];

  const initialValues: FormValues =
    isEditMode && get_compliance_record_data
      ? {
        title: get_compliance_record_data.title || '',
        complianceType: get_compliance_record_data.type ? String(get_compliance_record_data.type) : '',
        status: get_compliance_record_data.status ? String(get_compliance_record_data.status) : '',
        dueDate: get_compliance_record_data.dueDate || '',
        notes: get_compliance_record_data.notes || '',
      }
      : {
        title: '',
        complianceType: '',
        status: '',
        dueDate: '',
        notes: '',
      };

  const handleSubmitData = (values: FormValues) => {
    if (!resolvedBusinessId) {
      console.error('Business ID is not available');
      return;
    }

    if (isEditMode) {
      const editPayload = {
        id: recordId!,
        payload: {
          title: values.title,
          type: values.complianceType,
          status: parseInt(values.status, 10),
          dueDate: new Date(values.dueDate).toISOString(),
          notes: values.notes || '',
          documentUrl: attachmentIds.length > 0 ? attachmentIds : [],
        },
        businessId,
        userId,
        sharedWithUserId,
        ownerId,
      }
      dispatch(
        updateComplianceRecordAsync(editPayload as any) as any,
      ).then((a: any) => saveLinksAfter(links, a, recordId, undefined, recordNotes));
    } else {
      const addPayload = {
        businessId: resolvedBusinessId,
        complianceFolderId: folderId!,
        title: values.title,
        type: values.complianceType,
        status: parseInt(values.status, 10),
        dueDate: new Date(values.dueDate).toISOString(),
        notes: values.notes || '',
        documentUrl: attachmentIds.length > 0 ? attachmentIds : [],
      }
      dispatch(
        addComplianceRecordAsync({ ...addPayload, ...(ownerUserId ? { ownerUserId } : {}) } as any) as any,
      ).then((a: any) => saveLinksAfter(links, a, undefined, undefined, recordNotes));
    }
  };

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <AuthHeader
        title={
          isEditMode
            ? t('business.add_compliance_record.edit_title')
            : t('business.add_compliance_record.title')
        }
        subtitle={t('business.add_compliance_record.subtitle')}
        onBackPress={() => navigation.goBack()}
        containerStyle={[styles.headerContainerStyle, { paddingTop: isIOS ? 0 : 20 }]}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema('compliance_record')}
            onSubmit={handleSubmitData}
          >
            {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
              <View style={styles.formContainer}>
                {/* Title */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('business.add_compliance_record.title_label')} *
                  </Text>
                  <CustomInput
                    label={''}
                    placeholder={t('business.add_compliance_record.title_placeholder')}
                    value={values.title}
                    onChangeText={handleChange('title')}
                    containerStyle={styles.inputContainer}
                    error={touched.title && errors.title ? errors.title : ''}
                  />
                </View>

                {/* Compliance Type */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('business.add_compliance_record.compliance_type')} *
                  </Text>
                  <CustomDropDown
                    options={get_compliance_type_options_data}
                    value={values.complianceType}
                    onSelect={(value: any) => setFieldValue('complianceType', value)}
                    placeholder={t('business.add_compliance_record.compliance_type_placeholder')}
                    containerStyle={styles.dropdownContainer}
                    leftIcon={true}
                    search={true}
                  />
                  {touched.complianceType && errors.complianceType ? (
                    <Text style={styles.errorText}>{errors.complianceType as string}</Text>
                  ) : null}
                </View>

                {/* Status & Due Date Row */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>
                      {t('business.add_compliance_record.status')} *
                    </Text>
                    <CustomDropDown
                      options={statusOptions}
                      value={values.status}
                      onSelect={(value: any) => setFieldValue('status', value)}
                      placeholder={t('business.add_compliance_record.status_placeholder')}
                      containerStyle={styles.dropdownContainer}
                      leftIcon={true}
                      search={true}
                    />
                    {touched.status && errors.status ? (
                      <Text style={styles.errorText}>{errors.status as string}</Text>
                    ) : null}
                  </View>

                  <View style={styles.halfWidth}>
                    <CustomDateTimePicker
                      label={`${t('business.add_compliance_record.due_expiration')} *`}
                      placeholder={t('business.add_compliance_record.due_expiration_placeholder')}
                      value={values.dueDate}
                      onChange={(date: any) => setFieldValue('dueDate', date)}
                      mode="date"
                      displayFormat="MM/DD/YYYY"
                      labelStyle={styles.label}
                      suffixIcon={
                        <Image source={ICONS.CALENDER_ICON} style={styles.calendarIcon} />
                      }
                    />
                    {touched.dueDate && errors.dueDate ? (
                      <Text style={styles.errorText}>{errors.dueDate as string}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Notes */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('business.add_compliance_record.notes')}</Text>
                  <CustomInput
                    label={''}
                    placeholder={t('business.add_compliance_record.notes_placeholder')}
                    value={values.notes}
                    onChangeText={handleChange('notes')}
                    containerStyle={styles.inputContainer}
                    inputContainerStyle={styles.textArea}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Upload Document */}
                <View style={styles.inputGroup}>
                  <MixedMediaUploader
                    mediaIds={attachmentIds}
                    onMediaChange={(ids: any) => setAttachmentIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                    label={t('business.add_compliance_record.upload_document')}
                    placeholder={t('business.add_compliance_record.upload')}
                    uploadType="box"
                    maxItems={5}
                    removable={true}
                    autoUpload={true}
                  />
                </View>

                {/* Submit Button */}
                <PrimaryButton
                  title={
                    isEditMode
                      ? t('business.add_compliance_record.update_compliance_record_button')
                      : t('business.add_compliance_record.add_compliance_record_button')
                  }
                  onPress={() => handleSubmit()}
                  buttonStyle={styles.submitButton}
                  loading={isLoading}
                  disabled={isLoading}
                />
              </View>
            )}
          </Formik>
        </View>
      <RecordNotesEncryptRow notes={recordNotes} />
      <RecordLinksField links={links} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AddComplianceRecord;
