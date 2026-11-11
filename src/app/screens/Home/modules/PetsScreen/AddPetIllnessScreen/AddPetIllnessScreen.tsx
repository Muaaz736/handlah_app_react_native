import React, { useState, useRef, useMemo } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../../components/notes/RecordNotesField';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  CustomInput,
  CustomDateTimePicker,
  PrimaryButton,
  MixedMediaUploader,
  AuthHeader,
  OfflineChainGuard,
} from '../../../../../../components/common';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { AddPetIllnessProps } from './addPetIllness.types';
import { useDispatch, useSelector } from 'react-redux';
import {
  addPetIllnessAsync,
  editPetIllnessAsync,
} from '../../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { CommonActions } from '@react-navigation/native';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../PetsScreen.styles';
import { makeAddPetIllnessScreenStyles } from './AddPetIllnessScreen.styles';
import colors from '../../../../../../utils/colors';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

const AddPetIllnessScreen: React.FC<AddPetIllnessProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeAddPetIllnessScreenStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();

  const petData: any = route.params?.petData || {};
  const petId = route.params?.petId || petData?.id;
  const isEdit = route?.params?.isEdit || false;
  const illness = route?.params?.illness || null;
  const fromPetsScreen = route?.params?.fromPetsScreen || false;
  const ownerUserId = (route?.params as any)?.ownerUserId;
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.PetIllness,
      recordId: isEdit && illness?.id ? Number(illness.id) : null,
      businessId: null,
      enabled: !ownerUserId,
  });
  // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.PetIllness, recordId: isEdit && illness?.id ? Number(illness.id) : null, enabled: links.enabled, choiceOnly: true });

  const { add_pet_illness_status, edit_pet_illness_status } = useSelector(
    (state: any) => state.essentials_slice,
  );
  const isLoading =
    add_pet_illness_status === ASYNC_STATUS.LOADING ||
    edit_pet_illness_status === ASYNC_STATUS.LOADING;

  const formikRef = useRef<FormikProps<any>>(null);

  const initialValues = {
    date: isEdit && illness ? illness.date : '',
    diagnosis: isEdit && illness ? illness.diagnosis || '' : '',
    treatments: isEdit && illness ? illness.treatments || '' : '',
    notes: isEdit && illness ? illness.notes || '' : '',
    photoUrls: (() => {
      const raw = isEdit && illness ? illness.photourl : null;
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      return [raw];
    })(),
  };

  const handleAddIllness = (values: typeof initialValues) => {
    if (values.date && values.diagnosis && petId) {
      const illnessPayload = {
        date: values.date,
        diagnosis: values.diagnosis,
        treatments: values.treatments || undefined,
        notes: values.notes || undefined,
        photoUrl: values.photoUrls.length > 0 ? values.photoUrls : undefined,
      };

      if (isEdit && illness?.id) {
        dispatch(
          editPetIllnessAsync({
            petId,
            illnessId: illness.id,
            data: illnessPayload,
          }),
        ).then((action: any) => {
            saveLinksAfter(links, action, illness.id, undefined, recordNotes);
          if (action.type === editPetIllnessAsync.fulfilled.type) {
            navigation.goBack();
          }
        });
      } else {
        dispatch(
          addPetIllnessAsync({
            petId,
            data: {
              ...illnessPayload,
              ...(ownerUserId ? { ownerUserId } : {}),
            },
          }),
        ).then((action: any) => {
            saveLinksAfter(links, action, undefined, undefined, recordNotes);
          if (action.type === addPetIllnessAsync.fulfilled.type) {
            fromPetsScreen ? navigation.goBack() : navigation.navigate('Pets');
          }
        });
      }
    }
  };

  const handleSkip = () => {
    fromPetsScreen ? navigation.goBack() : navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Dashboard' },
          { name: 'Pets' }
        ],
      })
    );;
  };

  return (
    <SafeAreaView style={commonStyles.container}>

      {/* Header with Skip Button */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
      }}>
        <AuthHeader
          onBackPress={() => navigation.goBack()}
          containerStyle={commonStyles.header}
          title={isEdit ? t('pets.update_illness') : t('pets.illness_conditions')}
          titleStyle={commonStyles.HeaderTitle}
          backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
        />
        {!isEdit && !fromPetsScreen && (
          <TouchableOpacity
            style={[
              commonStyles.skipButton,
              {
                borderColor: themeColors?.isDark ? themeColors.primary : themeColors.secondary,
                backgroundColor: themeColors?.isDark ? themeColors.primary + '10' : themeColors.secondary + '10',
              },
            ]}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <Text style={[commonStyles.skipButtonText, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}>{t('common.skip_this')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -10 : 0}>
        <ScrollView
          style={commonStyles.scrollView}
          contentContainerStyle={commonStyles.scrollContent}
        >
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={validationSchema('pet_illness')}
            onSubmit={handleAddIllness}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleSubmit,
              setFieldValue,
            }) => (
              <>
                {/* Date and Diagnosis Row */}
                <View style={commonStyles.datesRow}>
                  <View style={commonStyles.dateGroup}>
                    <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                      {t('pets.date_diagnosed')} *
                    </Text>
                    <CustomDateTimePicker
                      value={values.date}
                      onChange={(val: any) =>
                        setFieldValue('date', val as string)
                      }
                      placeholder={t('pets.date_placeholder')}
                      displayFormat="MM/DD/YYYY"
                      error={
                        touched.date && errors.date ? String(errors.date) : ''
                      }
                      suffixIcon={
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color={themeColors.textSecondary}
                        />
                      }
                    />
                  </View>
                  <View style={commonStyles.dateGroup}>
                    <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                      {t('pets.diagnosis')} *
                    </Text>
                    <CustomInput
                      value={values.diagnosis}
                      onChangeText={handleChange('diagnosis')}
                      placeholder={t('pets.diagnosis_placeholder')}
                      error={
                        touched.diagnosis && errors.diagnosis
                          ? String(errors.diagnosis)
                          : ''
                      }
                    />
                  </View>
                </View>

                {/* Treatment Input */}
                <View style={commonStyles.inputGroup}>
                  <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                    {t('pets.treatment')}
                  </Text>
                  <CustomInput
                    value={values.treatments}
                    onChangeText={handleChange('treatments')}
                    placeholder={t('pets.treatment_placeholder')}
                  />
                </View>

                {/* Notes Input */}
                <View style={commonStyles.inputGroup}>
                  <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                    {t('pets.notes')}
                  </Text>
                  <TextInput
                    value={values.notes}
                    onChangeText={handleChange('notes')}
                    placeholder={t('pets.notes_placeholder')}
                    placeholderTextColor="#999999"
                    multiline
                    numberOfLines={4}
                    style={[commonStyles.textArea]}
                  />
                </View>

                {/* Upload Section */}
                <View style={commonStyles.uploadSection}>
                  <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                    {t('pets.upload_photo')}
                  </Text>
                  <MixedMediaUploader
                    mediaIds={values.photoUrls}
                    onMediaChange={(ids: string[]) => setFieldValue('photoUrls', ids)}
                    uploadType="box"
                    maxItems={5}
                    autoUpload={true}
                    removable={true}
                  />
                </View>
              </>
            )}
          </Formik>
        <RecordNotesEncryptRow notes={recordNotes} />
        <RecordLinksField links={links} />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={commonStyles.footer}>
          {isEdit ? (
            <PrimaryButton
              title={t('common.update')}
              onPress={() => formikRef.current?.handleSubmit()}
              buttonStyle={{ backgroundColor: themeColors.primary }}
            />
          ) : (
            <OfflineChainGuard isWizardMode={!fromPetsScreen}>
              <PrimaryButton
                title={fromPetsScreen ? t('common.save') : t('pets.done')}
                onPress={() => formikRef.current?.handleSubmit()}
                loading={isLoading}
                disabled={isLoading}
                buttonStyle={{ backgroundColor: themeColors.primary }}
              />
            </OfflineChainGuard>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddPetIllnessScreen;
