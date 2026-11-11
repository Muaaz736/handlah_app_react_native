import { Text, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, CustomTabs } from '../../../../../components/common';
import CustomRequestCard from '../../../../../components/CustomCards/CustomRequestCard';
import colors from '../../../../../utils/colors';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { makeConnectionsRequestStyles } from './ConnectionsRequest.styles';
import { Request, RequestTab, RequestsData } from './ConnectionsRequest.types';
import { useDispatch, useSelector } from 'react-redux';
import {
  acceptConnectionRequestAsync,
  checkConnectionRequestAsync,
  declineConnectionRequestAsync,
  getConnectionRequestsReceivedAsync,
  getConnectionRequestsSentAsync,
  getEmergencyconnectionsAsync,
  approveEmergencyRequestAsync,
  rejectEmergencyRequestAsync,
} from '../../../../../redux/services/connectionService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import Toast from 'react-native-toast-message';
import {
  showSuccessToast,
  showErrorToast,
} from '../../../../../components/common/CustomToast';
import AcceptConnectionModal from '../../../../../components/CustomModals/AcceptConnectionModal';
import AcceptBothConnectionModal, {
  AcceptBothPayload,
  AcceptSinglePayload,
} from '../../../../../components/CustomModals/AcceptBothConnectionModal';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const ConnectionsRequest = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors, isBusinessRole } = useUserRole();
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const styles = useMemo(() => makeConnectionsRequestStyles(themeColors as RoleTheme), [themeColors]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [acceptModalVisible, setAcceptModalVisible] = useState<boolean>(false);
  const [pendingAcceptRequest, setPendingAcceptRequest] = useState<any>(null);
  const [bothModalVisible, setBothModalVisible] = useState<boolean>(false);
  const [pendingCrossRequest, setPendingCrossRequest] = useState<any>(null);
  const [checkingRequestId, setCheckingRequestId] = useState<number | null>(null);
  const [approvingRequestId, setApprovingRequestId] = useState<number | null>(
    null,
  );
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(
    null,
  );

  const {
    get_connection_requests_sent_status,
    get_connection_requests_sent_data,
    get_connection_requests_received_status,
    get_connection_requests_received_data,
    get_emergency_requests_status,
    get_emergency_requests_data,
  } = useSelector((state: any) => state.connection_slice);

  const loading =
    get_connection_requests_sent_status === ASYNC_STATUS.LOADING ||
    get_connection_requests_received_status === ASYNC_STATUS.LOADING ||
    get_emergency_requests_status === ASYNC_STATUS.LOADING;

  useFocusEffect(
    useCallback(() => {
      const type = isBusinessRole() ? 'Business' : 'Personal';

      dispatch(getConnectionRequestsSentAsync({ targetAccountType: type }));
      dispatch(getConnectionRequestsReceivedAsync({ targetAccountType: type }));
      dispatch(getEmergencyconnectionsAsync({ targetAccountType: type }));
    }, [dispatch]),
  );

  const REQUEST_TABS = useMemo(
    () => [
      {
        key: 'received',
        label: t('connections_request.tab_received'),
        count:
          get_connection_requests_received_data?.connectionrequests?.length ||
          0,
      },
      {
        key: 'sent',
        label: t('connections_request.tab_sent'),
        count:
          get_connection_requests_sent_data?.connectionrequests?.length || 0,
      },
      {
        key: 'emergency',
        label: t('connections_request.tab_emergency'),
        count:
          get_emergency_requests_data?.emergencyaccessrequests?.length || 0,
      },
    ],
    [
      get_connection_requests_received_data,
      get_connection_requests_sent_data,
      get_emergency_requests_data,
      t,
    ],
  );

  const handleTabChange = useCallback((index: number): void => {
    setActiveTab(index);
  }, []);

  const handleAccept = useCallback(
    async (request: any): Promise<void> => {
      checkSubscription(async () => {
        const currentType = isBusinessRole() ? 'Business' : 'Personal';
        const oppositeType = currentType === 'Personal' ? 'Business' : 'Personal';
        setCheckingRequestId(request.id);
        try {
          const crossSide = await dispatch(
            checkConnectionRequestAsync({
              userId: request.senderuser?.id,
              targetAccountType: oppositeType,
            }),
          ).unwrap();
          if (crossSide) {
            setPendingAcceptRequest(request);
            setPendingCrossRequest(crossSide);
            setBothModalVisible(true);
          } else {
            setPendingAcceptRequest(request);
            setAcceptModalVisible(true);
          }
        } catch {
          setPendingAcceptRequest(request);
          setAcceptModalVisible(true);
        } finally {
          setCheckingRequestId(null);
        }
      }, isBusinessRole() ? 'business' : 'personal');
    },
    [dispatch, isBusinessRole, checkSubscription],
  );

  const handleConfirmSingle = useCallback(
    async (payload: AcceptSinglePayload): Promise<void> => {
      if (!pendingAcceptRequest) return;
      setIsActionInProgress(true);
      try {
        await dispatch(
          acceptConnectionRequestAsync({
            requestId: pendingAcceptRequest.id,
            businessIds: payload.businessIds,
            socialNetworkIds: payload.socialNetworkIds,
            businessRoles: payload.businessRoles,
          }),
        ).unwrap();
        setBothModalVisible(false);
        setPendingAcceptRequest(null);
        setPendingCrossRequest(null);
        Toast.show({ type: 'success', text1: t('connections_screen.accept_success') });
        dispatch(
          getConnectionRequestsReceivedAsync({
            targetAccountType: isBusinessRole() ? 'Business' : 'Personal',
          }),
        );
      } catch {
        Toast.show({ type: 'error', text1: t('connections_screen.accept_error') });
      } finally {
        setIsActionInProgress(false);
      }
    },
    [dispatch, isBusinessRole, pendingAcceptRequest, t],
  );

  const handleConfirmBoth = useCallback(
    async (payload: AcceptBothPayload): Promise<void> => {
      if (!pendingAcceptRequest || !pendingCrossRequest) return;
      setIsActionInProgress(true);
      try {
        const currentIsBusiness = isBusinessRole();
        // pendingAcceptRequest = current side, pendingCrossRequest = opposite side
        await Promise.all([
          dispatch(
            acceptConnectionRequestAsync({
              requestId: pendingAcceptRequest.id,
              ...(currentIsBusiness
                ? { businessIds: payload.businessIds, socialNetworkIds: payload.businessSocialNetworkIds, businessRoles: payload.businessRoles }
                : { socialNetworkIds: payload.personalSocialNetworkIds }),
            }),
          ).unwrap(),
          dispatch(
            acceptConnectionRequestAsync({
              requestId: pendingCrossRequest.id,
              ...(currentIsBusiness
                ? { socialNetworkIds: payload.personalSocialNetworkIds }
                : { businessIds: payload.businessIds, socialNetworkIds: payload.businessSocialNetworkIds, businessRoles: payload.businessRoles }),
            }),
          ).unwrap(),
        ]);
        setBothModalVisible(false);
        setPendingAcceptRequest(null);
        setPendingCrossRequest(null);
        Toast.show({ type: 'success', text1: t('connections_screen.accept_success') });
        dispatch(
          getConnectionRequestsReceivedAsync({
            targetAccountType: isBusinessRole() ? 'Business' : 'Personal',
          }),
        );
      } catch {
        Toast.show({ type: 'error', text1: t('connections_screen.accept_error') });
      } finally {
        setIsActionInProgress(false);
      }
    },
    [dispatch, isBusinessRole, pendingAcceptRequest, pendingCrossRequest, t],
  );

  const handleConfirmAccept = useCallback(
    (businessIds: number[], socialNetworkIds: number[], businessRoles?: Record<number, 'standard' | 'owner_admin'>): void => {
      if (!pendingAcceptRequest) return;
      setIsActionInProgress(true);
      dispatch(
        acceptConnectionRequestAsync({
          requestId: pendingAcceptRequest.id,
          businessIds,
          socialNetworkIds,
          businessRoles,
        }),
      )
        .unwrap()
        .then(() => {
          setAcceptModalVisible(false);
          setPendingAcceptRequest(null);
          Toast.show({
            type: 'success',
            text1: t('connections_screen.accept_success'),
          });
          dispatch(
            getConnectionRequestsReceivedAsync({
              targetAccountType: isBusinessRole() ? 'Business' : 'Personal',
            }),
          );
        })
        .catch(() => {
          Toast.show({
            type: 'error',
            text1: t('connections_screen.accept_error'),
          });
        })
        .finally(() => {
          setIsActionInProgress(false);
        });
    },
    [dispatch, isBusinessRole, pendingAcceptRequest, t],
  );

  const handleDecline = useCallback(
    (id: number): void => {
      setIsActionInProgress(true);
      dispatch(declineConnectionRequestAsync({ requestId: id }))
        .unwrap()
        .then(() => {
          Toast.show({
            type: 'success',
            text1: t('connections_screen.decline_success'),
          });
          dispatch(
            getConnectionRequestsReceivedAsync({
              targetAccountType: isBusinessRole() ? 'Business' : 'Personal',
            }),
          );
        })
        .catch((error: any) => {
          Toast.show({
            type: 'error',
            text1: t('connections_screen.decline_error'),
          });
        })
        .finally(() => {
          setIsActionInProgress(false);
        });
    },
    [dispatch, isBusinessRole],
  );

  const refreshEmergencyRequests = useCallback((): void => {
    const type = isBusinessRole() ? 'Business' : 'Personal';
    dispatch(getEmergencyconnectionsAsync({ targetAccountType: type }));
  }, [dispatch, isBusinessRole]);

  const handleApproveEmergency = useCallback(
    (requestId: number): void => {
      setApprovingRequestId(requestId);
      dispatch(approveEmergencyRequestAsync({ requestId }))
        .unwrap()
        .then(() => {
          showSuccessToast(t('connections_screen.approve_emergency_success'));
          refreshEmergencyRequests();
        })
        .catch((error: any) => {
          const message =
            typeof error === 'string'
              ? error
              : error?.message ??
                t('connections_screen.approve_emergency_error');
          showErrorToast(message);
        })
        .finally(() => {
          setApprovingRequestId(null);
        });
    },
    [dispatch, t, refreshEmergencyRequests],
  );

  const handleRejectEmergency = useCallback(
    (requestId: number): void => {
      setRejectingRequestId(requestId);
      dispatch(rejectEmergencyRequestAsync({ requestId }))
        .unwrap()
        .then(() => {
          showSuccessToast(t('connections_screen.reject_emergency_success'));
          refreshEmergencyRequests();
        })
        .catch((error: any) => {
          const message =
            typeof error === 'string'
              ? error
              : error?.message ??
                t('connections_screen.reject_emergency_error');
          showErrorToast(message);
        })
        .finally(() => {
          setRejectingRequestId(null);
        });
    },
    [dispatch, t, refreshEmergencyRequests],
  );

  const getCurrentRequests = useCallback((): Request[] => {
    const tabKey = REQUEST_TABS[activeTab]?.key;
    switch (tabKey) {
      case 'received':
        return get_connection_requests_received_data?.connectionrequests || [];
      case 'sent':
        return get_connection_requests_sent_data?.connectionrequests || [];
      case 'emergency':
        return get_emergency_requests_data?.emergencyaccessrequests || [];
      default:
        return [];
    }
  }, [activeTab, REQUEST_TABS]);

  const currentRequests = useMemo(
    (): Request[] => getCurrentRequests(),
    [getCurrentRequests],
  );

  if (loading || isActionInProgress) {
    return (
      <ScreenWrapper
        showShadow={false}
        containerStyle={{ paddingHorizontal: 16 }}
      >
        <AuthHeader
          title={t('connections_request.title')}
          onBackPress={() => navigation.goBack()}
          containerStyle={{
            marginBottom: 0,
          }}
        />
        <ActivityIndicator
          size="large"
          color={themeColors.primary}
          style={{ marginTop: 32 }}
        />
      </ScreenWrapper>
    );
  }

  return (
    <>
    <ScreenWrapper
      showShadow={false}
      containerStyle={{ paddingHorizontal: 16 }}
    >
      <AuthHeader
        title={t('connections_request.title')}
        onBackPress={() => navigation.goBack()}
        containerStyle={{
          marginBottom: 0,
        }}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />

      <CustomTabs
        tabs={REQUEST_TABS.map(tab => ({
          ...tab,
          label: `${tab.label}(${tab.count})`,
        }))}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showIcons={false}
        containerStyle={{
          padding: 0,
          backgroundColor: themeColors.surface,
          height: 40,
          borderWidth: 1,
          borderColor: themeColors.border,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
        }}
        labelStyle={styles.tabLabel}
        activeTabStyle={{ backgroundColor: themeColors.primary }}
      />

      {/* Request Cards */}
      {activeTab === 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentRequests?.length > 0 ? (
            currentRequests.map((request: Request) => (
              <CustomRequestCard
                key={request.id}
                name={request?.senderuser?.username}
                profilePicture={request?.senderuser?.profilepicture}
                email={request?.senderuser?.email}
                phone={request?.senderuser?.phonenumber}
                message={request?.message}
                onAccept={() => handleAccept(request)}
                onDecline={() => handleDecline(request.id)}
                acceptLoading={checkingRequestId === request.id}
              />
            ))
          ) : (
            <Text
              style={{ marginTop: 32, textAlign: 'center', color: colors.gray }}
            >
              {t('connections_screen.no_requests')}
            </Text>
          )}
        </ScrollView>
      ) : activeTab === 1 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentRequests?.length > 0 ? (
            currentRequests.map((request: Request) => (
              <CustomRequestCard
                key={request.id}
                name={request?.receiveruser?.username}
                profilePicture={request?.receiveruser?.profilepicture}
                email={request?.receiveruser?.email}
                phone={request?.receiveruser?.phonenumber}
                status={
                  request?.status === 'Accepted'
                    ? 'accepted'
                    : request?.status === 'Declined'
                    ? 'declined'
                    : request?.status === 'Emergency'
                    ? 'emergency'
                    : request?.status
                }
                message={request?.message}
              />
            ))
          ) : (
            <Text
              style={{ marginTop: 32, textAlign: 'center', color: colors.gray }}
            >
              {t('connections_screen.no_requests')}
            </Text>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentRequests?.length > 0 ? (
            currentRequests.map((request: Request) => (
              <CustomRequestCard
                key={request.id}
                name={request?.requestedbyuser?.username}
                profilePicture={request?.requestedbyuser?.profilepicture}
                email={request?.requestedbyuser?.email}
                phone={request?.requestedbyuser?.phonenumber}
                reason={request?.reason}
                status={'emergency'}
                message={t('emergencyAccess.incoming.pendingHint')}
                onAccept={() => handleApproveEmergency(request.id)}
                onDecline={() => handleRejectEmergency(request.id)}
                acceptLoading={approvingRequestId === request.id}
                declineLoading={rejectingRequestId === request.id}
              />
            ))
          ) : (
            <Text
              style={{ marginTop: 32, textAlign: 'center', color: colors.gray }}
            >
              {t('connections_screen.no_requests')}
            </Text>
          )}
        </ScrollView>
      )}
    </ScreenWrapper>

    <AcceptConnectionModal
      visible={acceptModalVisible}
      onClose={() => {
        setAcceptModalVisible(false);
        setPendingAcceptRequest(null);
      }}
      onConfirm={handleConfirmAccept}
      loading={isActionInProgress}
      targetAccountType={pendingAcceptRequest?.targetaccounttype}
    />

    <AcceptBothConnectionModal
      visible={bothModalVisible}
      onClose={() => {
        setBothModalVisible(false);
        setPendingAcceptRequest(null);
        setPendingCrossRequest(null);
      }}
      onAcceptSingle={handleConfirmSingle}
      onAcceptBoth={handleConfirmBoth}
      loading={isActionInProgress}
      currentAccountType={isBusinessRole() ? 'Business' : 'Personal'}
    />
    {GateModal}
    </>
  );
};

export default ConnectionsRequest;
