import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import React, { use, useEffect } from 'react';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader } from '../../../../../components/common';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../../../types/store.types';
import { getTermsAsync } from '../../../../../redux/services/contentService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import fonts from '../../../../../utils/fonts';
import colors from '../../../../../utils/colors';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { parseHtmlToRichText } from '../../../../../utils/htmlToRichText';

const TermsConditions: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();

  const { terms, terms_status } = useSelector(
    (state: any) => state.content_slice,
  );

  useEffect(() => {
    dispatch(getTermsAsync());
  }, [dispatch]);

  const isLoading = terms_status === ASYNC_STATUS.LOADING;
  const isError = terms_status === ASYNC_STATUS.ERROR;

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <AuthHeader
          title={t('terms_conditions.title')}
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
        ) : isError || !terms ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>
              Terms & Conditions are currently unavailable. Please try again later.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {terms.effectiveDate && (
              <Text style={styles.effectiveDate}>
                Effective: {new Date(terms.effectiveDate).toLocaleDateString()}
              </Text>
            )}
            <Text style={styles.version}>Version {terms.version}</Text>
            {parseHtmlToRichText(terms.content).map((block, index) => (
              <Text key={index} style={[styles.contentText, { color: themeColors.textPrimary }]}>
                {block.map((run, runIndex) => (
                  <Text key={runIndex} style={run.bold ? styles.boldRun : undefined}>
                    {run.text}
                  </Text>
                ))}
              </Text>
            ))}
            <View style={styles.divider} />
            <Text style={styles.footer}>NCHRG — Terms & Conditions</Text>
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default TermsConditions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginBottom: 10,
    paddingTop: 20,
  },
  headerTitle: { fontSize: 24 },
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
