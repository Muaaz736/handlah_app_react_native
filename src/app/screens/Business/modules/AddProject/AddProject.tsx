import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../components/notes/RecordNotesField';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, FormikProps } from 'formik';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { validationSchema } from '../../../../../utils/validationSchemas';
import { FormData, DropdownOption, RouteParams } from './AddProject.types';
import { BusinessContactItem } from '../../../../../types/reduxTypes/businessContactsSlice.types';
import {
  addBusinessProjectAsync,
  updateBusinessProjectAsync,
} from '../../../../../redux/services/businessProjectsService';
import { getBusinessContactsAsync } from '../../../../../redux/services/businessContactsService';
import {
  resetAddBusinessProjectStatus,
  resetUpdateBusinessProjectStatus,
} from '../../../../../redux/slices/businessProjectsSlice';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { getDropdownOptionsAsync } from '../../../../../redux/services/authService';

import {
  AuthHeader,
  CustomInput,
  CustomDropDown,
  CustomDateTimePicker,
  ImageUploader,
  PrimaryButton,
  ImageAsset,
  MixedMediaUploader,
} from '../../../../../components/common';
import colors from '../../../../../utils/colors';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { makeAddProjectStyles } from './AddProject.styles';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { isIOS } from '../../../../../utils/helpers';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../constants/recordLinkModules';

