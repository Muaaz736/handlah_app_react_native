import React, { useState, useRef, useMemo } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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
import { AddPetVaccinationScreenProps } from './addPetVaccinationScreen.types';
import { useDispatch, useSelector } from 'react-redux';
import {
  addPetVaccinationAsync,
  editPetVaccinationAsync,
} from '../../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../PetsScreen.styles';
import { makeAddPetVaccinationScreenStyles } from './AddPetVaccinationScreen.styles';
import colors from '../../../../../../utils/colors';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

const AddPetVaccinationScreen: React.FC<AddPetVaccinationScreenProps> = ({
  navigation,
  route,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeAddPetVaccinationScreenStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();

  const petData = route?.params?.petData || {};
  const petId = route?.params?.petId || petData?.id;
  const isEdit = route?.params?.isEdit || false;
  const vaccine = route?.params?.vaccine || null;
  const fromPetsScreen = route?.params?.fromPetsScreen || false;
  const ownerUserId = (route?.params as any)?.ownerUserId;
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.PetVaccination,
      recordId: isEdit && vaccine?.id ? Number(vaccine.id) : null,
      businessId: null,
      enabled: !ownerUserId,
  });
  // Notes' "Encrypt notes" choice; saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.PetVaccination, recordId: isEdit && vaccine?.id ? Number(vaccine.id) : null, enabled: links.enabled });

  const { add_pet_vaccination_status, edit_pet_vaccination_status } =
    useSelector((state: any) => state.essentials_slice);
  const isLoading =
    add_pet_vaccination_status === ASYNC_STATUS.LOADING ||
    edit_pet_vaccination_status === ASYNC_STATUS.LOADING;

  const formikRef = useRef<FormikProps<any>>(null);

  const initialValues = {
    vaccineName: isEdit && vaccine ? vaccine.vaccinename : '',
    dateGiven: isEdit && vaccine ? vaccine.dategiven : '',
    nextDate: isEdit && vaccine ? vaccine.nextdate : '',
    photoUrls: (() => {
      const raw = isEdit && vaccine ? vaccine.photourl : null;
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      return [raw];
    })(),
  };

  // Handlers
  const handleAddVaccine = (values: typeof initialValues) => {
    if (values.vaccineName && values.dateGiven && petId) {
      const vaccinationPayload = {
        vaccineName: values.vaccineName,
        dateGiven: values.dateGiven,
        nextDate: values.nextDate || undefined,
        photoUrl: values.photoUrls.length > 0 ? values.photoUrls : undefined,
      };

      if (isEdit && vaccine?.id) {
        dispatch(
          editPetVaccinationAsync({
            petId,
            vaccinationId: vaccine.id,
            data: vaccinationPayload,
          }),
        ).then((action: any) => {
            saveLinksAfter(links, action, vaccine.id, undefined, recordNotes);
          if (action.type === editPetVaccinationAsync.fulfilled.type) {
            navigation.goBack();
          }
        });
      } else {
        dispatch(
          addPetVaccinationAsync({
            petId,
            data: {
              ...vaccinationPayload,
              ...(ownerUserId ? { ownerUserId } : {}),
            },
          }),
        ).then((action: any) => {
            saveLinksAfter(links, action, undefined, undefined, recordNotes);
          if (action.type === addPetVaccinationAsync.fulfilled.type) {
            if (fromPetsScreen) {
              navigation.goBack();
            } else {
              (navigation as any).navigate('AddPetMedication', {
                petData: { ...petData },
                petId,
              });
            }
          }
        });
      }
    }
  };

  const handleSkip = () => {
    if (fromPetsScreen) {
      navigation.goBack();
    } else {
      (navigation as any).navigate('AddPetMedication', {
        petData: { ...petData, vaccinations: [] },
        petId,
      });
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header with Skip Button */}
      <View style={[styles.header]}>
        <AuthHeader
          onBackPress={() => navigation.goBack()}
          containerStyle={{
            paddingHorizontal: 0,
            paddingTop: 0,
            marginBottom: 0,
            flex: 1,
          }}
          title={
            isEdit
              ? t('pets.update_vaccination')
              : t('pets.vaccination')
          }
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
            <Text
              style={[
                commonStyles.skipButtonText,
                { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary },
              ]}
            >
              {t('common.skip_this')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -10 : 0}
      >

        <ScrollView
          style={commonStyles.scrollView}
          contentContainerStyle={commonStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={validationSchema('pet_vaccination')}
            onSubmit={handleAddVaccine}
          >
            {({
              handleChange,
              setFieldValue,
              values,
              touched,
              errors,
            }) => (
              <>
                {/* Vaccine Input */}
                <View style={commonStyles.inputGroup}>
                  <CustomInput
                    value={values.vaccineName}
                    onChangeText={handleChange('vaccineName')}
                    placeholder={t('pets.vaccine_placeholder')}
                    label={`${t('pets.vaccine_name')} *`}
                    labelStyle={{ textAlign: 'left' }}
                    error={
                      touched.vaccineName && errors.vaccineName
                        ? String(errors.vaccineName)
                        : undefined
                    }
                  />
                </View>

                {/* Dates Row */}
                <View style={commonStyles.datesRow}>
                  <View style={commonStyles.dateGroup}>
                    <Text
                      style={[
                        commonStyles.label,
                        { textAlign: 'left' },
                      ]}
                    >
                      {t('pets.date_given')} *
                    </Text>

                    <CustomDateTimePicker
                      value={values.dateGiven}
                      onChange={(val: any) =>
                        setFieldValue('dateGiven', val)
                      }
                      placeholder={t('pets.select_type')}
                      displayFormat="MM/DD/YYYY"
                      error={
                        touched.dateGiven && errors.dateGiven
                          ? String(errors.dateGiven)
                          : undefined
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
                    <Text
                      style={[
                        commonStyles.label,
                        { textAlign: 'left' },
                      ]}
                    >
                      {t('pets.next_date')}
                    </Text>

                    <CustomDateTimePicker
                      value={values.nextDate}
                      onChange={(val: any) =>
                        setFieldValue('nextDate', val)
                      }
                      placeholder={t('pets.select_type')}
                      displayFormat="MM/DD/YYYY"
                      error={
                        touched.nextDate && errors.nextDate
                          ? String(errors.nextDate)
                          : undefined
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
                </View>

                {/* Upload Section */}
                <View style={commonStyles.uploadSection}>
                  <Text
                    style={[
                      commonStyles.label,
                      { textAlign: 'left' },
                    ]}
                  >
                    {t('pets.upload_photo')}
                  </Text>

                  <MixedMediaUploader
                    mediaIds={values.photoUrls}
                    onMediaChange={(ids: string[]) =>
                      setFieldValue('photoUrls', ids)
                    }
                    uploadType="box"
                    maxItems={5}
                    autoUpload={true}
                    removable={true}
                  />
                </View>
              </>
            )}
          </Formik>
        <RecordNotesField notes={recordNotes} />
        <RecordLinksField links={links} />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={commonStyles.footer}>
          {isEdit ? (
            <PrimaryButton
              title={t('common.update')}
              onPress={() => formikRef.current?.handleSubmit()}
              buttonStyle={{
                backgroundColor: themeColors.primary,
              }}
              loading={isLoading}
              disabled={isLoading}
            />
          ) : (
            <OfflineChainGuard isWizardMode={!fromPetsScreen}>
              <PrimaryButton
                title={
                  fromPetsScreen
                    ? t('common.save')
                    : t('pets.continue')
                }
                onPress={() => formikRef.current?.handleSubmit()}
                loading={isLoading}
                disabled={isLoading}
                buttonStyle={{
                  backgroundColor: themeColors.primary,
                }}
              />
            </OfflineChainGuard>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddPetVaccinationScreen;
