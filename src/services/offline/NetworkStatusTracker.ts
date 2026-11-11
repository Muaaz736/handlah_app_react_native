import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';

class NetworkStatusTracker {
  private static _isConnected: boolean = true;
  private static _subscription: NetInfoSubscription | null = null;

  static start(): void {
    if (this._subscription) return;
    this._subscription = NetInfo.addEventListener(state => {
      this._isConnected = state.isConnected ?? true;
    });
    NetInfo.fetch().then(state => {
      this._isConnected = state.isConnected ?? true;
    });
  }

  static isOffline(): boolean {
    return this._isConnected === false;
  }

  static isOnline(): boolean {
    return this._isConnected !== false;
  }

  static stop(): void {
    this._subscription?.();
    this._subscription = null;
  }
}

export default NetworkStatusTracker;
