import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader } from '../../../../../components/common';
import { useNavigation } from '@react-navigation/native';
import fonts from '../../../../../utils/fonts';
import colors from '../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../../../types/store.types';
import { getPrivacyPolicyAsync } from '../../../../../redux/services/contentService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { parseHtmlToRichText } from '../../../../../utils/htmlToRichText';

const PrivacyPolicy: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();

  const { privacy_policy, privacy_policy_status } = useSelector(
    (state: any) => state.content_slice,
  );

  useEffect(() => {
    dispatch(getPrivacyPolicyAsync());
  }, [dispatch]);

  const isLoading = privacy_policy_status === ASYNC_STATUS.LOADING;
  const isError = privacy_policy_status === ASYNC_STATUS.ERROR;

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <AuthHeader
          title={t('privacy_policy.title')}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          containerStyle={styles.headerContainer}
          titleStyle={styles.headerTitle}
          backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
        />

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        ) : isError || !privacy_policy ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>
              Privacy Policy is currently unavailable. Please try again later.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {privacy_policy.effectiveDate && (
              <Text style={styles.effectiveDate}>
                Effective: {new Date(privacy_policy.effectiveDate).toLocaleDateString()}
              </Text>
            )}
            <Text style={styles.version}>Version {privacy_policy.version}</Text>
            {parseHtmlToRichText(privacy_policy.content).map((block, index) => (
              <Text key={index} style={[styles.contentText, { color: themeColors.textPrimary }]}>
                {block.map((run, runIndex) => (
                  <Text key={runIndex} style={run.bold ? styles.boldRun : undefined}>
                    {run.text}
                  </Text>
                ))}
              </Text>
            ))}
            <View style={styles.divider} />
            <Text style={styles.footer}>NCHRG — Privacy Policy</Text>
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginBottom: 10,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 30 },
  effectiveDate: {
    fontSize: 13,
    fontFamily: fonts.display_regular,
    color: colors.gray,
    marginBottom: 4,
  },
  version: {
    fontSize: 12,
    fontFamily: fonts.display_regular,
    color: colors.gray,
    marginBottom: 20,
  },
  contentText: {
    fontSize: 14,
    fontFamily: fonts.display_regular,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 12,
  },
  boldRun: {
    fontFamily: fonts.display_bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray,
    opacity: 0.3,
    marginVertical: 20,
  },
  footer: {
    fontSize: 12,
    fontFamily: fonts.display_regular,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.display_regular,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
});
