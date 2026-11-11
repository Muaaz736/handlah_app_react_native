import React, { useState, useEffect, useMemo } from 'react';
import { useUserRole } from '../../../../../hooks/useUserRole';
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { makeAppealDecisionStyles } from './AppealDecision.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../../../../utils/colors';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, CustomInput, CustomDateTimePicker, CustomCheckbox, PrimaryButton, MixedMediaUploader } from '../../../../../components/common';
import { useTranslation } from 'react-i18next';
import { isIOS } from '../../../../../utils/helpers';
import {
  AppealDecisionNavigationProp,
  AppealType,
} from './AppealDecision.types';
import { submitPrivacyAppealAsync } from '../../../../../redux/services/authService';
import { resetSubmitAppealStatus } from '../../../../../redux/slices/authSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const AppealDecision: React.FC = () => {
  const navigation = useNavigation<AppealDecisionNavigationProp>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAppealDecisionStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();

  const APPEAL_TYPES: { value: string; labelKey: string }[] = [
    { value: 'AccessDecision', labelKey: 'appeal_decision.access_request' },
    { value: 'DeletionDecision', labelKey: 'appeal_decision.deletion_request' },
    { value: 'Other', labelKey: 'appeal_decision.other' },
  ];

  const [appealType, setAppealType] = useState<AppealType>('');
  const [requestId, setRequestId] = useState<string>('');
  const [decisionDate, setDecisionDate] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

  const authState = useSelector((state: any) => state.user_auth);

  const submitStatus = useMemo(
    () => authState?.submit_appeal_status,
    [authState],
  );

  const isLoading = submitStatus === ASYNC_STATUS.LOADING;

  useEffect(() => {
    if (submitStatus === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetSubmitAppealStatus());
      navigation.navigate('AppealDecisionRecieve');
    }
  }, [submitStatus, dispatch, navigation]);

  const handleSubmit = (): void => {
    const dateISO = decisionDate
      ? new Date(decisionDate).toISOString()
      : new Date().toISOString();

    dispatch(
      submitPrivacyAppealAsync({
        appealType,
        requestReferenceId: requestId,
        dateReceived: dateISO,
        appealReason: explanation,
        attachmentUrl: attachmentUrls.length > 0 ? attachmentUrls : undefined,
      }) as any,
    );
  };

  const handleCancel = (): void => {
    navigation.goBack();
  };

  return (
    <ScreenWrapper showShadow={false} containerStyle={styles.container}>
      {/* Header */}
      <AuthHeader
        title={t('appeal_decision.title')}
        showBackButton={true}
        containerStyle={{ paddingTop: isIOS ? 0 : 20 }}
        onBackPress={() => navigation.goBack()}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <Text style={styles.description}>
          {t('appeal_decision.description')}
        </Text>

        {/* Appeal Details Section */}
        <Text style={styles.sectionTitle}>
          {t('appeal_decision.appeal_details')}
        </Text>

        {/* What are you appealing */}
        <Text style={styles.fieldLabel}>
          {t('appeal_decision.what_appealing')}
        </Text>
        <View style={styles.checkboxGroup}>
          {APPEAL_TYPES.map(({ value, labelKey }) => (
            <CustomCheckbox
              key={value}
              checked={appealType === value}
              onPress={() => setAppealType(value as AppealType)}
              label={t(labelKey)}
            />
          ))}
        </View>

        {/* Request Reference */}
        <Text style={styles.fieldLabel}>
          {t('appeal_decision.request_reference')}
        </Text>
        <CustomInput
          placeholder={t('appeal_decision.request_id_placeholder')}
          value={requestId}
          onChangeText={setRequestId}
          containerStyle={styles.inputContainer}
        />

        {/* Date Picker */}
        <CustomDateTimePicker
          label={t('appeal_decision.decision_date')}
          placeholder={t('appeal_decision.select_placeholder')}
          value={decisionDate}
          onChange={(value: any) => setDecisionDate(value)}
          mode="date"
          displayFormat="MM/DD/YYYY"
          suffixIcon={
            <Ionicons name="calendar-outline" size={20} color={colors.gray} />
          }
          containerStyle={styles.inputContainer}
        />

        {/* Why are you appealing */}
        <Text style={styles.fieldLabel}>
          {t('appeal_decision.why_appealing')}
        </Text>
        <CustomInput
          placeholder={t('appeal_decision.explanation_placeholder')}
          value={explanation}
          onChangeText={setExplanation}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.textArea}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Attachments */}
        <Text style={styles.fieldLabel}>
          {t('appeal_decision.attachments')}
        </Text>
        <MixedMediaUploader
          mediaIds={attachmentUrls}
          onMediaChange={setAttachmentUrls}
          placeholder={t('appeal_decision.upload')}
          removable
          autoUpload
        />

        {/* Identity Verification */}
        <Text style={styles.fieldLabel}>
          {t('appeal_decision.identity_verification')}
        </Text>
        <Text style={styles.infoText}>
          {t('appeal_decision.identity_verification_text')}
        </Text>

        {/* Timing */}
        <Text style={styles.fieldLabel}>{t('appeal_decision.timing')}</Text>
        <Text style={styles.infoText}>{t('appeal_decision.timing_text')}</Text>

        {/* Denial Information */}
        <Text style={styles.fieldLabel}>{t('appeal_decision.if_denied')}</Text>
        <Text style={styles.infoText}>
          {t('appeal_decision.if_denied_text')}
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={t('appeal_decision.cancel')}
            variant="outline"
            onPress={handleCancel}
            buttonStyle={styles.cancelButton}
            disabled={isLoading}
          />
          <PrimaryButton
            title={t('appeal_decision.submit')}
            onPress={handleSubmit}
            buttonStyle={styles.submitButton}
            textStyle={{ color: colors.white }}
            disabled={isLoading}
          />
        </View>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginTop: 10 }}
          />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AppealDecision;
