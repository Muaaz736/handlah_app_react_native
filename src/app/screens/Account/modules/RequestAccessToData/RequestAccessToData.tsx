import { Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { makeRequestAccessToDataStyles } from './RequestAccessToData.styles';
import React, { useState, useEffect, useMemo } from 'react';
import fonts from '../../../../../utils/fonts';
import colors from '../../../../../utils/colors';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, CustomCheckbox, CustomInput, PrimaryButton, CustomSeparator, showSuccessToast, showErrorToast } from '../../../../../components/common';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { isIOS, saveAndOpenExportFile } from '../../../../../utils/helpers';
import {
  RequestAccessToDataNavigationProp,
  RequestType,
  ScopeType,
  DeliveryMethodType,
} from './RequestAccessToData.types';
import { submitDataAccessRequestAsync } from '../../../../../redux/services/authService';
import { resetDataAccessRequestStatus } from '../../../../../redux/slices/authSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const RequestAccessToData: React.FC = () => {
  const navigation = useNavigation<RequestAccessToDataNavigationProp>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeRequestAccessToDataStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();
  const [requestType, setRequestType] = useState<RequestType>('');
  const [scope, setScope] = useState<ScopeType>('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodType>('');
  const [notes, setNotes] = useState<string>('');

  const authState = useSelector((state: any) => state.user_auth);
  const submitStatus = useMemo(() => authState?.data_access_request_status, [authState]);
  const isLoading = submitStatus === ASYNC_STATUS.LOADING;

  // Clear any stale submit status when leaving the screen
  useEffect(() => {
    return () => {
      dispatch(resetDataAccessRequestStatus());
    };
  }, [dispatch]);

  const handleSubmit = async (): Promise<void> => {
    try {
      const result = await dispatch(
        submitDataAccessRequestAsync({
          accessType: requestType,
          scope,
          deliveryMethod,
          notes,
        }),
      ).unwrap();

      if (deliveryMethod === 'InApp') {
        const exportContent =
          typeof result === 'string'
            ? result
            : result?.data ?? result?.csv ?? result?.content ?? '';

        if (!exportContent) {
          showErrorToast(t('request_access_data.export_failed'));
          return;
        }

        await saveAndOpenExportFile(exportContent, `Handlah_Data_Export_${scope || 'All'}`);
        showSuccessToast(t('request_access_data.export_ready'));
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'RequestAccessToDataRecieve' as never }],
      });
    } catch (error) {
      
    }
  };

  const handleCancel = (): void => {
    navigation.goBack();
  };

  return (
    <ScreenWrapper showShadow={false} containerStyle={styles.container}>
      <AuthHeader
        title={t('request_access_data.title')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        containerStyle={{ paddingTop: isIOS ? 0 : 20 }}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Text */}
        <Text style={styles.headerText}>
          {t('request_access_data.header_text')}
        </Text>

        {/* What you will receive section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('request_access_data.what_receive')}</Text>
          <Text style={styles.bulletPoint}>
            {t('request_access_data.bullet_confirmation')}
          </Text>
          <Text style={styles.bulletPoint}>
            {t('request_access_data.bullet_copy')}
          </Text>
          <Text style={styles.bulletPoint}>
            {t('request_access_data.bullet_third_parties')}
          </Text>
        </View>

        {/* Request details header */}
        <Text style={styles.requestDetailsTitle}>{t('request_access_data.request_details')}</Text>
        <CustomSeparator marginVertical={10} />

        {/* Request type section */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('request_access_data.request_type')}</Text>
          <View style={styles.checkboxGroup}>
            <CustomCheckbox
              checked={requestType === 'AccessCopy'}
              onPress={() => setRequestType('AccessCopy')}
              label={t('request_access_data.access_copy')}
            />
            <CustomCheckbox
              checked={requestType === 'ConfirmCollection'}
              onPress={() => setRequestType('ConfirmCollection')}
              label={t('request_access_data.confirm_collect')}
            />
            <CustomCheckbox
              checked={requestType === 'Both'}
              onPress={() => setRequestType('Both')}
              label={t('request_access_data.both')}
            />
          </View>
        </View>

        {/* Scope section */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('request_access_data.scope')}</Text>
          <View style={styles.checkboxGroup}>
            <CustomCheckbox
              checked={scope === 'All'}
              onPress={() => setScope('All')}
              label={t('request_access_data.all_data')}
            />
            <CustomCheckbox
              checked={scope === 'HealthInfo'}
              onPress={() => setScope('HealthInfo')}
              label={t('request_access_data.health_info_only')}
            />
            <CustomCheckbox
              checked={scope === 'FinancialInfo'}
              onPress={() => setScope('FinancialInfo')}
              label={t('request_access_data.financial_info_only')}
            />
            {/* <CustomCheckbox
              checked={scope === 'Other'}
              onPress={() => setScope('Other')}
              label={t('request_access_data.other')}
            /> */}
          </View>
        </View>

        {/* Delivery method section */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('request_access_data.delivery_method')}</Text>
          <View style={styles.checkboxGroup}>
            <CustomCheckbox
              checked={deliveryMethod === 'InApp'}
              onPress={() => setDeliveryMethod('InApp')}
              label={t('request_access_data.in_app_download')}
            />
            <CustomCheckbox
              checked={deliveryMethod === 'Email'}
              onPress={() => setDeliveryMethod('Email')}
              label={t('request_access_data.email_to_account')}
            />
          
          </View>
        </View>

        {/* Notes section */}
        <View style={styles.notesSection}>
          <CustomInput
            label={t('request_access_data.notes_optional')}
            placeholder={t('request_access_data.notes_placeholder')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            inputStyle={styles.notesInput}
            inputContainerStyle={styles.notesInputContainer}
          />
        </View>

        {/* Identity verification section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('request_access_data.identity_verification')}</Text>
          <Text style={styles.infoText}>
            {t('request_access_data.identity_verification_text')}
          </Text>
        </View>

        {/* Timing section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('request_access_data.timing')}</Text>
          <Text style={styles.infoText}>
            {t('request_access_data.timing_text')}
          </Text>
        </View>

        {/* Fees section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('request_access_data.fees')}</Text>
          <Text style={styles.infoText}>
            {t('request_access_data.fees_text')}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={t('request_access_data.cancel')}
            onPress={handleCancel}
            variant="outline"
            buttonStyle={styles.cancelButton}
            disabled={isLoading}
          />
          <PrimaryButton
            title={t('request_access_data.submit')}
            onPress={handleSubmit}
            buttonStyle={[styles.submitButton, { backgroundColor: themeColors.primary }]}
            textStyle={{
              color: colors.white,
              fontSize: 17,
              textAlign: 'center',
            }}
            disabled={isLoading}
          />
        </View>
        {isLoading && (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default RequestAccessToData;
