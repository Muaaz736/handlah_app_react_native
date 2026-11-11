import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../components/notes/RecordNotesField';
import { View, Text, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import {
  AuthHeader,
  CustomInput,
  CustomDropDown,
  CustomDateTimePicker,
  PrimaryButton,
  DocumentPicker,
  ImageUploader,
  MixedMediaUploader,
} from '../../../../../components/common';
import colors from '../../../../../utils/colors';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  showErrorAlert,
  showSuccessAlert,
} from '../../../../../utils/AlertHelper';
import {
  createLegalDocumentAsync,
  legalDocumentsAsync,
  updateLegalDocumentAsync,
} from '../../../../../redux/services/essentialsService';
import {
  setCreateLegalDocumentStatus,
  setUpdateLegalDocumentStatus,
} from '../../../../../redux/slices/essentialsSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { isIOS, isOtherSelected } from '../../../../../utils/helpers';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../utils/validationSchemas';
import { makeAddLegalDocumentStyles } from './AddLegalDocument.styles';
import { getDropdownOptionsAsync } from '../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../constants/recordLinkModules';

const AddLegalDocument = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeAddLegalDocumentStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  // Check if user is in business mode
  const isBusiness = isBusinessRole();

  // Extract params safely
  const routeParams = route?.params as any;
  const isEdit = routeParams?.isEdit || false;
  const existingDoc = routeParams?.document || null;
  const ownerUserId = routeParams?.ownerUserId;
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.LegalDocument,
      recordId: isEdit && existingDoc?.id ? Number(existingDoc.id) : null,
      businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
      enabled: !ownerUserId,
  });
  // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.LegalDocument, recordId: isEdit && existingDoc?.id ? Number(existingDoc.id) : null, enabled: links.enabled, choiceOnly: true });

  const [documentIds, setDocumentIds] = useState<string[]>(() => {
    const raw = existingDoc?.documenturl || existingDoc?.documentUrl;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  });
  
  const formikRef = useRef<FormikProps<any>>(null);

  const initialValues = {
    name: existingDoc?.name || '',
    type: existingDoc?.type ? String(existingDoc.type) : '',
    effectiveDate:
      existingDoc?.effectivedate || existingDoc?.effectiveDate || '',
    endDate: existingDoc?.enddate || existingDoc?.endDate || '',
    notes: existingDoc?.notes || '',
    documentUrl: existingDoc?.documenturl || existingDoc?.documentUrl || '',
    typeOther: existingDoc?.typeOther || existingDoc?.typeother || '',
  };

  const { create_legal_document_status, update_legal_document_status } =
    useSelector((state: any) => state.essentials_slice);

  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('LegalDocumentType'));
  }, [dispatch]));

  const handleInputChange = (
    field: string,
    value: string | number | Date | null,
  ) => {
    formikRef.current?.setFieldValue(field, value);
  };

  const handleContinue = async (values: typeof initialValues) => {
    // Validate typeOther when Other is selected
    const selectedTypeLabel = get_dropdown_options_data?.find(
      (opt: any) => String(opt.value) === String(values.type),
    )?.label;
    if (isOtherSelected(selectedTypeLabel) && !values.typeOther?.trim()) {
      // Formik will surface the error via the field — just return
      return;
    }

    // Prepare API data with proper date formatting
    let effectiveDateISO, endDateISO;

    try {
      effectiveDateISO =
        values.effectiveDate instanceof Date
          ? values.effectiveDate.toISOString()
          : new Date(values.effectiveDate).toISOString();

      endDateISO = values.endDate
        ? values.endDate instanceof Date
          ? values.endDate.toISOString()
          : new Date(values.endDate).toISOString()
        : null;
    } catch (error) {
      console.error('Date formatting error:', error);
      showErrorAlert(t('legal.invalid_date') || 'Invalid date format');
      return;
    }

    const selectedLabel = get_dropdown_options_data?.find(
      (opt: any) => String(opt.value) === String(values.type),
    )?.label;

    const apiData = {
      name: values.name,
      type: values.type,
      effectiveDate: effectiveDateISO,
      endDate: endDateISO,
      notes: values.notes || '',
      documentUrl:
        documentIds.length > 0
          ? documentIds
          : [],
      typeOther: isOtherSelected(selectedLabel) ? values.typeOther : null,
      ...(isBusiness &&
        selectedBusinessId && { businessId: selectedBusinessId }),
    };

    if (isEdit && existingDoc?.id) {
      dispatch(
        updateLegalDocumentAsync({ id: existingDoc.id, data: apiData } as any),
      ).then((a: any) => saveLinksAfter(links, a, existingDoc.id, undefined, recordNotes));
    } else {
      dispatch(
        createLegalDocumentAsync({
          ...apiData,
          ...(ownerUserId ? { ownerUserId } : {}),
        } as any),
      ).then((a: any) => saveLinksAfter(links, a, undefined, undefined, recordNotes));
    }
  };

  useEffect(() => {
    if (create_legal_document_status === ASYNC_STATUS.SUCCEEDED) {
      showSuccessAlert(
        t('legal.created_success') || 'Legal document created successfully',
        'Success',
      );
      const businessIdParam =
        isBusiness && selectedBusinessId ? selectedBusinessId : undefined;
      dispatch(legalDocumentsAsync(businessIdParam));
      dispatch(setCreateLegalDocumentStatus());
      navigation.goBack();
    }
  }, [create_legal_document_status, isBusiness, selectedBusinessId]);
  useEffect(() => {
    if (update_legal_document_status === ASYNC_STATUS.SUCCEEDED) {
      showSuccessAlert(
        t('legal.updated_success') || 'Legal document updated successfully',
        'Success',
      );
      const businessIdParam =
        isBusiness && selectedBusinessId ? selectedBusinessId : undefined;
      dispatch(legalDocumentsAsync(businessIdParam));
      dispatch(setUpdateLegalDocumentStatus());
      navigation.goBack();
    }
  }, [update_legal_document_status, isBusiness, selectedBusinessId]);

  const isLoading: boolean =
    create_legal_document_status === ASYNC_STATUS.LOADING ||
    update_legal_document_status === ASYNC_STATUS.LOADING;

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      {/* Header — B-037 */}
      <AuthHeader
        title={
          isEdit
            ? t('legal.edit_legal_document')
            : t('legal.add_legal_document')
        }
        onBackPress={() => navigation.goBack()}
        containerStyle={[
          styles.headerContainerStyle,
          { paddingTop: isIOS ? 0 : 20 },
        ]}
        backButtonIconStyle={{tintColor: themeColors.textPrimary}}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={validationSchema('legal_document')}
          onSubmit={handleContinue}
          enableReinitialize
        >
          {({
            handleChange,
            handleSubmit,
            values,
            setFieldValue,
            touched,
            errors,
          }) => (
            <>
              {/* Title Input */}
              <CustomInput
                value={values.name}
                onChangeText={handleChange('name')}
                placeholder={t('legal.title_placeholder')}
                label={`${t('legal.document_title')} *`}
                labelStyle={{ textAlign: 'left' }}
                inputStyle={{ textAlign: 'left' }}
                error={
                  touched.name && errors.name ? String(errors.name) : undefined
                }
              />

              {/* Type Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { textAlign: 'left' }]}>
                  {t('legal.type')} *
                </Text>
                <CustomDropDown
                  options={get_dropdown_options_data}
                  value={values.type}
                  onSelect={(value: any) => {
                    setFieldValue('type', String(value));
                    // Clear typeOther when switching away from Other
                    if (!isOtherSelected(get_dropdown_options_data?.find((opt: any) => String(opt.value) === String(value))?.label)) {
                      setFieldValue('typeOther', '');
                    }
                  }}
                  placeholder={t('common.contract')}
                  search={true}
                  leftIcon={true}
                />
                {touched.type && errors.type && (
                  <Text style={styles.errorText}>{String(errors.type)}</Text>
                )}
              </View>

              {/* Other type — only visible when Other is selected */}
              {isOtherSelected(get_dropdown_options_data?.find((opt: any) => String(opt.value) === String(values.type))?.label) && (
                <View style={styles.inputGroup}>
                  <CustomInput
                    label={t('common.please_specify') || 'Please specify *'}
                    placeholder={t('common.other_type_placeholder') || 'Please specify...'}
                    value={values.typeOther || ''}
                    onChangeText={val => setFieldValue('typeOther', val)}
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                    error={
                      touched.typeOther && errors.typeOther
                        ? String(errors.typeOther)
                        : !values.typeOther?.trim() && touched.type
                          ? t('common.field_required') || 'This field is required'
                          : undefined
                    }
                  />
                </View>
              )}

              {/* Dates Row */}
              <View style={styles.datesRow}>
                <View style={styles.dateGroup}>
                  <Text style={[styles.label, { textAlign: 'left' }]}>
                    {t('legal.effective_date')} *
                  </Text>
                  <CustomDateTimePicker
                    value={values.effectiveDate}
                    onChange={value => setFieldValue('effectiveDate', value)}
                    placeholder={t('common.select')}
                    displayFormat="MM/DD/YYYY"
                    suffixIcon={
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={themeColors.textSecondary}
                      />
                    }
                  />
                  {touched.effectiveDate && errors.effectiveDate && (
                    <Text style={styles.errorText}>
                      {String(errors.effectiveDate)}
                    </Text>
                  )}
                </View>
                <View style={styles.dateGroup}>
                  <Text style={[styles.label, { textAlign: 'left' }]}>
                    {t('legal.expire_date')}
                  </Text>
                  <CustomDateTimePicker
                    value={values.endDate}
                    onChange={value => setFieldValue('endDate', value)}
                    placeholder={t('common.select')}
                    displayFormat="MM/DD/YYYY"
                    suffixIcon={
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={themeColors.textSecondary}
                      />
                    }
                  />
                  {!!values.endDate && (
                    <Text
                      style={styles.clearDateText}
                      onPress={() => setFieldValue('endDate', '')}>
                      {t('common.clear') || 'Clear'}
                    </Text>
                  )}
                  {touched.endDate && errors.endDate && (
                    <Text style={styles.errorText}>
                      {String(errors.endDate)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Notes Input — B-037 */}
              <View style={styles.inputGroup}>
                <CustomInput
                  value={values.notes}
                  onChangeText={handleChange('notes')}
                  placeholder={t('legal.notes_placeholder')}
                  label={t('legal.notes_comments')}
                  labelStyle={{ textAlign: 'left' }}
                  inputStyle={{ textAlign: 'left', paddingTop: 10 }}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <RecordNotesEncryptRow notes={recordNotes} />
              <RecordLinksField links={links} />
              {/* Upload Section */}
              <View style={styles.uploadSection}>
                <MixedMediaUploader
                  mediaIds={documentIds}
                  onMediaChange={(ids: string[]) => setDocumentIds(ids)}
                  label={t('legal.upload_document')}
                  placeholder={t('common.upload')}
                  uploadType="box"
                  maxItems={10}
                  removable={true}
                  autoUpload={true}
                />
              </View>

              {/* Footer Button */}
              <View style={styles.footer}>
                <PrimaryButton
                  title={
                    isEdit ? t('common.save_changes') : t('common.continue')
                  }
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading}
                />
              </View>
            </>
          )}
        </Formik>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AddLegalDocument;
