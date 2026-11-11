import React, { FC, useCallback, useEffect, useState, useMemo } from 'react';
import { useRecordNotes } from '../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../components/notes/RecordNotesField';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  CustomInput,
  CustomDropDown,
  PrimaryButton,
  DocumentPicker,
  CustomDateTimePicker,
  MixedMediaUploader,
} from '../../../../../components/common';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { makeCommonStyles } from './BookMarks.styles';
import { makeAddBookMarkStyles } from './AddBookMark.styles';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import {
  createBookmarkAsync,
  bookmarksAsync,
} from '../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { showSuccessAlert } from '../../../../../utils/AlertHelper';
import {
  IAddBookmarkScreenProps,
  ITypeOption,
  IUserRoleHookReturn,
  BookmarkType,
} from './bookmarks.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../utils/validationSchemas';
import { setCreateBookmarkStatus } from '../../../../../redux/slices/essentialsSlice';
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

const AddBookMark: FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const ownerUserId = (route?.params as any)?.ownerUserId;
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeAddBookMarkStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.Bookmark,
      recordId: null,
      // From a record's Linked records: "Add bookmark" links the new bookmark back to that record.
      preselectKey: (route?.params as any)?.linkTo ?? null,
      businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
      enabled: !ownerUserId,
  });
  // Notes (separate from a note bookmark's text) with the "Encrypt notes" choice; saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Bookmark, recordId: null, enabled: links.enabled });

  // Check if user is in business mode
  const isBusiness = isBusinessRole();
  const [documentIds, setDocumentIds] = useState<string[]>([]);
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string | number | null>(BOOKMARK_TYPES.URL);
  const [url, setUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [credentialsModalVisible, setCredentialsModalVisible] =
    useState<boolean>(false);

  const { create_bookmark_status } = useSelector(
    (state: any) => state.essentials_slice,
  );

  const typeOptions: ITypeOption[] = [
    { label: t('bookmarks.types.url'), value: BOOKMARK_TYPES.URL },
    { label: t('bookmarks.types.document'), value: BOOKMARK_TYPES.DOCUMENT },
    { label: t('bookmarks.types.notes'), value: BOOKMARK_TYPES.NOTES },
    { label: t('bookmarks.types.other'), value: BOOKMARK_TYPES.OTHER },
  ];

  const handleAddCredentials = useCallback(() => {
    setCredentialsModalVisible(true);
  }, []);

  const handleSaveCredentials = useCallback(() => {
    setCredentialsModalVisible(false);
  }, []);

  const formikRef =
    React.useRef<FormikProps<{ title: string; type: string | number | null; url: string; notes: string; documentIds: string[]; startDate?: Date; endDate?: Date }>>(null);

  const formikInitialValues = {
    title: '',
    type: BOOKMARK_TYPES.URL as string | number | null,
    url: '',
    notes: '',
    documentIds: [] as string[],
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  };

  const handleAddBookmark = useCallback(
    (formValues: { title: string; type: string | number | null; url: string; notes: string; documentIds: string[]; startDate?: Date; endDate?: Date }) => {
      const { title: formTitle, type: formType } = formValues;

      // Prepare bookmark data with new schema
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

      // Dispatch create bookmark async
      dispatch(
        createBookmarkAsync({
          ...bookmarkData,
          ...(ownerUserId ? { ownerUserId } : {}),
        }),
      ).then((a: any) => saveLinksAfter(links, a, undefined, undefined, recordNotes));
    },
    [url, notes, username, password, documentIds, dispatch, links],
  );

  useEffect(() => {
    if (create_bookmark_status === ASYNC_STATUS.SUCCEEDED) {
      showSuccessAlert(t('bookmarks.created_success'), 'Success');
      // Reset form fields
      formikRef.current?.resetForm();
      setTitle('');
      setType(BOOKMARK_TYPES.URL);
      setUrl('');
      setDocumentIds([]);
      setNotes('');
      setUsername('');
      setPassword('');
      formikRef.current?.setFieldValue('url', '');
      formikRef.current?.setFieldValue('notes', '');
      formikRef.current?.setFieldValue('documentIds', []);
      const businessIdParam =
        isBusiness && selectedBusinessId ? selectedBusinessId : undefined;
      dispatch(bookmarksAsync(businessIdParam));
      dispatch(setCreateBookmarkStatus());
      navigation.goBack();
    }
  }, [create_bookmark_status, isBusiness, selectedBusinessId]);

  const renderConditionalFields = (): React.ReactElement | null => {
    if (type === BOOKMARK_TYPES.URL) {
      return (
        <CustomInput
          label={t('bookmarks.url_label')}
          placeholder={t('bookmarks.url_placeholder')}
          value={url}
          onChangeText={setUrl}
          keyboardType="url"
          autoCapitalize="none"
        />
      );
    }

    if (type === BOOKMARK_TYPES.DOCUMENT) {
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
    }

    if (type === BOOKMARK_TYPES.NOTES) {
      return (
        <CustomInput
          label={t('bookmarks.notes_label')}
          placeholder={t('bookmarks.notes_placeholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={6}
          inputStyle={styles.notesInput}
          inputContainerStyle={{ height: 120, paddingVertical: 10 }}
        />
      );
    }

    if (type === BOOKMARK_TYPES.OTHER) {
      return (
        <CustomInput
          label={t('bookmarks.notes_label')}
          placeholder={t('bookmarks.notes_placeholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={6}
          inputStyle={styles.notesInput}
          inputContainerStyle={{ height: 120, paddingVertical: 10 }}
        />
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

        {/* Content */}
        <KeyboardAvoidingView
        style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            style={commonStyles.scrollView}
            contentContainerStyle={commonStyles.scrollContent}
          >
            <Text style={commonStyles.title}>{t('bookmarks.add_bookmark')}</Text>
            <Text style={commonStyles.subtitle}>{t('bookmarks.subtitle')}</Text>
            <Formik
              innerRef={formikRef}
              initialValues={formikInitialValues}
              validationSchema={validationSchema('bookmark')}
              onSubmit={handleAddBookmark}
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
                      <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                        {t('bookmarks.type')} *
                      </Text>
                      <CustomDropDown
                        placeholder={t('bookmarks.type')}
                        value={values.type as string}
                        onSelect={(selectedValue: any) => {
                          setFieldValue('type', selectedValue);
                          setType(selectedValue);
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
                        inputStyle={styles.notesInput}
                        inputContainerStyle={{ height: 120, paddingVertical: 10 }}
                        error={touched.notes && errors.notes ? String(errors.notes) : undefined}
                      />
                    )}

                    {/* Start Date / End Date */}
                    <View style={{ flexDirection: 'row', marginVertical: 12 }}>
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
                        styles.addCredentialsButton,
                        {
                          backgroundColor: themeColors?.isDark ? darkenColor(themeColors.lightCGreen, 0.6) : getColorWithOpacity(themeColors.primary, 0.5),
                          borderColor: themeColors.primary,
                        },
                      ]}
                      onPress={handleAddCredentials}
                    >
                      <Text style={styles.addCredentialsText}>
                        {t('bookmarks.add_credentials')}
                      </Text>
                    </TouchableOpacity>

                    <RecordNotesField notes={recordNotes} />
                    <RecordLinksField links={links} />
                    <PrimaryButton
                      title={
                        create_bookmark_status === ASYNC_STATUS.LOADING
                          ? ''
                          : t('bookmarks.add_bookmark')
                      }
                      onPress={handleSubmit}
                      disabled={create_bookmark_status === ASYNC_STATUS.LOADING}
                      loading={create_bookmark_status === ASYNC_STATUS.LOADING}
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
              returnKeyType="next"
            />

            <Text style={commonStyles.modalTitle}>{t('bookmarks.password')}</Text>
            <CustomInput
              placeholder={t('bookmarks.password_placeholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              containerStyle={commonStyles.modalInput}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              password
            />

            <View style={commonStyles.modalButtons}>
              <TouchableOpacity
                style={commonStyles.cancelButton}
                onPress={() => {
                  Keyboard.dismiss();
                  setCredentialsModalVisible(false);
                }}
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
                onPress={() => {
                  Keyboard.dismiss();
                  handleSaveCredentials();
                }}
              >
                <Text style={commonStyles.addButtonText}>{t('bookmarks.add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
};

export default AddBookMark;
