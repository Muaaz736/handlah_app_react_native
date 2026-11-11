import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TutorialProvider } from '../../tutorial/TutorialContext';
import { TutorialOverlay } from '../../tutorial/TutorialOverlay';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  getAvailableScreens,
  getInitialRoute,
  getUserCompletionStatus,
} from '../../utils/routes';
import type { StackScreen } from '../../types/routes.types';
import type {
  StackScreenOptions,
} from '../../types/stackNavigation.types';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS } from '../../config/constants';
import { getTokens, clearAllSecureData } from '../../config/apiHandle';
import { getVerificationToken, getAccessToken, saveAccessToken } from '../../services/secureStorage/tokenStorage';
import { setInitialAuth, setOfflineAuth, clearAuth, clearRequiresVerification } from '../../redux/slices/authSlice';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { checkAuthAsync, updateUserTimeZoneAsync, registerFCMTokenAsync } from '../../redux/services/authService';
import { getNotificationsAsync } from '../../redux/services/notificationsService';
import { getFCMToken, getOrCreateDeviceId } from '../../services/notifications/NotificationService';
import { ensureBiometricDeviceRegistered } from '../../utils/biometricRegistration';
import { syncThemeOnLogin } from '../../utils/themeSync';
import messaging from '@react-native-firebase/messaging';
import { isIOS } from '../../utils/helpers';
import { useUserRole } from '../../hooks/useUserRole';
import { useTranslation } from 'react-i18next';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { getInitialNotification } from '../../services/notifications/NotificationService';
import { resolveScreenFromNotification, buildSharedBusinessFromNotification } from '../../utils/notificationNavigator';
import { setSelectedBusinessId } from '../../redux/slices/businessSlice';
import { setSelectedSharedBusiness } from '../../redux/slices/sharingSlice';
import { setUserRole } from '../../redux/slices/userRoleSlice';
import { USER_ROLES } from '../../utils/roleManager';
import { styles, fabStyles } from './Stackstyles';
import { navigationRef } from '../navigationRef';
import { ICONS } from '../../utils/Images';
import { AppDispatch } from '../../types/store.types';
import { SCREEN_TYPES } from '../../utils/staticData';
import { usePurchases } from '../../services/purchases/PurchasesProvider';
import SubscriptionRequiredScreen from '../../components/SubscriptionRequired/SubscriptionRequiredScreen';
import BusinessAccessGuard from '../../components/SubscriptionRequired/BusinessAccessGuard';

const { width, height } = Dimensions.get('window');

const FAB_EXCLUDED_SCREENS = new Set([
  'AiChatbot', 'AiAssistant',
  'OnBoarding', 'Login', 'Signup', 'ForgotPassword', 'NewPassword',
  'EmailVerification', 'OtpVerification', 'MfaVerification', 'UpdateEmail',
  'VerifyPhoneNumber', 'ProfileUpload', 'ProfileSetup', 'BusinessPlanSelection',
  'Home',
  'Connections',
  'Reminders',
  'IdentityPassportForm',
  'IdentityDriverLicenseForm',
  'IdentityLicenseCertificationsForm',
]);

// Shared screens reachable both while logged out (e.g. Signup) and logged in (e.g. Account) —
// the FAB should only show when reached from the logged-in Account flow.
const FAB_LOGGED_OUT_EXCLUDED_SCREENS = new Set(['PrivacyPolicy', 'TermsConditions']);

const DASHBOARD_TAB_SCREENS = new Set([
  'Home', 'Connections', 'AiAssistant', 'Reminders', 'Account',
]);


const getActiveRouteName = (state: any): string | null => {
  if (!state || !state.routes) return null;

  const route = state.routes[state.index ?? 0];

  if (route.state) {
    return getActiveRouteName(route.state);
  }

  return route.name ?? null;
};


interface AiFabProps {
  visible: boolean;
  primaryColor: string;
}
const AiFab: React.FC<AiFabProps> = ({ visible, primaryColor }) => {
  if (!visible) return null;
  return (
    <TouchableOpacity
      style={[fabStyles.btn, { backgroundColor: primaryColor }]}
      onPress={() => {
        if (navigationRef.isReady()) {
          const currentRoute = getActiveRouteName(navigationRef.getRootState());
          if (currentRoute && DASHBOARD_TAB_SCREENS.has(currentRoute)) {
            navigationRef.navigate('Dashboard', { screen: 'AiAssistant' } as never);
          } else {
            navigationRef.navigate('AiChatbot');
          }
        }
      }}
      activeOpacity={0.85}
    >
      <Image source={ICONS.APP_ICON} style={fabStyles.icon} resizeMode="contain" />
    </TouchableOpacity>
  );
};



const Stack = createNativeStackNavigator();

const Stacknavigation: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors, userRole, customColors, darkMode } = useUserRole();
  const { t } = useTranslation();
  const { check_auth_status, check_auth_error, user_auth, user_data, requires_verification } =
    useSelector((state: any) => state.user_auth);

  const [networkChecked, setNetworkChecked] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [activeRouteName, setActiveRouteName] = useState<string | null>(null);
  const { ready: purchasesReady, loaded: purchasesLoaded, hasPersonal } = usePurchases();


  const authInitiated = useRef(false);


  const initialAuthDone = useRef(false);

  useEffect(() => {

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const offline = state.isConnected === false;
      setIsOffline(offline);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {

      if (authInitiated.current) return;
      authInitiated.current = true;

      try {

        const { accessToken } = await getTokens();
        let tokenForAuth = accessToken;

        if (!tokenForAuth) {
          const verificationToken = await getVerificationToken();
          if (verificationToken) {
            await saveAccessToken(verificationToken);
            tokenForAuth = verificationToken;
          }
        }

        if (!tokenForAuth) {
          dispatch(setInitialAuth(false));
          setNetworkChecked(true);
          return;
        }

        const networkState = await NetInfo.fetch();
        const deviceIsOffline = networkState.isConnected === false;
        setIsOffline(deviceIsOffline);
        setNetworkChecked(true);

        if (deviceIsOffline) {

          dispatch(setOfflineAuth());
        } else {

          dispatch(checkAuthAsync());
        }
      } catch (error) {
        setNetworkChecked(true);
        dispatch(setInitialAuth(false));
      }
    };

    initializeAuth();
  }, []);


  const prevOfflineRef = useRef(false);
  useEffect(() => {
    const wasOffline = prevOfflineRef.current;
    prevOfflineRef.current = isOffline;

    if (wasOffline && !isOffline && user_auth) {
      dispatch(checkAuthAsync());
    }
  }, [isOffline]);


  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState === 'active' && user_auth) {
        const networkState = await NetInfo.fetch();
        if (networkState.isConnected !== false) {

          dispatch(checkAuthAsync());
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [user_auth]);

  const navigateFromPushData = useCallback(
    (data: any) => {
      if (!data) return;
      const target = resolveScreenFromNotification({
        ...data,
        notificationType: data?.notificationType ?? data?.type,
        url: data?.url,
      });
      const bId = data?.businessId || data?.business_id || target?.params?.businessId;
      if (bId) {
        dispatch(setUserRole(USER_ROLES.BUSINESS));
        dispatch(setSelectedBusinessId(Number(bId)));
        const sharedBusiness = buildSharedBusinessFromNotification(data);
        if (sharedBusiness) {
          dispatch(setSelectedSharedBusiness(sharedBusiness));
        }
      } else if (userRole === USER_ROLES.BUSINESS) {
        dispatch(setUserRole(USER_ROLES.PERSONAL));
      }
      if (target && navigationRef.isReady()) {
        (navigationRef as any).navigate(target.screen, target.params ?? undefined);
      }
    },
    [dispatch, userRole],
  );

  useEffect(() => {
    getInitialNotification().then((remoteMessage) => {
      if (!remoteMessage) return;
      const data = remoteMessage.data as any;
      // Delay until navigator is ready
      const interval = setInterval(() => {
        if (navigationRef.isReady()) {
          clearInterval(interval);
          navigateFromPushData(data);
        }
      }, 100);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      const data = remoteMessage?.data as any;
      navigateFromPushData(data);
    });
    return () => unsubscribe();
  }, [navigateFromPushData]);

  const handleLoginRedirect = useCallback(async () => {
    try {
      await clearAllSecureData();
    } catch (_) { }
    dispatch(clearAuth());
  }, [dispatch]);

  useEffect(() => {
    if (check_auth_status === ASYNC_STATUS.ERROR && !isOffline && !user_auth) {
      clearAllSecureData().catch(() => {});
      dispatch(clearAuth());
      dispatch(setInitialAuth(false));
    }
  }, [check_auth_status, isOffline, user_auth, dispatch]);

  // useEffect(() => {
  //   if (!requires_verification || !user_data) return;

  //   const autoResendOtp = async () => {
  //     const verificationToken =
  //       (await getVerificationToken()) || (await getAccessToken()) || '';

  //     const emailVerified = user_data.isemailverified;
  //     const phoneVerified = user_data.isphoneverified;

  //     if (!emailVerified) {
  //       dispatch(resendEmailOtpAsync({
  //         verificationToken,
  //         type: 'email',
  //         newEmail: user_data.email,
  //       } as any));
  //     }

  //     if (!phoneVerified) {
  //       dispatch(resendEmailOtpAsync({
  //         verificationToken,
  //         type: 'phone',
  //         newPhone: user_data.phonenumber,
  //         countryCode: user_data.countrycode || '',
  //       } as any));
  //     }
  //   };

  //   autoResendOtp();
  //   // dispatch(clearRequiresVerification());
  // }, [requires_verification, user_data, dispatch]);

  useEffect(() => {
    if (check_auth_status === ASYNC_STATUS.SUCCEEDED && user_data) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      dispatch(updateUserTimeZoneAsync({ timeZoneId: timeZone } as any));

    
      dispatch(getNotificationsAsync({ page: 1, pageSize: 20 }));

      (async () => {
        const token = await getFCMToken();
        if (token) {
          const deviceId = await getOrCreateDeviceId();
          dispatch(registerFCMTokenAsync({
            token,
            deviceId,
            platform: isIOS ? 'ios' : 'android',
          }));
        }
      })();

      ensureBiometricDeviceRegistered(dispatch);
      syncThemeOnLogin(dispatch, customColors, darkMode);
    }
  }, [check_auth_status, user_data])

  const screenOptions: StackScreenOptions = {
    headerShown: false,
    gestureEnabled: false,
    headerTintColor: '#fff',
    headerBackTitleVisible: false,
    cardStyle: { backgroundColor: 'transparent' },
  };

  useEffect(() => {
    if (
      !initialAuthDone.current &&
      (check_auth_status === ASYNC_STATUS.SUCCEEDED ||
        check_auth_status === ASYNC_STATUS.ERROR)
    ) {
      initialAuthDone.current = true;
    }
  }, [check_auth_status]);


  const isAuthLoading =
    !initialAuthDone.current &&
    (!networkChecked ||
      check_auth_status === ASYNC_STATUS.IDLE ||
      check_auth_status === ASYNC_STATUS.LOADING);

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (
    check_auth_status === ASYNC_STATUS.ERROR &&
    !isOffline &&
    !user_auth
  ) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{t('common.something_went_wrong')}</Text>
        <Text style={styles.errorDescription}>
          {t('common.auth_check_issue')}
        </Text>
        <TouchableOpacity
          onPress={handleLoginRedirect}
          style={[styles.loginButton, { backgroundColor: themeColors.primary }]}
        >
          <Text style={styles.loginButtonText}>
            {t('common.go_to_login')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }


  if (
    check_auth_status === ASYNC_STATUS.SUCCEEDED ||
    (initialAuthDone.current && user_auth)
  ) {
    const userCompletionStatus = getUserCompletionStatus(user_data);
    const availableScreens = getAvailableScreens(userCompletionStatus);
    const initialRoute = getInitialRoute(user_data, user_auth);

    const needsSubscriptionGate =
      user_auth && userCompletionStatus === SCREEN_TYPES.PRIVATE && purchasesReady;

    if (needsSubscriptionGate && !purchasesLoaded) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (needsSubscriptionGate && !hasPersonal) {
      return <SubscriptionRequiredScreen />;
    }

    return (
      <TutorialProvider>
        <View style={styles.rootContainer}>
          <NavigationContainer
            ref={navigationRef}
            onReady={() => {
              setActiveRouteName(getActiveRouteName(navigationRef.getRootState()) ?? null);
            }}
            onStateChange={(state) => {
              setActiveRouteName(getActiveRouteName(state) ?? null);
            }}
          >
            <Stack.Navigator
              screenOptions={screenOptions}
              initialRouteName={initialRoute}
            >
              {availableScreens.map((screen: StackScreen) => {
                const { name, component, header_shown } = screen;
                return (
                  <Stack.Screen
                    key={name}
                    name={name}
                    options={{ headerShown: header_shown }}
                    component={component}
                  />
                );
              })}
            </Stack.Navigator>
            <BusinessAccessGuard
              enabled={Boolean(needsSubscriptionGate)}
              activeRouteName={activeRouteName}
            />
            <AiFab
              visible={
                !!activeRouteName &&
                !FAB_EXCLUDED_SCREENS.has(activeRouteName) &&
                !(FAB_LOGGED_OUT_EXCLUDED_SCREENS.has(activeRouteName) && !user_auth)
              }
              primaryColor={themeColors.primary}
            />
          </NavigationContainer>
          <TutorialOverlay />
        </View>
      </TutorialProvider>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={themeColors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};



export default Stacknavigation;
