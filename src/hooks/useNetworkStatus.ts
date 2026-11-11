import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  /** True only when we are sure there is a working internet connection */
  isOnline: boolean;
  /** True when we are sure there is NO internet connection */
  isOffline: boolean;
  /** Still determining connectivity on first mount */
  isUnknown: boolean;
  connectionType: string | null;
}

const INITIAL_STATE: NetworkStatus = {
  isConnected: true,
  isInternetReachable: null,
  isOnline: false,
  isOffline: false,
  isUnknown: true,
  connectionType: null,
};

const deriveStatus = (state: NetInfoState): NetworkStatus => {
  const isConnected = state.isConnected ?? false;
  const isInternetReachable = state.isInternetReachable ?? null;
  // isOnline requires both connected AND reachable confirmed
  const isOnline = isConnected && isInternetReachable === true;
  // isOffline is confirmed only when connected===false
  const isOffline = isConnected === false;
  // Unknown while reachable is still null but connected
  const isUnknown = isConnected === true && isInternetReachable === null;

  return {
    isConnected,
    isInternetReachable,
    isOnline,
    isOffline,
    isUnknown,
    connectionType: state.type ?? null,
  };
};

/**
 * Hook that tracks real-time network connectivity.
 * Subscribe once and get live updates throughout the app.
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>(INITIAL_STATE);

  useEffect(() => {
    // Fetch current state immediately on mount
    NetInfo.fetch().then((state) => {
      setStatus(deriveStatus(state));
    });

    // Subscribe to changes
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener((state) => {
      setStatus(deriveStatus(state));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
};

/**
 * One-shot async check — useful in imperative code paths
 * e.g. before making a critical API call
 */
export const checkNetworkOnce = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return (state.isConnected ?? false) && (state.isInternetReachable !== false);
};
