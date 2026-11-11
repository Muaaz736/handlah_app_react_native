import { ActivityIndicator, Text, View } from 'react-native';
import { makeLanguagesStyles } from './Languages.styles';
import React, { useCallback, useState, useMemo } from 'react';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import {
  AuthHeader,
  PrimaryButton,
  CustomDropDown,
} from '../../../../../components/common';
import colors from '../../../../../utils/colors';
import { SUPPORTED_LANGUAGES } from '../../../../../localization/supportedLanguages';
import FONTS from '../../../../../utils/fonts';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../../../../localization/languageService';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { getDefaultLanguage } from '../../../../../localization/i18n';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { LanguagesNavigationProp, LanguageOption } from './Languages.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const Languages: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<LanguagesNavigationProp>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeLanguagesStyles(themeColors as RoleTheme), [themeColors]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isChanging, setIsChanging] = useState<boolean>(false);

  const languageOptions: LanguageOption[] = Object.entries(
    SUPPORTED_LANGUAGES,
  ).map(([key, value]) => ({
    label: value.labelKey,
    value: key,
  }));

  const handleLanguagesChange = (value: string): void => {
    setSelectedLanguage(value);
  };

  const handleSaveChanges = async (): Promise<void> => {
    setIsChanging(true);

    const didRestart = await changeLanguage(selectedLanguage);

    // If the app restarted (RTL change), this code won't execute.
    // For non-restart changes, show loader briefly then navigate to Home.
    if (!didRestart) {
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          }),
        );
      }, 800);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getDefaultLanguage().then((lang: string) => setSelectedLanguage(lang));
    }, []),
  );

  return (
    <ScreenWrapper
      scrollable={false}
      showShadow={false}
      containerStyle={styles.screenContainer}
    >
      <AuthHeader
        title={t('languages.language')}
        subtitle={t('languages.preferred_language_subtitle')}
        onBackPress={() => navigation.goBack()}
        containerStyle={styles.authHeaderContainer}
        backButtonIconStyle={{ tintColor: themeColors.textSecondary }}
      />

      <View style={styles.contentContainer}>
        <View style={styles.dropdownContainer}>
          <Text style={styles.fieldLabel}>
            {' '}
            {t('languages.select_language')}
          </Text>
          <CustomDropDown
            options={languageOptions}
            value={selectedLanguage}
            onSelect={(value: any) => handleLanguagesChange(value)}
            placeholder={t('languages.select')}
            searchPlaceholder={`${t('languages.search_language')}...`}
            search={true}
            leftIcon={true}
          />
        </View>

        <PrimaryButton
          title={t('common.save_changes')}
          onPress={handleSaveChanges}
          buttonStyle={styles.saveButton}
          textStyle={styles.saveButtonText}
          loading={isChanging}
          disabled={isChanging}
        />
      </View>

      {/* Full-screen loader overlay during language switch */}
      {isChanging && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loaderText}>{t('languages.changing_language')}</Text>
        </View>
      )}
    </ScreenWrapper>
  );
};

export default Languages;
