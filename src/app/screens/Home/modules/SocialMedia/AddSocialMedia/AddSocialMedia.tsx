import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import React, { useMemo, FC, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6Brands from 'react-native-vector-icons/FontAwesome6';
import { SvgXml } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import {
  AuthHeader,
  CustomDateTimePicker,
  CustomDropDown,
  CustomInput,
  PrimaryButton,
} from '../../../../../../components/common';
import colors from '../../../../../../utils/colors';
import { makeAddSocialMediaStyles } from './AddSocialMedia.styles';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { isIOS } from '../../../../../../utils/helpers';
import {
  socialNetworkSetupAsync,
  updateSocialNetworkSetupAsync,
  userSocialNetworksAsync,
} from '../../../../../../redux/services/essentialsService';
import {
  setAddSocialMediaStatus,
  setUpdateSocialMediaStatus,
} from '../../../../../../redux/slices/essentialsSlice';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { showErrorAlert, showSuccessAlert } from '../../../../../../utils/AlertHelper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  AddSocialMediaNavigationProp,
  AddSocialMediaRouteProp,
  AddSocialMediaRouteParams,
} from './AddSocialMedia.types';
import { Formik } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { getDropdownOptionsAsync } from '../../../../../../redux/services/authService';
import { get } from 'react-native/Libraries/NativeComponent/NativeComponentRegistry';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

