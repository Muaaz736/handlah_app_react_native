import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenWrapper from '../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, showErrorToast } from '../../../components/common';
import colors from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import { downloadAndOpenDocument } from '../../../utils/helpers';
import { AppDispatch } from '../../../types/store.types';
import {
  getImageAsync,
  getModuleGuidesAsync,
} from '../../../redux/services/authService';
import { useUserRole } from '../../../hooks/useUserRole';
import { useTutorialContext } from '../../../tutorial/TutorialContext';

type GuideDetailRoute = RouteProp<
  { GuideDetail: { routeKey: string; title?: string } },
  'GuideDetail'
>;

const GuideDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<GuideDetailRoute>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors, isBusinessRole } = useUserRole();
  const isBusiness = isBusinessRole();

  const routeKey = route.params?.routeKey;
  const title = route.params?.title || t('user_guide.title');

  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [guideUrl, setGuideUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('guide.pdf');

  // Tutorial wiring for the final "guide_detail" step.
  const { step: tutorialStep, setSpotlightRect, nextStep: nextTutorialStep } = useTutorialContext();
  const guideCardRef = useRef<View>(null);
  // Whether we arrived here as part of the tutorial (don't auto-open the PDF then,
  // so the "Complete Tutorial" step stays visible).
  const arrivedViaTutorialRef = useRef(
    tutorialStep === 'spotlight_guide_module' || tutorialStep === 'guide_detail',
  );
  const autoOpenedRef = useRef(false);

  // Resolve the guide's signed file URL for the requested module.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!routeKey) {
        setLoading(false);
        return;
      }
      try {
        const guides: any = await dispatch(getModuleGuidesAsync({ routeKey })).unwrap();
        const list = Array.isArray(guides) ? guides : [];
       
        const first =
          list.find((g: any) => Boolean(g?.isbusiness ?? g?.isBusiness) === isBusiness) ??
          list[0] ??
          null;
        const imageId = first?.imageid || first?.imageId;
        if (!imageId) {
          if (!cancelled) setLoading(false);
          return;
        }
        const image: any = await dispatch(getImageAsync(imageId)).unwrap();
        const signedUrl = image?.signedurl || image?.signedUrl || image?.url;
        const name = image?.filename || image?.fileName || `${title}.pdf`;
        if (cancelled) return;
        if (signedUrl) {
          setGuideUrl(signedUrl);
          setFileName(name);
        }
      } catch {
        // Leave guideUrl null -> "no guide" message is shown.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch, routeKey, title, isBusiness]);

  const openGuide = useCallback(async () => {
    if (!guideUrl) return;
    setOpening(true);
    try {
      await downloadAndOpenDocument(guideUrl, fileName);
    } catch {
      showErrorToast(t('user_guide.failed_to_load'));
    } finally {
      setOpening(false);
    }
  }, [guideUrl, fileName, t]);

  // Outside the tutorial, open the PDF automatically so the user sees it right away.
  useEffect(() => {
    if (
      !loading &&
      guideUrl &&
      !autoOpenedRef.current &&
      !arrivedViaTutorialRef.current
    ) {
      autoOpenedRef.current = true;
      openGuide();
    }
  }, [loading, guideUrl, openGuide]);

  // When arriving here during the module-spotlight step, advance to the final step.
  useEffect(() => {
    if (tutorialStep === 'spotlight_guide_module') {
      nextTutorialStep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorialStep]);

  // Spotlight the guide card on the final tutorial step (once content has settled).
  useFocusEffect(
    useCallback(() => {
      if (tutorialStep !== 'guide_detail') return undefined;
      const timer = setTimeout(() => {
        guideCardRef.current?.measureInWindow((x, y, w, h) => {
          if (w > 0 && h > 0) {
            setSpotlightRect({ x, y, width: w, height: h });
          }
        });
      }, 400);
      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tutorialStep, loading, guideUrl]),
  );

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <AuthHeader
        title={title}
        showBackButton
        onBackPress={() => navigation.goBack()}
        containerStyle={styles.header}
        titleStyle={styles.headerTitle}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />

      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator size="large" color={themeColors.primary} />
        ) : guideUrl ? (
          <TouchableOpacity
            ref={guideCardRef}
            
            style={[styles.card, { borderColor: themeColors.border, backgroundColor: themeColors.surface }]}
            activeOpacity={0.85}
            onPress={openGuide}
            disabled={opening}
          >
            <View style={[styles.iconCircle, { backgroundColor: themeColors.primary }]}>
              {opening ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="document-text-outline" size={34} color={themeColors.background} />
              )}
            </View>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>{title}</Text>
            <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>{t('user_guide.view_guide_hint')}</Text>
            <View style={[styles.openBtn, { backgroundColor: themeColors.primary }]}>
              <Text style={styles.openBtnText}>{t('user_guide.view_guide')}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: colors.gray }]}>
              <Ionicons name="document-outline" size={34} color={themeColors.background} />
            </View>
            <Text style={styles.cardSubtitle}>{t('user_guide.no_guide')}</Text>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 8,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: FONTS.display_semi_bold,
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    textAlign: 'center',
    marginBottom: 20,
  },
  openBtn: {
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 36,
  },
  openBtnText: {
    fontSize: 15,
    fontFamily: FONTS.display_bold,
    color: colors.white,
  },
});

export default GuideDetailScreen;
