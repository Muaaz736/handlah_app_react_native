import React, { useState, useCallback, FC, useEffect, useMemo } from 'react';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../components/notes/RecordNotesField';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CustomInput,
  CustomDropDown,
  PrimaryButton,
  DocumentPicker,
  CustomDateTimePicker,
  MixedMediaUploader,
  showErrorToast,
} from '../../../../../components/common';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { makeCommonStyles } from './BookMarks.styles';
import { makeEditBookMarkStyles } from './EditBookMark.styles';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { ITypeOption } from './bookmarks.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateBookmarkAsync } from '../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { showSuccessAlert } from '../../../../../utils/AlertHelper';
import { extractApiError } from '../../../../../utils/helpers';
import { authenticateWithAlert, biometricKeysExist } from '../../../../../utils/biometricServices';
import { unlockResourceWithBiometric } from '../../../../../utils/biometricUnlock';
import { setUpdateBookmarkStatus } from '../../../../../redux/slices/essentialsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../utils/validationSchemas';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../constants/recordLinkModules';

// Bookmark type enum values
const BOOKMARK_TYPES = {
  DOCUMENT: 0,
  NOTES: 1,
  URL: 2,
  OTHER: 3,
};

const EditBookMark: FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();

  const { update_bookmark_status } = useSelector(
    (state: any) => state.essentials_slice,
  );

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeEditBookMarkStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();
  const { bookmark } = (route.params as any) || {};
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.Bookmark,
      recordId: bookmark?.id ? Number(bookmark.id) : null,
      businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
      enabled: true,
  });
  // Notes (separate from a note bookmark's text) with the "Encrypt notes" choice; saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Bookmark, recordId: bookmark?.id ? Number(bookmark.id) : null, enabled: links.enabled });

  // Check if user is in business mode
  const isBusiness = isBusinessRole();

  const formikRef =
    React.useRef<FormikProps<{ title: string; type: number; url: string; notes: string; documentIds: string[]; startDate?: Date; endDate?: Date }>>(null);

  const getInitialType = (): number => {
    const t = bookmark?.type;
    if (typeof t === 'number') {
      return t;
    }
    // Handle string types returned from API
    if (typeof t === 'string') {
      const typeMap: Record<string, number> = {
        Document: BOOKMARK_TYPES.DOCUMENT,
        Notes: BOOKMARK_TYPES.NOTES,
        Link: BOOKMARK_TYPES.URL,
        URL: BOOKMARK_TYPES.URL,
        Other: BOOKMARK_TYPES.OTHER,
      };
      if (typeMap[t] !== undefined) {
        return typeMap[t];
      }
    }
    return BOOKMARK_TYPES.URL;
  };

  const [title, setTitle] = useState<string>(
    bookmark?.sitename || bookmark?.title || '',
  );
  const [type, setType] = useState<number>(getInitialType());

  const formikInitialValues = {
    title: bookmark?.sitename || bookmark?.title || '',
    type: getInitialType(),
    url: bookmark?.urllink || '',
    notes: bookmark?.note || '',
    documentIds: bookmark?.documentid
      ? Array.isArray(bookmark.documentid)
        ? bookmark.documentid.map(String)
        : [String(bookmark.documentid)]
      : [] as string[],
    startDate: bookmark?.startdate ? new Date(bookmark.startdate) : bookmark?.startDate ? new Date(bookmark.startDate) : undefined as Date | undefined,
    endDate: bookmark?.enddate ? new Date(bookmark.enddate) : bookmark?.endDate ? new Date(bookmark.endDate) : undefined as Date | undefined,
  };

  const [url, setUrl] = useState<string>(bookmark?.urllink || '');
  const [documentIds, setDocumentIds] = useState<string[]>(
    bookmark?.documentid
      ? Array.isArray(bookmark.documentid)
        ? bookmark.documentid.map(String)
        : [String(bookmark.documentid)]
      : [],
  );
  const [notes, setNotes] = useState<string>(bookmark?.note || '');
  const [username, setUsername] = useState<string>(bookmark?.username || '');
  const [password, setPassword] = useState<string>(bookmark?.password || '');
  const [credentialsModalVisible, setCredentialsModalVisible] =
    useState<boolean>(false);

  const typeOptions: ITypeOption[] = [
    { label: t('bookmarks.types.url'), value: BOOKMARK_TYPES.URL },
    { label: t('bookmarks.types.document'), value: BOOKMARK_TYPES.DOCUMENT },
    { label: t('bookmarks.types.notes'), value: BOOKMARK_TYPES.NOTES },
    { label: t('bookmarks.types.other'), value: BOOKMARK_TYPES.OTHER },
  ];

  const handleSaveChanges = useCallback(
    async (formValues: { title: string; type: number; url: string; notes: string; documentIds: string[]; startDate?: Date; endDate?: Date }) => {
      const { title: formTitle, type: formType } = formValues;

      let bookmarkData = {
        sitename: formTitle,
        type: formType,
        username: username || '',
        password: password || '',
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        ...(isBusiness &&
          selectedBusinessId && { businessId: selectedBusinessId }),
      } as any;

      // Add type-specific fields
      if (formType === BOOKMARK_TYPES.URL) {
        bookmarkData.urllink = formValues.url;
      } else if (formType === BOOKMARK_TYPES.DOCUMENT) {
        bookmarkData.documentId = formValues.documentIds;
      } else if (formType === BOOKMARK_TYPES.NOTES) {
        bookmarkData.note = formValues.notes;
      } else if (formType === BOOKMARK_TYPES.OTHER) {
        bookmarkData.note = formValues.notes;
      }

      // Clear fields not relevant to the selected type
      if (formType !== BOOKMARK_TYPES.URL) {
        bookmarkData.urllink = null;
      }
      if (formType !== BOOKMARK_TYPES.DOCUMENT) {
        bookmarkData.documentId = [];
      }
      if (
        formType !== BOOKMARK_TYPES.NOTES &&
        formType !== BOOKMARK_TYPES.OTHER
      ) {
        bookmarkData.note = null;
      }

      dispatch(
        updateBookmarkAsync({ id: bookmark.id, data: bookmarkData } as any),
      ).then((a: any) => saveLinksAfter(links, a, bookmark.id, undefined, recordNotes));
    },
    [url, documentIds, notes, username, password, bookmark, dispatch, links],
  );

  const handleChangeCredentials = useCallback(async () => {
    // No registered biometric device on this install — fall back to the
    // local Face ID/passcode screen-lock gate (no backend unlock call).
    const hasBiometricDevice = await biometricKeysExist();
    if (!hasBiometricDevice) {
      await authenticateWithAlert({
        promptMessage:
          t('bookmarks.authenticateToView') || 'Authenticate to view credentials',
        cancelButtonText: t('common.cancel') || 'Cancel',
        failureTitle:
          t('social_media.authenticationFailed') || 'Authentication Failed',
        failureMessage:
          t('social_media.authenticationRequiredToViewAccount') ||
          'Authentication is required to view credentials',
        okButtonText: t('common.ok') || 'OK',
        allowDeviceCredentials: true,
        onSuccess: () => {
          setCredentialsModalVisible(true);
        },
      });
      return;
    }

    if (!bookmark?.id) return;

    try {
      const unlockedData = await unlockResourceWithBiometric(
        'bookmarks',
        Number(bookmark.id),
      );
      setUsername(unlockedData?.username ?? '');
      setPassword(unlockedData?.password ?? '');
      setCredentialsModalVisible(true);
    } catch (err: any) {
      // A cancelled/failed Face ID prompt shouldn't surface as an error toast.
      const message = String(err?.message || '').toLowerCase();
      if (message.includes('cancel')) return;
      showErrorToast(extractApiError(err, 'Failed to unlock bookmark credentials.'));
    }
  }, [t, bookmark]);

  const handleSaveCredentials = useCallback(() => {
    setCredentialsModalVisible(false);
  }, []);

  useEffect(() => {
    if (update_bookmark_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(setUpdateBookmarkStatus());
      showSuccessAlert(t('bookmarks.updated_success'));
      navigation.goBack();
    }
  }, [update_bookmark_status]);

  const renderConditionalFields = (): React.ReactElement | null => {
    if (type === BOOKMARK_TYPES.URL) {
      return (
        <View style={commonStyles.inputGroup}>
          <Text style={[commonStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('bookmarks.url_label')}
          </Text>
          <CustomInput
            placeholder={t('bookmarks.url_placeholder')}
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
            labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
            inputStyle={{ textAlign: isRTL ? 'right' : 'left' }}
          />
        </View>
      );
    } else if (type === BOOKMARK_TYPES.DOCUMENT) {
      return (
        <DocumentPicker
          label={t('bookmarks.document_label')}
          placeholder={t('bookmarks.pick_document')}
          documentIds={documentIds}
          onDocumentIdsChange={(ids: string[]) => setDocumentIds(ids)}
          multiple
          removable
          autoUpload={true}
        />
      );
    } else if (type === BOOKMARK_TYPES.NOTES) {
      return (
        <View style={commonStyles.inputGroup}>
          <Text style={[commonStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('bookmarks.notes_label')}
          </Text>
          <CustomInput
            placeholder={t('bookmarks.notes_placeholder')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.notesInput}
            labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
            inputStyle={{ textAlign: isRTL ? 'right' : 'left', height: '100%' }}
            inputContainerStyle={{ height: 120, paddingVertical: 10 }}
          />
        </View>
      );
    } else if (type === BOOKMARK_TYPES.OTHER) {
      return (
        <View style={commonStyles.inputGroup}>
          <Text style={[commonStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('bookmarks.notes_label')}
          </Text>
          <CustomInput
            placeholder={t('bookmarks.notes_placeholder')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.notesInput}
            labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
            inputStyle={{ textAlign: isRTL ? 'right' : 'left', height: '100%' }}
            inputContainerStyle={{ height: 120, paddingVertical: 10 }}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <LinearGradient colors={[themeColors.background, themeColors.background]} style={commonStyles.container}>
      <SafeAreaView style={commonStyles.safeArea}>
        {/* Header */}
        <View style={commonStyles.header}>
          <TouchableOpacity
            style={commonStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >

          {/* Content */}
          <ScrollView
            style={commonStyles.scrollView}
            contentContainerStyle={commonStyles.scrollContent}
          >
            <Text style={commonStyles.title}>{t('bookmarks.edit_bookmark')}</Text>
            <Text style={commonStyles.subtitle}>{t('bookmarks.subtitle')}</Text>

            <Formik
              innerRef={formikRef}
              initialValues={formikInitialValues}
              validationSchema={validationSchema('bookmark')}
              onSubmit={handleSaveChanges}
            >
              {({
                handleChange,
                handleSubmit,
                values,
                setFieldValue,
                touched,
                errors,
                handleBlur,
              }) => (
                <>
                  <View style={commonStyles.form}>
                    <CustomInput
                      label={`${t('bookmarks.title_label')} *`}
                      placeholder={t('bookmarks.title_placeholder')}
                      value={values.title}
                      onChangeText={handleChange('title')}
                      error={
                        touched.title && errors.title
                          ? String(errors.title)
                          : undefined
                      }
                    />

                    <View style={commonStyles.inputGroup}>
                      <Text
                        style={[
                          commonStyles.label,
                          { textAlign: isRTL ? 'right' : 'left' },
                        ]}
                      >
                        {t('bookmarks.type')} *
                      </Text>
                      <CustomDropDown
                        placeholder={t('bookmarks.type_placeholder')}
                        value={values.type as any}
                        onSelect={(item: any) => {
                          setFieldValue('type', item);
                          setType(item);
                        }}
                        options={typeOptions as any}
                        search={false}
                        leftIcon={true}
                        error={touched.type && errors.type ? true : false}
                      />
                      {touched.type && errors.type && (
                        <Text style={styles.errorText}>
                          {String(errors.type)}
                        </Text>
                      )}
                    </View>

                    {/* Type-based conditional fields */}
                    {values.type === BOOKMARK_TYPES.URL && (
                      <CustomInput
                        label={t('bookmarks.url_label')}
                        placeholder={t('bookmarks.url_placeholder')}
                        value={values.url}
                        onChangeText={handleChange('url')}
                        onBlur={handleBlur('url')}
                        keyboardType="url"
                        autoCapitalize="none"
                        labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                        inputStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                        error={touched.url && errors.url ? String(errors.url) : undefined}
                      />
                    )}

                    {values.type === BOOKMARK_TYPES.DOCUMENT && (
                      <>
                        <MixedMediaUploader
                          mediaIds={values.documentIds}
                          onMediaChange={(ids: string[]) => {
                            setFieldValue('documentIds', ids);
                            setDocumentIds(ids);
                          }}
                          label={t('vehicles.additional_attachments')}
                          uploadType="box"
                          autoUpload={true}
                          maxItems={5}
                          removable={true}
                        />
                        {touched.documentIds && errors.documentIds && (
                          <Text style={styles.errorText}>{String(errors.documentIds)}</Text>
                        )}
                      </>
                    )}

                    {(values.type === BOOKMARK_TYPES.NOTES || values.type === BOOKMARK_TYPES.OTHER) && (
                      <CustomInput
                        label={t('bookmarks.notes_label')}
                        placeholder={t('bookmarks.notes_placeholder')}
                        value={values.notes}
                        onChangeText={handleChange('notes')}
                        onBlur={handleBlur('notes')}
                        multiline
                        numberOfLines={6}
                        labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                        inputStyle={{ textAlign: isRTL ? 'right' : 'left', height: '100%' }}
                        inputContainerStyle={{ height: 120, paddingVertical: 10 }}
                        error={touched.notes && errors.notes ? String(errors.notes) : undefined}
                      />
                    )}

                    {/* Start Date / End Date */}
                    <View style={{ flexDirection: 'row', marginBottom: 12, marginTop: 8 }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>{t('common.start_date')}</Text>
                        <CustomDateTimePicker
                          value={values.startDate}
                          onChange={(d) => setFieldValue('startDate', d)}
                          placeholder={t('common.start_date')}
                          displayFormat="MM/DD/YYYY"
                          suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>{t('common.end_date')}</Text>
                        <CustomDateTimePicker
                          value={values.endDate}
                          onChange={(d) => setFieldValue('endDate', d)}
                          placeholder={t('common.end_date')}
                          displayFormat="MM/DD/YYYY"
                          suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                        />
                        {touched.endDate && errors.endDate && (
                          <Text style={styles.errorText}>{String(errors.endDate)}</Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={commonStyles.buttonsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.changeCredentialsButton,
                        {
                          backgroundColor: themeColors?.isDark ? darkenColor(themeColors.lightCGreen, 0.6) : getColorWithOpacity(themeColors.primary, 0.5),
                          borderColor: themeColors.primary,
                        },
                      ]}
                      onPress={handleChangeCredentials}
                    >
                      <Text style={styles.changeCredentialsText}>
                        {t('bookmarks.change_credentials')}
                      </Text>
                    </TouchableOpacity>

                    <RecordNotesField notes={recordNotes} />
                    <RecordLinksField links={links} />
                    <PrimaryButton
                      title={
                        update_bookmark_status === ASYNC_STATUS.LOADING
                          ? ''
                          : t('bookmarks.save_changes')
                      }
                      onPress={handleSubmit}
                      disabled={update_bookmark_status === ASYNC_STATUS.LOADING}
                      loading={update_bookmark_status === ASYNC_STATUS.LOADING}
                    />
                  </View>
                </>
              )}
            </Formik>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Credentials Modal */}
      <Modal
        visible={credentialsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          Keyboard.dismiss();
          setCredentialsModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          style={commonStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          </TouchableWithoutFeedback>
          <View style={commonStyles.modalContent}>
            <Text style={commonStyles.modalTitle}>{t('bookmarks.username')}</Text>
            <CustomInput
              placeholder={t('bookmarks.username_placeholder')}
              value={username}
              onChangeText={setUsername}
              containerStyle={commonStyles.modalInput}
            />

            <Text style={commonStyles.modalTitle}>{t('bookmarks.password')}</Text>
            <CustomInput
              placeholder={t('bookmarks.password_placeholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              containerStyle={commonStyles.modalInput}
              password
            />

            <View style={commonStyles.modalButtons}>
              <TouchableOpacity
                style={commonStyles.cancelButton}
                onPress={() => setCredentialsModalVisible(false)}
              >
                <Text style={commonStyles.cancelButtonText}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  commonStyles.addButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleSaveCredentials}
              >
                <Text style={commonStyles.addButtonText}>{t('bookmarks.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
};

export default EditBookMark;