const AddProject = (): React.ReactElement => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAddProjectStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();
  const { selectedBusinessId } = useSelectedBusiness();

  // Get route params for edit mode
  const { project, isEdit, ownerUserId, isFromSharedWithYou } = (route?.params as any) || {};
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.BusinessProject,
      recordId: isEdit && project?.id ? Number(project.id) : null,
      businessId: selectedBusinessId ?? null,
      enabled: !ownerUserId && !isFromSharedWithYou,
  });
  // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.BusinessProject, recordId: isEdit && project?.id ? Number(project.id) : null, enabled: links.enabled, choiceOnly: true });

  const [attachmentIds, setAttachmentIds] = useState<string[]>(() => {
    const existing = project?.attachmentUrls ?? project?.attachmenturls;
    return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
  });

  // Redux state
  const businessProjectsState = useSelector(
    (state: any) => state.business_projects_slice,
  );
  const businessContactsState = useSelector(
    (state: any) => state.business_contacts_slice,
  );
  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

  // Build contact options from ALL business contacts (no role filter)
  const clientOptions: DropdownOption[] = useMemo(() => {
    const contacts: BusinessContactItem[] =
      businessContactsState?.get_business_contacts_data || [];
    return contacts.map((c: BusinessContactItem) => {
      const roleLabel = get_dropdown_options_data?.find(
        (opt: any) => String(opt.value) === String(c.role),
      )?.label;
      return {
        label: roleLabel ? `${c.fullName} (${roleLabel})` : c.fullName,
        value: c.id.toString(),
      };
    });
  }, [businessContactsState, get_dropdown_options_data]);

  const hasNoClients = clientOptions.length === 0;

  // Fetch all contacts and role options whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (selectedBusinessId) {
        dispatch(getBusinessContactsAsync({ businessId: selectedBusinessId }));
      }
      dispatch(getDropdownOptionsAsync('BusinessContactRole'));
    }, [selectedBusinessId, dispatch]),
  );

  const { addStatus, updateStatus } = useMemo(
    () => ({
      addStatus: businessProjectsState?.add_business_project_status,
      updateStatus: businessProjectsState?.update_business_project_status,
    }),
    [businessProjectsState],
  );

  // Formik ref
  const formikRef = useRef<FormikProps<FormData>>(null);

  // Initial values - project comes from Redux (camelCase transformed) or raw API (lowercase)
  const rawStartDate = project?.startDate ?? project?.startdate;
  const rawEndDate = project?.endDate ?? project?.enddate;
  const rawClientIds: number[] = project?.clientIds ?? project?.clientids ?? [];
  // A connection's shared project: contacts belong to their business, not
  // ours, so they're shown read-only and left untouched on submit.
  const rawClients: { name?: string }[] = project?.clients ?? [];
  const contactNamesDisplay = rawClients.length > 0
    ? rawClients.map(c => c.name).filter(Boolean).join(', ')
    : rawClientIds.length > 0
      ? rawClientIds.map(id => `#${id}`).join(', ')
      : (t('business.add_project.no_contact_assigned') || 'No contact assigned');

  const toDateString = (raw?: string): string => {
    if (!raw) return '';
    // If the string already contains 'T', take everything before it
    const tIndex = raw.indexOf('T');
    return tIndex !== -1 ? raw.slice(0, tIndex) : raw;
  };

  const initialValues: FormData = {
    projectName: project?.projectName ?? project?.projectname ?? '',
    description: project?.description ?? '',
    clients: rawClientIds.map((id: number) => id.toString()),
    startDate: toDateString(rawStartDate),
    endDate: toDateString(rawEndDate),
    projectStatus: (project?.projectStatus ?? project?.projectstatus)?.toString() ?? '',
    amount: project?.amount?.toString() ?? '',
    notes: project?.notes ?? '',
  };

  const statusOptions: DropdownOption[] = [
    { label: t('business.add_project.status_planning'), value: '1' },
    { label: t('business.add_project.status_in_progress'), value: '2' },
    { label: t('business.add_project.status_on_hold'), value: '3' },
    { label: t('business.add_project.status_completed'), value: '4' },
    { label: t('business.add_project.status_cancelled'), value: '5' },
  ];

  const handleSubmit = async (values: FormData): Promise<void> => {
    if (!selectedBusinessId) {
      return;
    }

    // Prepare payload for API
    const payload = {
      businessId: selectedBusinessId,
      clientIds: isFromSharedWithYou
        ? rawClientIds
        : values.clients.map((id: string) => parseInt(id)).filter(Boolean),
      projectName: values.projectName,
      description: values.description,
      ...(values.startDate
        ? { startDate: `${values.startDate}T00:00:00.000Z` }
        : {}),
      ...(values.endDate
        ? { endDate: `${values.endDate}T00:00:00.000Z` }
        : {}),
      projectStatus: parseInt(values.projectStatus) || 1,
      additionalDetails: '',
      notes: values.notes,
      attachmentUrls: attachmentIds.length > 0 ? attachmentIds : [],
      amount: parseFloat(values.amount),
    };

    try {
      if (isEdit && project?.id) {
        const action = await dispatch(
          updateBusinessProjectAsync({ id: project.id, data: payload }),
        );
        saveLinksAfter(links, action, project.id, undefined, recordNotes);
      } else {
        const action = await dispatch(addBusinessProjectAsync({ ...payload, ...(ownerUserId ? { ownerUserId } : {}) }));
        saveLinksAfter(links, action, undefined, undefined, recordNotes);
      }
    } catch (error) {
      console.error('Error submitting business project:', error);
    }
  };

  // Handle success and navigate back
  useEffect(() => {
    if (
      addStatus === ASYNC_STATUS.SUCCEEDED ||
      updateStatus === ASYNC_STATUS.SUCCEEDED
    ) {
      if (addStatus === ASYNC_STATUS.SUCCEEDED) {
        dispatch(resetAddBusinessProjectStatus());
      } else {
        dispatch(resetUpdateBusinessProjectStatus());
      }

      setTimeout(() => {
        navigation.goBack();
      }, 100);
    }
  }, [addStatus, updateStatus, dispatch, navigation]);

  const isLoading = useMemo(
    () =>
      addStatus === ASYNC_STATUS.LOADING ||
      updateStatus === ASYNC_STATUS.LOADING,
    [addStatus, updateStatus],
  );

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <AuthHeader
        title={
          isEdit
            ? t('business.add_project.edit_project')
            : t('business.add_project.title')
        }
        subtitle={t('business.add_project.subtitle')}
        onBackPress={() => navigation.goBack()}
        containerStyle={[
          styles.headerContainerStyle,
          { paddingTop: isIOS ? 0 : 20 },
        ]}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={validationSchema('business_project', { requireContact: !isFromSharedWithYou })}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({
              handleChange,
              handleSubmit: formikSubmit,
              values,
              setFieldValue,
              touched,
              errors,
            }) => (
              <View style={styles.formContainer}>
                {/* Project Name */}
                <CustomInput
                  label={t('business.add_project.project_name')}
                  placeholder={t(
                    'business.add_project.project_name_placeholder',
                  )}
                  value={values.projectName}
                  onChangeText={handleChange('projectName')}
                  error={touched.projectName && errors.projectName}
                  containerStyle={styles.inputContainer}
                />

                {/* Description */}
                <CustomInput
                  label={t('business.add_project.description')}
                  placeholder={t(
                    'business.add_project.description_placeholder',
                  )}
                  value={values.description}
                  onChangeText={handleChange('description')}
                  error={touched.description && errors.description}
                  containerStyle={styles.inputContainerWithMarginTop}
                  inputContainerStyle={styles.textArea}
                  multiline
                  numberOfLines={4}
                />

                {/* Contact */}
                <View>
                  <View style={styles.contactLabelRow}>
                    <Text style={styles.label}>
                      {t('business.add_project.contact')}
                    </Text>
                    {!isFromSharedWithYou && !hasNoClients && (
                      <TouchableOpacity
                        onPress={() =>
                          (navigation as any).navigate('AddBusinessContact')
                        }
                      >
                        <Text
                          style={[
                            styles.addContactLinkText,
                            { color: themeColors.primary },
                          ]}
                        >
                          {t('business.add_project.add_contact_link') ||
                            '+ Create Contact'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {isFromSharedWithYou ? (
                    <CustomInput
                      value={contactNamesDisplay}
                      onChangeText={() => {}}
                      editable={false}
                      containerStyle={styles.inputContainer}
                    />
                  ) : hasNoClients ? (
                    <View style={styles.noClientsContainer}>
                      <Text style={styles.noClientsText}>
                        {t('business.add_project.no_contacts_message') ||
                          "You don't have any Business Contacts. Please add one first."}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.addClientButton,
                          { backgroundColor: themeColors.primary },
                        ]}
                        onPress={() =>
                          (navigation as any).navigate('AddBusinessContact')
                        }
                      >
                        <Text style={styles.addClientButtonText}>
                          {t('business.add_project.add_contact_button') || '+ Add Business Contact'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <CustomDropDown
                        options={clientOptions}
                        value={values.clients}
                        selectedItems={values.clients}
                        onSelect={(value: any) =>
                          setFieldValue('clients', value)
                        }
                        placeholder={t(
                          'business.add_project.contact_placeholder',
                        )}
                        containerStyle={styles.dropdownContainer}
                        leftIcon={true}
                        search={true}
                        multiSelect={true}
                      />
                      {touched.clients && errors.clients && (
                        <Text style={styles.errorText}>{errors.clients as string}</Text>
                      )}
                    </>
                  )}
                </View>

                {/* Start Date & End Date */}
                <View style={styles.rowContainerWithMarginTop}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>
                      {t('business.add_project.start_date')}
                    </Text>
                    <CustomDateTimePicker
                      placeholder={t(
                        'business.add_project.start_date_placeholder',
                      )}
                      value={values.startDate}
                      onChange={(selectedDate: any) => {
                        if (selectedDate instanceof Date) {
                          const y = selectedDate.getFullYear();
                          const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          const d = String(selectedDate.getDate()).padStart(2, '0');
                          setFieldValue('startDate', `${y}-${m}-${d}`);
                        } else {
                          setFieldValue('startDate', selectedDate);
                        }
                      }}
                      mode="date"
                      suffixIcon={
                        <FontAwesome6
                          name="calendar"
                          size={20}
                          color={colors.gray}
                        />
                      }
                      containerStyle={styles.datePickerContainer}
                      displayFormat="MM/DD/YYYY"
                    />
                    {touched.startDate && errors.startDate && (
                      <Text style={styles.errorText}>{errors.startDate}</Text>
                    )}
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>
                      {t('business.add_project.end_date')}
                    </Text>
                    <CustomDateTimePicker
                      placeholder={t(
                        'business.add_project.end_date_placeholder',
                      )}
                      value={values.endDate}
                      onChange={(selectedDate: any) => {
                        if (selectedDate instanceof Date) {
                          const y = selectedDate.getFullYear();
                          const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          const d = String(selectedDate.getDate()).padStart(2, '0');
                          setFieldValue('endDate', `${y}-${m}-${d}`);
                        } else {
                          setFieldValue('endDate', selectedDate);
                        }
                      }}
                      mode="date"
                      suffixIcon={
                        <FontAwesome6
                          name="calendar"
                          size={20}
                          color={colors.gray}
                        />
                      }
                      containerStyle={styles.datePickerContainer}
                      displayFormat="MM/DD/YYYY"
                    />
                    {touched.endDate && errors.endDate && (
                      <Text style={styles.errorText}>{errors.endDate}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.statusDropdownWrapper}>
                  {/* Project Status */}
                  <Text style={styles.label}>
                    {t('business.add_project.project_status')}
                  </Text>
                  <CustomDropDown
                    options={statusOptions}
                    value={values.projectStatus}
                    onSelect={(value: any) =>
                      setFieldValue('projectStatus', value)
                    }
                    placeholder={t(
                      'business.add_project.project_status_placeholder',
                    )}
                    containerStyle={styles.dropdownContainer}
                    leftIcon={true}
                  />
                  {touched.projectStatus && errors.projectStatus && (
                    <Text style={styles.errorText}>{errors.projectStatus}</Text>
                  )}
                </View>

                {/* Amount */}
                <CustomInput
                  label={t('business.add_project.amount')}
                  placeholder={t('business.add_project.amount')}
                  value={values.amount}
                  onChangeText={handleChange('amount')}
                  error={touched.amount && errors.amount}
                  keyboardType="numeric"
                  containerStyle={styles.inputContainerWithMarginTop}
                />

                {/* Notes */}
                <CustomInput
                  label={t('business.add_project.notes')}
                  placeholder={t('business.add_project.notes_placeholder')}
                  value={values.notes}
                  onChangeText={handleChange('notes')}
                  error={touched.notes && errors.notes}
                  containerStyle={styles.inputContainerWithMarginTop}
                  inputContainerStyle={styles.textArea}
                  multiline
                  numberOfLines={4}
                />

                {/* Upload Attachments */}
                <View style={styles.uploadSection}>
                  <MixedMediaUploader
                    mediaIds={attachmentIds}
                    onMediaChange={(ids: any) => setAttachmentIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                    label={t('business.add_project.upload_attachments')}
                    placeholder={t('business.add_project.upload')}
                    uploadType="box"
                    maxItems={5}
                    removable={true}
                    autoUpload={true}
                    onMediaSelect={() => { }}
                  />
                </View>

                {/* Submit Button */}
                <RecordNotesEncryptRow notes={recordNotes} />
                <RecordLinksField links={links} />
                <PrimaryButton
                  title={
                    isEdit
                      ? t('business.add_project.save_project')
                      : t('business.add_project.add_project_button')
                  }
                  onPress={() => formikSubmit()}
                  buttonStyle={styles.submitButton}
                  disabled={isLoading}
                />
                {isLoading && (
                  <ActivityIndicator
                    size="small"
                    color={themeColors.primary}
                    style={{ marginTop: 10 }}
                  />
                )}
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AddProject;
