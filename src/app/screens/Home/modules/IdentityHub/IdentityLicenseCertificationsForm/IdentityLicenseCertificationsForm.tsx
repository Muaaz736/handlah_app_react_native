import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTutorialContext } from '../../../../../../tutorial/TutorialContext';
import { makeTutorialHintStyles } from '../IdentityPassportForm/IdentityPassportForm.styles';
import * as Yup from 'yup';
import ScreenWrapper from '../../../../../../components/ScreenWrapper/ScreenWrapper';
import {
  AuthHeader,
  MixedMediaUploader,
  PrimaryButton,
  CustomInput,
  CustomDateTimePicker,
  CustomDropDown,
  CustomReminderPicker,
} from '../../../../../../components/common';
import colors, { getColorWithOpacity } from '../../../../../../utils/colors';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import {
  IdentityLicenseCertificationsFormNavigationProp,
} from './IdentityLicenseCertificationsForm.types';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import {
  getDropdownOptionsAsync,
  identityHubAsync,
  licensesAsync,
  updateLicenseAsync,
  countriesAsync,
  statesAsync,
} from '../../../../../../redux/services/authService';
import validationSchema from '../../../../../../utils/validationSchemas';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { isOtherSelected, findDefaultCountry } from '../../../../../../utils/helpers';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../IdentityHub.styles';
import { makeIdentityLicenseCertificationsFormStyles } from './IdentityLicenseCertificationsForm.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';


const licenseCountryKey = (id: number | string) => `license_country_${id}`;

const licenseStateKey = (id: number | string) => `license_state_${id}`;

