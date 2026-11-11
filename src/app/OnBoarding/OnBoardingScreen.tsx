import React, { useEffect, useState, useMemo } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../../utils/colors';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  OnBoardingScreenNavigationProp,
  OnBoardingScreenProps,
} from '../../types/onBoardingScreen.types';
import { makeCommonStyles, makeOnBoardingScreenStyles } from './OnBoardingScreen.styles';
import { RoleTheme } from '../../types/roleManager.types';

const ONBOARDING_IMAGES: Record<string, any> = {
  en: require('../../assets/images/BGimages/en_onBoarding.png'),
  ar: require('../../assets/images/BGimages/ar_onBoarding.png'),
  es: require('../../assets/images/BGimages/es_onBoarding.png'),
  fr: require('../../assets/images/BGimages/fr_onBoarding.png'),
  de: require('../../assets/images/BGimages/de_onBoarding.png'),
  pt: require('../../assets/images/BGimages/pt_onBoarding.png'),
  zh: require('../../assets/images/BGimages/zh_onBoarding.png'),
  ja: require('../../assets/images/BGimages/ja_onBoarding.png'),
  ko: require('../../assets/images/BGimages/ko_onBoarding.png'),
  hi: require('../../assets/images/BGimages/hi_onBoarding.png'),
  ru: require('../../assets/images/BGimages/Ru_onBoarding.png'),
  it: require('../../assets/images/BGimages/it_onBoarding.png'),
  du: require('../../assets/images/BGimages/du_onBoarding.png'),
  po: require('../../assets/images/BGimages/po_onBoarding.png'),
  tu: require('../../assets/images/BGimages/tu_onBoarding.png'),
  th: require('../../assets/images/BGimages/th_onBoarding.png'),
  id: require('../../assets/images/BGimages/id_onBoarding.png'),
  vt: require('../../assets/images/BGimages/vt_onBoarding.png'),
  he: require('../../assets/images/BGimages/he_onBoarding.png'),
  ur: require('../../assets/images/BGimages/ur_onBoarding.png'),
};

const OnBoardingScreen: React.FC<OnBoardingScreenProps> = () => {
  const { t, i18n } = useTranslation();
  const { themeColors } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeOnBoardingScreenStyles(themeColors as RoleTheme), [themeColors]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const navigation = useNavigation<OnBoardingScreenNavigationProp>();

  useEffect(() => {
    const initializeLanguage = async (): Promise<void> => {
      try {
        if (i18n.isInitialized) {
          setIsReady(true);
        } else {
          const checkInit = setInterval(() => {
            if (i18n.isInitialized) {
              setIsReady(true);
              clearInterval(checkInit);
            }
          }, 100);
        }
      } catch (error) {
        setIsReady(true);
      }
    };

    initializeLanguage();
  }, [i18n]);

  if (!isReady) {
    return (
      <View style={commonStyles.container}>
        <StatusBar
          barStyle="light-content"
          translucent
        />
      </View>
    );
  }

  const currentLang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'en';
  const backgroundImageSource = ONBOARDING_IMAGES[currentLang] || ONBOARDING_IMAGES.en;

  return (
    <View style={commonStyles.container}>
      <ImageBackground
        source={backgroundImageSource}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={() => navigation.navigate('Signup')}
                activeOpacity={0.9}
              >
                <Text style={styles.getStartedText} allowFontScaling={false}>
                  {t('onboarding.get_started')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>{t('onboarding.log_in')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default OnBoardingScreen;