const AddSocialMedia: FC = (): React.ReactElement => {
  const navigation = useNavigation<AddSocialMediaNavigationProp>();
  const route = useRoute<AddSocialMediaRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeAddSocialMediaStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();

  const isBusiness = isBusinessRole();

  const params = (route?.params as AddSocialMediaRouteParams) || {};


  const isEdit = params?.isEdit || false;
  const existingAccount = params?.account;
  const accountId = params?.accountId;
  const ownerUserId = (route?.params as any)?.ownerUserId;
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.SocialMedia,
      recordId: isEdit && accountId ? Number(accountId) : null,
      businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
      enabled: !ownerUserId,
  });
  // Notes' "Encrypt notes" choice; saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.SocialMedia, recordId: isEdit && accountId ? Number(accountId) : null, enabled: links.enabled });

  const {
    social_network_types_data,
    social_network_setup_status,
    update_social_network_setup_status,
  } = useSelector((state: any) => state.essentials_slice);

  const { get_dropdown_options_data, get_dropdown_options_status } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('SocialNetworkType'));
  }, [dispatch]));


  const isLoading =
    social_network_setup_status === ASYNC_STATUS.LOADING ||
    update_social_network_setup_status === ASYNC_STATUS.LOADING;

  // Options
  const accountTypeOptions = useMemo(() => {
    if (!social_network_types_data?.socialnetworktypes) return [];
    return social_network_types_data.socialnetworktypes
      .filter((network: any) => network?.networktype && network?.id)
      .map((network: any) => ({
        label:
          network.networktype.charAt(0).toUpperCase() +
          network.networktype.slice(1),
        value: network.id,
        networktype: network.networktype,
      }));
  }, [social_network_types_data]);

  const getSocialMediaIcon = useCallback((networkType?: string): string => {
    const iconMap: Record<string, string> = {
      facebook: 'facebook',
      instagram: 'instagram',
      x: 'twitter',
      twitter: 'twitter',
      linkedin: 'linkedin',
      youtube: 'youtube',
      snapchat: 'snapchat',
      pinterest: 'pinterest',
      whatsapp: 'whatsapp',
      reddit: 'reddit',
      github: 'github',
      discord: 'discord',
      telegram: 'telegram',
      web: 'web',
    };
    return iconMap[String(networkType || '').toLowerCase()] || 'web';
  }, []);

  const getNetworkTypeById = useCallback(
    (id?: string | number): string => {
      const option = accountTypeOptions.find(
        (item: any) => Number(item.value) === Number(id),
      );
      return String(option?.networktype || '').toLowerCase();
    },
    [accountTypeOptions],
  );

  const renderNetworkIcon = useCallback(
    (networkType?: string, size = 20, color = colors.black) => {
      const option = get_dropdown_options_data?.find(
        (item: any) => String(item.value) === String(networkType),
      );
      if (option?.icon) {
        return <SvgXml xml={option.icon} width={size} height={size} />;
      } else {
        return (
          <MaterialCommunityIcons
            name={getSocialMediaIcon(getNetworkTypeById('web'))}
            size={size}
            color={color}
          />
        )
      }
    },
    [getSocialMediaIcon],
  );

  const handleSaveAndClose = async (values: any): Promise<void> => {
    try {
      const payload = {
        socialNetworkTypeId: Number(values.socialNetworkTypeId),
        accountName: values.accountName,
        socialNetworkUrl: values.socialNetworkUrl || '',
        username: values.username || '',
        password: values.password || '',
        startDate: values.startDate,
        endDate: values.endDate,
        ...(isBusiness && selectedBusinessId && {
          businessId: selectedBusinessId,
        }),
      };

      if (isEdit && accountId) {
        await dispatch(updateSocialNetworkSetupAsync({ id: accountId, data: payload })).unwrap();
        await links.saveOrWarn(Number(accountId));
      } else {
        const created = await dispatch(socialNetworkSetupAsync({ ...payload, ...(ownerUserId ? { ownerUserId } : {}) })).unwrap();
        saveLinksAfter(links, { meta: { requestStatus: 'fulfilled' }, payload: created }, undefined, undefined, recordNotes);
      }
    } catch (error: any) {
      showErrorAlert(error?.message || t('social_media.failed_to_save_account'), 'Error');
    }
  };

  useFocusEffect(useCallback(() => {
    // Only trigger for add mode (not edit)
    if (!isEdit && social_network_setup_status === ASYNC_STATUS.SUCCEEDED) {
      showSuccessAlert(
        t('social_media.account_added_successfully') || 'Social media account added successfully',
        'Success',
      );
      dispatch(setAddSocialMediaStatus());
      navigation.goBack();
      if (isBusiness && selectedBusinessId) {
        dispatch(userSocialNetworksAsync({ businessId: selectedBusinessId }));
      }
    }
  }, [social_network_setup_status, isEdit]));

  useFocusEffect(useCallback(() => {
    // Only trigger for edit mode
    if (isEdit && update_social_network_setup_status === ASYNC_STATUS.SUCCEEDED) {
      showSuccessAlert(
        t('social_media.account_updated_successfully') || 'Social media account updated successfully',
        'Success',
      );
      dispatch(setUpdateSocialMediaStatus());
      navigation.goBack();
      if (isBusiness && selectedBusinessId) {
        dispatch(userSocialNetworksAsync({ businessId: selectedBusinessId }));
      }
    }
  }, [update_social_network_setup_status, isEdit]));

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeader
        title={isEdit ? t('social_media.edit_account') : t('social_media.add_your_account')}
        onBackPress={() => navigation.goBack()}
        containerStyle={{ paddingHorizontal: 16, paddingTop: isIOS ? 0 : 20, marginBottom: -14 }}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Formik
          initialValues={{
            socialNetworkTypeId: existingAccount?.socialNetworkTypeId || '',
            accountName: existingAccount?.accountName || '',
            socialNetworkUrl: existingAccount?.socialNetworkUrl || '',
            username: existingAccount?.username || '',
            password: existingAccount?.password || '',
            startDate: existingAccount?.startDate ? new Date(existingAccount.startDate) : undefined,
            endDate: existingAccount?.endDate ? new Date(existingAccount.endDate) : undefined,
          }}
          validationSchema={validationSchema('social_media')}
          onSubmit={handleSaveAndClose}
          enableReinitialize
        >
          {({ handleChange, handleSubmit, values, setFieldValue, touched, errors, setFieldTouched }) => {
            return (
              <>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.formContainer}>

                    {/* Dropdown */}
                    <Text style={styles.label}>
                      {t('social_media.account_type')} *
                    </Text>

                    <CustomDropDown
                      options={get_dropdown_options_status
                        === ASYNC_STATUS.LOADING ? [] : get_dropdown_options_data}
                      value={String(values.socialNetworkTypeId)}
                      onSelect={(value: any) => setFieldValue('socialNetworkTypeId', value)}
                      placeholder={t('common.select')}
                      leftIcon={
                        <View style={styles.dropdownLeftIcon}>
                          {renderNetworkIcon(String(values.socialNetworkTypeId) || 'web')}
                        </View>
                      }
                      search
                      style={styles.dropdown}
                      renderItem={(item: any) => (
                        <View style={styles.dropdownItem}>
                          <View style={styles.dropdownItemContent}>
                            <SvgXml xml={item?.icon} width={16} height={16} />
                            <Text style={styles.dropdownItemText}>{item.label}</Text>
                          </View>
                        </View>
                      )}
                      containerStyle={{ overflow: 'hidden' }}
                      error={!!(touched.socialNetworkTypeId && errors.socialNetworkTypeId)}
                    />

                    {touched.socialNetworkTypeId && errors.socialNetworkTypeId && (
                      <Text style={styles.errorText}>{String(errors.socialNetworkTypeId)}</Text>
                    )}

                    {/* Inputs */}
                    <CustomInput
                      label={`${t('social_media.account_name')} *`}
                      placeholder={t('social_media.account_name_placeholder')}
                      value={values.accountName}
                      onChangeText={handleChange('accountName')}
                      error={!!(touched.accountName && errors.accountName)}
                    />

                    <CustomInput
                      label={t('social_media.social_network_url')}
                      placeholder={t('social_media.url_placeholder')}
                      value={values.socialNetworkUrl}
                      onChangeText={handleChange('socialNetworkUrl')}
                    />

                    <CustomInput
                      label={t('social_media.username_optional')}
                      placeholder={t('social_media.username_placeholder')}
                      value={values.username}
                      onChangeText={handleChange('username')}
                    />
                    <CustomInput
                      label={t('social_media.password_optional')}
                      placeholder={t('social_media.password_placeholder')}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      password
                    />

                    {/* Dates */}
                    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.label}>{t('common.start_date')}</Text>
                        <CustomDateTimePicker
                          value={values.startDate}
                          onChange={(d) => {
                            setFieldValue('startDate', d);
                            setFieldTouched('startDate', true);
                          }}
                          placeholder={t('common.start_date')}
                          displayFormat="MM/DD/YYYY"
                          suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textPrimary} />}
                        />
                        {touched.startDate && errors.startDate && (
                          <Text style={styles.errorText}>{String(errors.startDate)}</Text>
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>{t('common.end_date')}</Text>
                        <CustomDateTimePicker
                          value={values.endDate}
                          onChange={(d) => {
                            setFieldValue('endDate', d);
                            setFieldTouched('endDate', true);
                          }}
                          placeholder={t('common.end_date')}
                          displayFormat="MM/DD/YYYY"
                          clearable
                          suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textPrimary} />}
                        />
                        {touched.endDate && errors.endDate && (
                          <Text style={styles.errorText}>{String(errors.endDate)}</Text>
                        )}
                      </View>
                    </View>

                    <RecordNotesField notes={recordNotes} />
                    <RecordLinksField links={links} />
                  </View>
                </ScrollView>

                <View style={styles.bottomButtons}>
                  <PrimaryButton
                    title={isEdit ? t('common.save') : t('social_media.save_and_close')}
                    onPress={() => handleSubmit()}
                    loading={isLoading}
                    disabled={isLoading}
                    buttonStyle={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                    textStyle={[styles.saveButtonText, { color: colors.white }]}
                  />
                </View>
              </>
            );
          }}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddSocialMedia;