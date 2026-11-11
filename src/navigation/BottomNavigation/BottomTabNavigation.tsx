import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import {
  createBottomTabNavigator,
  BottomTabBar,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  Image,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTutorialContext } from '../../tutorial/TutorialContext';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import { useSelectedBusiness } from '../../hooks/useSelectedBusiness';
import {
  BOTTOM_TAB_SCREENS,
  BUSINESS_BOTTOM_TAB_SCREENS,
} from '../../utils/routes';
import colors from '../../utils/colors';
import type { BottomTabScreen } from '../../types/routes.types';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getConnectionRequestsReceivedAsync, getEmergencyconnectionsAsync } from '../../redux/services/connectionService';
import { getTodayRemindersAsync, getUpcomingRemindersAsync } from '../../redux/services/reminderService';
import { ASYNC_STATUS } from '../../config/constants';
import { setConnectionAndEmergencyRequestsCount } from '../../redux/slices/connectionSlice';
import { AppDispatch } from '../../types/store.types';
import { makeBottomTabNavigationStyles } from './BottomTabNavigation.styles';
import { RoleTheme } from '../../types/roleManager.types';

const Tab = createBottomTabNavigator();

const TutorialAwareTabBar: React.FC<BottomTabBarProps & { theme: any }> = (props) => {
  const wrapperRef = useRef<View>(null);
  const { theme } = props;
  const { step, setSpotlightRect, setSpotlightAction, nextStep } = useTutorialContext();

  useEffect(() => {
    if (step !== 'spotlight_account_tab') return;
    const timer = setTimeout(() => {
      wrapperRef.current?.measureInWindow((x, y, w, h) => {
        if (w <= 0 || h <= 0) return;
        const routes = props.state.routes;
        const total = routes.length;
        const accountIdx = routes.findIndex((r) => r.name === 'Account');
        const idx = accountIdx >= 0 ? accountIdx : total - 1;
        const cellWidth = w / total;
        setSpotlightRect({ x: x + cellWidth * idx, y, width: cellWidth, height: h });
      });
      setSpotlightAction(() => {
        nextStep();
        props.navigation.navigate('Account');
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <View style={{ backgroundColor: theme.background }} ref={wrapperRef} collapsable={false}>
      <BottomTabBar {...props} />
    </View>
  );
};

const BottomTabNavigation: React.FC = () => {
  const { t } = useTranslation();
  const { isBusinessRole, themeColors } = useUserRole();
  const dispatch = useDispatch<AppDispatch>();

  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => makeBottomTabNavigationStyles(themeColors as RoleTheme, windowWidth, insets.bottom),
    [themeColors, windowWidth, insets.bottom],
  );
  const isBusiness = isBusinessRole();
  const type = isBusiness ? 'Business' : 'Personal';
  const { selectedBusinessId } = useSelectedBusiness();

  const {
    get_connection_requests_received_data,
    get_connection_requests_received_status,
    get_emergency_requests_data,
    get_emergency_requests_status,
    connection_and_emergency_requests_count,
  } = useSelector((state: any) => state.connection_slice);

  const {
    pending_reminders_count,
  } = useSelector((state: any) => state.reminder_slice);

  // Fetch on focus
  useFocusEffect(
    useCallback(() => {
      dispatch(getConnectionRequestsReceivedAsync({ targetAccountType: type }));
      dispatch(getEmergencyconnectionsAsync({ targetAccountType: type }));
      dispatch(getTodayRemindersAsync({
        isBusiness,
        status: 'today',
        ...(isBusiness && selectedBusinessId ? { businessId: selectedBusinessId } : {}),
      }));
      dispatch(getUpcomingRemindersAsync({
        isBusiness,
        status: 'upcoming',
        ...(isBusiness && selectedBusinessId ? { businessId: selectedBusinessId } : {}),
      }));
    }, [type, isBusiness, selectedBusinessId])
  );

  // Connections count
  useEffect(() => {
    if (
      get_connection_requests_received_status === ASYNC_STATUS.SUCCEEDED &&
      get_emergency_requests_status === ASYNC_STATUS.SUCCEEDED
    ) {
      const total =
        (get_connection_requests_received_data?.connectionrequests?.length || 0) +
        (get_emergency_requests_data?.emergencyaccessrequests?.length || 0);

      dispatch(setConnectionAndEmergencyRequestsCount(total));
    }
  }, [
    get_connection_requests_received_status,
    get_emergency_requests_status,
    get_connection_requests_received_data,
    get_emergency_requests_data,
    dispatch,
  ]);

  // Memoize screens
  const tabScreens: BottomTabScreen[] = React.useMemo(
    () => (isBusiness ? BUSINESS_BOTTOM_TAB_SCREENS : BOTTOM_TAB_SCREENS),
    [isBusiness]
  );

  return (
    <Tab.Navigator
      tabBar={(props) => <TutorialAwareTabBar {...props} theme={themeColors} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      }}

    >
      {tabScreens.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.tabLabel,
                  { color: focused ? themeColors.textPrimary : themeColors.textSecondary },
                ]}
              >
                {t(screen.label)}
              </Text>
            ),
            tabBarIcon: ({ focused, size }) => (
              <View>
                <Image
                  source={screen.icon}
                  style={[
                    styles.tabIcon,
                    {
                      width: size || 24,
                      height: size || 24,
                      tintColor: focused ? themeColors.textPrimary : themeColors.textSecondary,
                    },
                  ]}
                  resizeMode="contain"
                />

                {/* Connections Badge */}
                {screen.name === 'Connections' &&
                  connection_and_emergency_requests_count > 0 && (
                    <View style={[styles.countBubble, { backgroundColor: themeColors.primary }]}>
                      <Text style={styles.countBubbleText}>
                        {String(connection_and_emergency_requests_count).length > 2
                          ? '99+'
                          : connection_and_emergency_requests_count}
                      </Text>
                    </View>
                  )}

                {/* Reminders Badge */}
                {screen.name === 'Reminders' &&
                  pending_reminders_count > 0 && (
                    <View style={[styles.countBubble, { backgroundColor: themeColors.primary }]}>
                      <Text style={styles.countBubbleText}>
                        {String(pending_reminders_count).length > 2
                          ? '99+'
                          : pending_reminders_count}
                      </Text>
                    </View>
                  )}
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
