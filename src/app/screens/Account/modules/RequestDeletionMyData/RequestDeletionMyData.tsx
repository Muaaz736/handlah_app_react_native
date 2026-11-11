import { Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { makeRequestDeletionMyDataStyles } from './RequestDeletionMyData.styles';
import React, { useState, useEffect, useMemo } from 'react';
import colors from '../../../../../utils/colors';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, CustomCheckbox, CustomInput, PrimaryButton, CustomSeparator } from '../../../../../components/common';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { isIOS } from '../../../../../utils/helpers';
import { useUserRole } from '../../../../../hooks/useUserRole';
import {
  RequestDeletionMyDataNavigationProp,
  DeletionScopeType,
} from './RequestDeletionMyData.types';
import { submitDataDeletionRequestAsync } from '../../../../../redux/services/authService';
import { resetDataDeletionRequestStatus } from '../../../../../redux/slices/authSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const RequestDeletionMyData: React.FC = () => {
  const navigation = useNavigation<RequestDeletionMyDataNavigationProp>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeRequestDeletionMyDataStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();
  const [deletionScope, setDeletionScope] = useState<DeletionScopeType>('');
  const [reason, setReason] = useState<string>('');
  const [acknowledgement, setAcknowledgement] = useState<boolean>(false);

  const authState = useSelector((state: any) => state.user_auth);
  const submitStatus = useMemo(() => authState?.data_deletion_request_status, [authState]);
  const isLoading = submitStatus === ASYNC_STATUS.LOADING;

  useEffect(() => {
    if (submitStatus === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetDataDeletionRequestStatus());
      navigation.navigate('RequestDeletionMyDataRecieve' as any);
    }
  }, [submitStatus, dispatch, navigation]);

  const handleSubmit = (): void => {
    dispatch(
      submitDataDeletionRequestAsync({
        deletionScope,
        reason,
        acknowledged: acknowledgement,
      }),
    );
  };

  const handleCancel = (): void => {
    navigation.goBack();
  };

  return (
    <ScreenWrapper showShadow={false} containerStyle={styles.container}>
      <AuthHeader
        title={t('request_deletion_data.title')}
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
          {t('request_deletion_data.header_text')}
        </Text>

        {/* What will be deleted section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('request_deletion_data.what_deleted')}</Text>
          <Text style={styles.bulletPoint}>
            {t('request_deletion_data.what_deleted_intro')}
          </Text>
          <Text style={styles.bulletPoint}>
            {t('request_deletion_data.bullet_health_info')}
          </Text>
          <Text style={styles.bulletPoint}>
            {t('request_deletion_data.bullet_account_ids')}
          </Text>
          <Text style={styles.bulletPoint}>
            {t('request_deletion_data.bullet_device_data')}
          </Text>
        </View>

        {/* Important effects section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('request_deletion_data.important_effects')}</Text>
          <Text style={styles.bulletPoint}>
            {t('request_deletion_data.effect_irreversible')}
          </Text>
          <Text style={styles.bulletPoint}>
            {t('request_deletion_data.effect_features')}
          </Text>
          <Text style={styles.bulletPoint}>
            {t('request_deletion_data.effect_notify_third_parties')}
          </Text>
        </View>

        {/* Deletion scope header */}
        <Text style={styles.requestDetailsTitle}>{t('request_deletion_data.deletion_scope')}</Text>
        <CustomSeparator marginVertical={10} />

        {/* Deletion scope section */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('request_deletion_data.what_delete')}</Text>
          <View style={styles.checkboxGroup}>
            <CustomCheckbox
              checked={deletionScope === 'DeleteAll'}
              onPress={() => setDeletionScope('DeleteAll')}
              label={t('request_deletion_data.delete_all')}
            />
            <CustomCheckbox
              checked={deletionScope === 'DeleteSpecific'}
              onPress={() => setDeletionScope('DeleteSpecific')}
              label={t('request_deletion_data.delete_specific')}
            />
          </View>
        </View>

        {/* Reason section */}
        <View style={styles.notesSection}>
          <CustomInput
            label={t('request_deletion_data.reason_optional')}
            placeholder={t('request_deletion_data.reason_placeholder')}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            inputStyle={styles.notesInput}
            inputContainerStyle={styles.notesInputContainer}
          />
        </View>

        {/* Identity verification section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('request_deletion_data.identity_verification')}</Text>
          <Text style={styles.infoText}>
            {t('request_deletion_data.identity_verification_text')}
          </Text>
        </View>

        {/* Timing section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('request_deletion_data.timing')}</Text>
          <Text style={styles.infoText}>
            {t('request_deletion_data.timing_text_1')}
          </Text>
          <Text style={[styles.infoText, { marginTop: 8 }]}>
            {t('request_deletion_data.timing_text_2')}
          </Text>
        </View>

        {/* Acknowledgement section */}
        <View style={styles.acknowledgementSection}>
          <Text style={styles.acknowledgementTitle}>{t('request_deletion_data.acknowledgement')}</Text>
          <CustomCheckbox
            checked={acknowledgement}
            onPress={() => setAcknowledgement(!acknowledgement)}
            label={t('request_deletion_data.acknowledgement_text')}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={t('request_deletion_data.cancel')}
            onPress={handleCancel}
            variant="outline"
            buttonStyle={styles.cancelButton}
            disabled={isLoading}
          />
          <PrimaryButton
            title={t('request_deletion_data.submit')}
            onPress={handleSubmit}
            buttonStyle={styles.submitButton}
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

export default RequestDeletionMyData;