const IdentityLicenseCertificationsForm: React.FC = () => {
  const navigation =
    useNavigation<IdentityLicenseCertificationsFormNavigationProp>();

  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const tutorialHintStyles = useMemo(() => makeTutorialHintStyles(themeColors as RoleTheme), [themeColors]);
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeIdentityLicenseCertificationsFormStyles(themeColors as RoleTheme), [themeColors]);

  // Tutorial
  const { step: tutorialStep, nextStep: nextTutorialStep } = useTutorialContext();
  const [showTutorialHint, setShowTutorialHint] = useState(
    tutorialStep === 'passport_form_hint',
  );
  // End tutorial

  const params = route.params;

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('LicenseCertificationType'));
    dispatch(countriesAsync());
  }, [dispatch]));


  const { mode, licenseData: paramLicenseData, entityId } = (params || {}) as any;
  const isEditMode = mode === 'edit';

  const [resolvedLicenseData, setResolvedLicenseData] = useState<any>(paramLicenseData || null);
  const [isFetchingEntity, setIsFetchingEntity] = useState(false);
  const licenseData = resolvedLicenseData;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.LicenseCertification,
        recordId: isEditMode && licenseData?.id ? Number(licenseData.id) : null,
        businessId: null,
        enabled: true,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.LicenseCertification, recordId: isEditMode && licenseData?.id ? Number(licenseData.id) : null, enabled: links.enabled });

  useEffect(() => {
    if (!isEditMode || !entityId || paramLicenseData) return;
    setIsFetchingEntity(true);
    dispatch(identityHubAsync({}))
      .unwrap()
      .then((data: any) => {
        const list = Array.isArray(data?.licensescertifications) ? data.licensescertifications : [];
        const found = list.find((l: any) => l.id === entityId);
        if (found) {
          setResolvedLicenseData({
            id: found.id,
            type: found.type,
            typeOther: found.typeother,
            licenseCertNumber: found.licensenumber,
            jurisdiction: found.jurisdiction,
            issuerAuthority: found.issuerauthority,
            expirationDate: found.expirationdate,
            country: found.jurisdictioncountry,
            imageId: Array.isArray(found.imageurl) ? found.imageurl[0] ?? '' : found.imageurl,
            imageIds: Array.isArray(found.imageurl) ? found.imageurl : found.imageurl ? [found.imageurl] : [],
            remindBefore: found.reminderdaysbefore || 90,
            isAddedInWallet: found.isaddedinwallet,
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsFetchingEntity(false));
  }, [isEditMode, entityId, paramLicenseData, dispatch]);

  // The `licenses` row below is seeded once at mount from whatever
  // licenseData was available synchronously — when it only resolves later
  // (the entityId fetch above), push it into the row once it lands.
  useEffect(() => {
    if (!resolvedLicenseData || paramLicenseData) return;
    setLicenses(prev =>
      prev.map((l, i) => (i === 0
        ? {
          ...l,
          dbId: resolvedLicenseData.id,
          type: resolvedLicenseData.type ? String(resolvedLicenseData.type) : l.type,
          licenseCertNumber: resolvedLicenseData.licenseCertNumber || l.licenseCertNumber,
          jurisdiction: resolvedLicenseData.jurisdiction || l.jurisdiction,
          issuerAuthority: resolvedLicenseData.issuerAuthority || l.issuerAuthority,
          expirationDate: resolvedLicenseData.expirationDate || l.expirationDate,
          country: resolvedLicenseData.country || l.country,
          state: resolvedLicenseData.state || resolvedLicenseData.jurisdiction || l.state,
          addToWallet: resolvedLicenseData.isAddedInWallet !== undefined ? resolvedLicenseData.isAddedInWallet : l.addToWallet,
          remindBefore: resolvedLicenseData.remindBefore ? `${resolvedLicenseData.remindBefore}` : l.remindBefore,
          mediaIds: resolvedLicenseData.mediaIds ?? resolvedLicenseData.imageIds ?? (resolvedLicenseData.imageId ? [resolvedLicenseData.imageId] : l.mediaIds),
          typeother: resolvedLicenseData.typeother || resolvedLicenseData.typeOther || l.typeother,
        }
        : l)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedLicenseData]);

  const { licenses_status, get_dropdown_options_data, countries_data } = useSelector((state: any) => state.user_auth);
  const isLoading = licenses_status === ASYNC_STATUS.LOADING || isFetchingEntity;

  type LicenseErrors = Record<string, string>;

  const [licenses, setLicenses] = useState<any[]>(
    isEditMode && licenseData
      ? [
        {
          id: 1,
          dbId: licenseData.id,
          type: licenseData.type ? String(licenseData.type) : '',
          licenseCertNumber: licenseData.licenseCertNumber || '',
          jurisdiction: licenseData.jurisdiction || '',
          issuerAuthority: licenseData.issuerAuthority || '',
          expirationDate: licenseData.expirationDate || '',
          country: licenseData.country || '',
          state: licenseData.state || licenseData.jurisdiction || '',
          stateOptions: [] as { label: string; value: string }[],
          addToWallet:
            licenseData.isAddedInWallet !== undefined
              ? licenseData.isAddedInWallet
              : true,
          remindBefore: licenseData.remindBefore
            ? `${licenseData.remindBefore}`
            : '90',
          mediaIds: licenseData.mediaIds ?? licenseData.imageIds ?? (licenseData.imageId ? [licenseData.imageId] : []),
          typeother: licenseData.typeother || licenseData.typeOther || '',
        },
      ]
      : [
        {
          id: 1,
          type: '',
          licenseCertNumber: '',
          jurisdiction: '',
          issuerAuthority: '',
          expirationDate: '',
          country: '',
          state: '',
          stateOptions: [] as { label: string; value: string }[],
          addToWallet: true,
          remindBefore: '90',
          mediaIds: [] as string[],
          typeother: '',
        },
      ],
  );

  const [licenseErrors, setLicenseErrors] = useState<LicenseErrors[]>([{}]);

 
  const loadStatesForRow = useCallback(
    async (index: number, countryName: string) => {
      const match = countries_data?.find((c: any) => c.countryname === countryName);
      if (!match?.id) return;
      try {
        const res: any = await dispatch(statesAsync(String(match.id) as any)).unwrap();
        const opts = (res?.states || []).map((s: any) => ({
          label: s.description,
          value: String(s.id),
        }));
        setLicenses(prev =>
          prev.map((l, i) => (i === index ? { ...l, stateOptions: opts } : l)),
        );
      } catch {
        // states fetch failure is non-blocking
      }
    },
    [countries_data, dispatch],
  );

  
  // Tracks whether the edit-mode AsyncStorage country/state lookup (below)
  // has finished, so the United-States default effect doesn't race it.
  const [countryRestoreChecked, setCountryRestoreChecked] = useState(
    !(isEditMode && licenseData?.id),
  );

  useEffect(() => {
    if (!isEditMode || !licenseData?.id) return;
    Promise.all([
      AsyncStorage.getItem(licenseCountryKey(licenseData.id)),
      AsyncStorage.getItem(licenseStateKey(licenseData.id)),
    ]).then(([storedCountry, storedState]) => {
      if (storedCountry) {
        setLicenses(prev =>
          prev.map((l, i) => (i === 0 && !l.country ? { ...l, country: storedCountry } : l)),
        );
        loadStatesForRow(0, storedCountry);
      }
      if (storedState) {
        setLicenses(prev =>
          prev.map((l, i) => (i === 0 && !l.state ? { ...l, state: storedState } : l)),
        );
      }
    }).finally(() => setCountryRestoreChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, licenseData?.id]);

  useEffect(() => {
    if (!countryRestoreChecked || !countries_data) return;
    const usCountry = findDefaultCountry(countries_data);
    if (!usCountry) return;
    setLicenses(prev =>
      prev.some(l => !l.country)
        ? prev.map(l => (l.country ? l : { ...l, country: usCountry.countryname }))
        : prev,
    );
  }, [countryRestoreChecked, countries_data]);


  useEffect(() => {
    if (!countries_data) return;
    licenses.forEach((l, i) => {
      if (l.country && (!l.stateOptions || l.stateOptions.length === 0)) {
        loadStatesForRow(i, l.country);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries_data]);

  const handleInputChange = (index: number, field: string, value: any) => {
    setLicenses(prev =>
      prev.map((license, i) =>
        i === index ? { ...license, [field]: value } : license,
      ),
    );
    setLicenseErrors(prev =>
      prev.map((errors, i) => {
        if (i === index && errors[field]) {
          const { [field]: _, ...rest } = errors;
          return rest;
        }
        return errors;
      }),
    );
  };

  const handleAddLicense = () => {
    const usCountry = findDefaultCountry(countries_data);
    const newLicense = {
      id: licenses.length + 1,
      type: '',
      licenseCertNumber: '',
      jurisdiction: '',
      issuerAuthority: '',
      expirationDate: '',
      country: usCountry?.countryname || '',
      state: '',
      stateOptions: [] as { label: string; value: string }[],
      addToWallet: true,
      remindBefore: '90',
      mediaIds: [] as string[],
      typeother: '',
    };
    setLicenses(prev => [...prev, newLicense]);
    setLicenseErrors(prev => [...prev, {}]);
  };

  const handleMediaChange = useCallback((index: number, ids: string[]) => {
    setLicenses(prev =>
      prev.map((l, i) => (i === index ? { ...l, mediaIds: ids } : l)),
    );
  }, []);
  const validateAllLicenses = async (): Promise<boolean> => {
    const schema = validationSchema('identity_license_certification');
    const allErrors: LicenseErrors[] = [];
    let hasErrors = false;

    for (const license of licenses) {
      try {
        await schema.validate(license, { abortEarly: false });
        allErrors.push({});
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const fieldErrors: LicenseErrors = {};
          err.inner.forEach(e => {
            if (e.path) fieldErrors[e.path] = e.message;
          });
          allErrors.push(fieldErrors);
          hasErrors = true;
        } else {
          allErrors.push({});
        }
      }
    }

    setLicenseErrors(allErrors);
    return !hasErrors;
  };

  const handleSaveIdentity = async () => {
    const isValid = await validateAllLicenses();
    if (!isValid) return;

    try {
      if (isEditMode && licenses[0].dbId) {
        const license = licenses[0];

        if (isOtherSelected(get_dropdown_options_data?.find((opt: any) => String(opt.value) === String(license.type))?.label)) {
          if (!license.typeother?.trim()) {
            setLicenseErrors([{ typeother: t('common.field_required') || 'Please specify the type' }]);
            return;
          }
        }

        let formattedDate = null;
        if (license.expirationDate) {
          if (typeof license.expirationDate === 'string') {
            formattedDate = license.expirationDate;
          } else if (license.expirationDate instanceof Date) {
            formattedDate = license.expirationDate.toISOString();
          }
        }

        const payload = {
          licenseNumber: license.licenseCertNumber,
          type: license.type,
          jurisdiction: String(license.state),
          issuerAuthority: license.issuerAuthority,
          expirationDate: formattedDate,
          isAddedInWallet: license.addToWallet,
          reminderDaysBefore: parseInt(license.remindBefore, 10) || 90,
          ...(isOtherSelected(get_dropdown_options_data?.find((opt: any) => String(opt.value) === String(license.type))?.label)
            ? { typeOther: license.typeother }
            : {}),
        } as any;

        payload.imageUrl = license.mediaIds ?? [];

        await dispatch(
          updateLicenseAsync({ id: license.dbId, data: payload }),
        ).unwrap();
        await links.saveOrWarn(Number(license.dbId));
        await recordNotes.saveOrWarn(Number(license.dbId));

        // Persist country & state locally (backend has no such fields yet).
        if (license.country) {
          await AsyncStorage.setItem(licenseCountryKey(license.dbId), license.country);
        } else {
          await AsyncStorage.removeItem(licenseCountryKey(license.dbId));
        }
        if (license.state) {
          await AsyncStorage.setItem(licenseStateKey(license.dbId), license.state);
        } else {
          await AsyncStorage.removeItem(licenseStateKey(license.dbId));
        }

        await dispatch(identityHubAsync({})).unwrap();

        if (tutorialStep === 'passport_form_hint') {
          nextTutorialStep(); // congratulations
          navigation.goBack();
          return;
        }
        Alert.alert(t('common.success'), t('identity_hub.license_updated'), [
          {
            text: t('common.ok'),
            onPress: () => navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  {
                    name: 'Dashboard',
                  },
                  {
                    name: 'IdentityHub',
                  },
                ],
              })
            ),
          },
        ]);
      } else {
        const otherErrors: LicenseErrors[] = licenses.map(license => {
          if (isOtherSelected(get_dropdown_options_data?.find((opt: any) => String(opt.value) === String(license.type))?.label)) {
            if (!license.typeother?.trim()) {
              return { typeother: t('common.field_required') || 'Please specify the type' } as LicenseErrors;
            }
          }
          return {} as LicenseErrors;
        });
        if (otherErrors.some(e => Object.keys(e).length > 0)) {
          setLicenseErrors(otherErrors);
          return;
        }

        const formattedLicenses = licenses.map(license => {
          let formattedDate = null;
          if (license.expirationDate) {
            if (typeof license.expirationDate === 'string') {
              formattedDate = license.expirationDate;
            } else if (license.expirationDate instanceof Date) {
              formattedDate = license.expirationDate.toISOString();
            }
          }

          return {
            licenseNumber: license.licenseCertNumber,
            type: license.type,
            jurisdiction: String(license.state),
            issuerAuthority: license.issuerAuthority,
            expirationDate: formattedDate,
            imageUrl: license.mediaIds ?? [],
            isAddedInWallet: license.addToWallet,
            reminderDaysBefore: parseInt(license.remindBefore, 10) || 90,
            ...(isOtherSelected(get_dropdown_options_data?.find((opt: any) => String(opt.value) === String(license.type))?.label)
              ? { typeother: license.typeother }
              : {}),
          };
        });

        // Send each license as a separate API call using Promise.all
        const results = await Promise.all(
          formattedLicenses.map((licenseData: any) =>
            dispatch(licensesAsync(licenseData)).unwrap(),
          ),
        );

        // Persist each license's country & state locally against its new id
        // (backend has no such fields yet).
        // The same "Select Records to Link" choice applies to each license added here.
        for (const res of results) {
          const newId = res?.id ?? res?.data?.id;
          if (newId) await links.saveOrWarn(Number(newId), [], true);
          if (newId) await recordNotes.saveOrWarn(Number(newId), true);
        }
        await Promise.all(
          results.map((res: any, i: number) => {
            const newId = res?.id ?? res?.data?.id;
            const country = licenses[i]?.country;
            return newId && country
              ? AsyncStorage.setItem(licenseCountryKey(newId), country)
              : Promise.resolve();
          }),
        );
        await Promise.all(
          results.map((res: any, i: number) => {
            const newId = res?.id ?? res?.data?.id;
            const state = licenses[i]?.state;
            return newId && state
              ? AsyncStorage.setItem(licenseStateKey(newId), state)
              : Promise.resolve();
          }),
        );

        await dispatch(identityHubAsync({})).unwrap();
        if (tutorialStep === 'passport_form_hint') {
          nextTutorialStep(); // congratulations
          navigation.goBack();
          return;
        }
        Alert.alert(t('common.success'), t('identity_hub.licenses_saved'), [
          {
            text: t('common.ok'), onPress: () => navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  {
                    name: 'Dashboard',
                  },
                  {
                    name: 'IdentityHub',
                  },
                ],
              })
            )
          },
        ]);
      }
    } catch (error) {
      // Error already shown by Redux
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <AuthHeader
        title={t('identity_hub.your_identity_hub')}
        subtitle={t('identity_hub.verify_details')}
        onBackPress={() => navigation.goBack()}
        containerStyle={{ paddingHorizontal: 16, marginBottom: 0 }}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />

      {/* Tutorial hint overlay */}
      {showTutorialHint && tutorialStep === 'passport_form_hint' && (
        <View style={tutorialHintStyles.overlay}>
          <View style={tutorialHintStyles.card}>
            <Text style={tutorialHintStyles.title}>Fill out the form</Text>
            <Text style={tutorialHintStyles.body}>
              Once you fill the form tap ‘Add License’ to save it.
            </Text>
            <TouchableOpacity
              style={[tutorialHintStyles.btn, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowTutorialHint(false)}
            >
              <Text style={tutorialHintStyles.btnText}>Start Filling</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        style={commonStyles.scrollView}
        contentContainerStyle={commonStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Licenses & Certifications Section */}
        <View style={commonStyles.sectionContainer}>
          <Text style={[styles.sectionTitle, { textAlign: 'left' }]}>
            {t('identity_hub.licenses_certifications')}
          </Text>

          {licenses.map((license, index) => (
            <View key={license.id} style={styles.sectionCard}>
              {index > 0 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    setLicenses(prev => prev.filter((_, i) => i !== index));
                    setLicenseErrors(prev =>
                      prev.filter((_, i) => i !== index),
                    );
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.error}
                  />
                  <Text style={styles.removeButtonText}>
                    {t('common.remove')}
                  </Text>
                </TouchableOpacity>
              )}
              {/* Type Dropdown */}
              <Text style={[styles.inputLabel, { textAlign: 'left' }]}>
                {t('identity_hub.type')} *
              </Text>
              <CustomDropDown
                options={get_dropdown_options_data}
                value={license.type}
                onSelect={(value: any) => {
                  handleInputChange(index, 'type', String(value));
                  // Clear typeother when switching away from Other
                  if (!isOtherSelected(get_dropdown_options_data?.find((opt: any) => String(opt.value) === String(value))?.label)) {
                    handleInputChange(index, 'typeother', '');
                  }
                }}
                placeholder={t('licenses_certifications.type')}
                search={true}
                leftIcon={true}
                style={styles.dropdown}
                error={!!licenseErrors[index]?.type}
              />
              {licenseErrors[index]?.type && (
                <Text style={{...styles.errorText, ...styles.customError}}>
                  {licenseErrors[index].type}
                </Text>
              )}

              {/* Other — only visible when Other is selected */}
              {isOtherSelected(get_dropdown_options_data?.find((opt: any) => String(opt.value) === String(license.type))?.label) && (
                <View style={commonStyles.inputContainer}>
                  <CustomInput
                    label={t('common.please_specify') || 'Please specify *'}
                    placeholder={t('common.other_type_placeholder') || 'Please specify...'}
                    value={license.typeother || ''}
                    onChangeText={value => handleInputChange(index, 'typeother', value)}
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                    error={licenseErrors[index]?.typeother}
                  />
                </View>
              )}

              {/* License/Cert # and Jurisdiction */}
              <View
                style={[
                  commonStyles.rowContainer,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={styles.halfWidth}>
                  <CustomInput
                    label={`${t('identity_hub.license_cert_number')} *`}
                    placeholder={t(
                      'licenses_certifications.license_cert_placeholder',
                    )}
                    value={license.licenseCertNumber}
                    onChangeText={value =>
                      handleInputChange(index, 'licenseCertNumber', value)
                    }
                    containerStyle={commonStyles.inputContainer}
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                    error={licenseErrors[index]?.licenseCertNumber}
                  />
                </View>
              </View>

              <View
                style={[
                  commonStyles.rowContainer,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={styles.halfWidth}>
                  <CustomInput
                    label={`${t('identity_hub.issuer_authority')} *`}
                    placeholder={t(
                      'licenses_certifications.issuer_authority_placeholder',
                    )}
                    value={license.issuerAuthority}
                    onChangeText={value =>
                      handleInputChange(index, 'issuerAuthority', value)
                    }
                    containerStyle={commonStyles.inputContainer}
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                    error={licenseErrors[index]?.issuerAuthority}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text
                    style={[styles.inputLabel, { textAlign: 'left' }]}
                  >{`${t('identity_hub.expiration_date')} *`}</Text>
                  <CustomDateTimePicker
                    placeholder={t('common.select')}
                    value={license.expirationDate}
                    onChange={value =>
                      handleInputChange(index, 'expirationDate', value)
                    }
                    mode="date"
                    displayFormat="MM/DD/YYYY"
                    containerStyle={commonStyles.inputContainer}
                    suffixIcon={
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={themeColors.textSecondary}
                      />
                    }
                  />
                  {licenseErrors[index]?.expirationDate && (
                    <Text style={styles.errorText}>
                      {licenseErrors[index].expirationDate}
                    </Text>
                  )}
                </View>
              </View>

              {/* Country */}
              <Text style={[styles.inputLabel, { textAlign: 'left', fontSize: 16, fontWeight: 600 }]}>{t('identity_hub.jurisdiction')}</Text>
              <Text style={[styles.inputLabel, { textAlign: 'left' }]}>
                {t('identity_hub.country')}
              </Text>
              <CustomDropDown
                options={
                  countries_data?.map((country: any) => ({
                    label: country.countryname,
                    value: country.countryname,
                  })) || []
                }
                value={license.country}
                onSelect={(value: any) => {
                  const v = String(value);
                  handleInputChange(index, 'country', v);
                  handleInputChange(index, 'state', '');
                  loadStatesForRow(index, v);
                }}
                placeholder={t('passport.country_placeholder')}
                search={true}
                searchPlaceholder={t('common.search_country')}
                maxHeight={300}
                style={styles.dropdown}
                leftIcon={true}
              />

              {/* State */}
              <Text style={[styles.inputLabel, { textAlign: 'left' }]}>
                {t('identity_hub.state')}
              </Text>
              <CustomDropDown
                options={license.stateOptions || []}
                value={license.state}
                onSelect={(value: any) => {
                  handleInputChange(index, 'state', String(value));
                  handleInputChange(index, 'jurisdiction', String(value));
                }}
                placeholder={t('common.select')}
                search={true}
                searchPlaceholder={t('identity_hub.state')}
                maxHeight={300}
                style={styles.dropdown}
                leftIcon={true}
              />

              {/* Remind Me Before Expiration */}
              <CustomReminderPicker
                value={license.remindBefore}
                onChange={value =>
                  handleInputChange(index, 'remindBefore', value)
                }
                label={t('identity_hub.remind_before_expiration')}
                modalTitle={t('common.enter_number_of_days')}
                modalPlaceholder={t('common.enter_days_placeholder')}
              />

              {/* Add to Wallet Toggle */}
              <View style={styles.walletRow}>
                <Text style={styles.walletText}>
                  {t('identity_hub.add_to_wallet')}
                </Text>
                <Switch
                  value={license.addToWallet}
                  onValueChange={value =>
                    handleInputChange(index, 'addToWallet', value)
                  }
                  trackColor={{
                    false: colors.border,
                    true: themeColors.primary,
                  }}
                  thumbColor={colors.white}
                />
              </View>

              {/* Upload Photo / Documents */}
              <MixedMediaUploader
                mediaIds={license.mediaIds}
                onMediaChange={(ids) => handleMediaChange(index, ids)}
                label={t('identity_hub.upload_photo')}
                uploadType="box"
                autoUpload={true}
                maxItems={5}
                removable={true}
              />
            </View>
          ))}
        </View>

        {/* Add License Button - Hide in edit mode */}
        {!isEditMode && (
          <PrimaryButton
            title={t('identity_hub.add_license')}
            onPress={handleAddLicense}
            variant="outline"
            buttonStyle={[
              styles.addLicenseButton,
              {
                borderColor: themeColors.primary,
                backgroundColor: getColorWithOpacity(themeColors.primary, 0.1),
              },
            ]}
            textStyle={styles.addLicenseButtonText}
          />
        )}

        {/* Save/Update Identity Button */}
        <PrimaryButton
          title={
            isEditMode ? t('common.update') : t('common.save')
          }
          onPress={handleSaveIdentity}
          loading={isLoading}
          disabled={isLoading}
          buttonStyle={[
            styles.saveButton,
            { backgroundColor: themeColors.primary },
          ]}
        />
      <RecordNotesField notes={recordNotes} />
      <RecordLinksField links={links} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default IdentityLicenseCertificationsForm;
