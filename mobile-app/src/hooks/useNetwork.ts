import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  networkType: 'cellular' | 'wifi' | 'none' | 'unknown' | 'bluetooth' | 'ethernet' | 'wimax' | 'vpn' | 'other';
}

export function useNetwork() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    networkType: 'unknown',
  });

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        networkType: state.type,
      });
    });

    // Get initial network state
    NetInfo.fetch().then((state) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        networkType: state.type,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkState;
}
