import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
    latitude: number | null;
    longitude: number | null;
    loading: boolean;
    error: string | null;
}

export function useLocation() {
    const [locationData, setLocationData] = useState<LocationData>({
        latitude: null,
        longitude: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let isMounted = true;

        async function getLocation() {
            try {
                // Request permission
                const { status } = await Location.requestForegroundPermissionsAsync();
                
                if (status !== 'granted') {
                    if (isMounted) {
                        setLocationData({
                            latitude: null,
                            longitude: null,
                            loading: false,
                            error: 'ไม่ได้รับสิทธิ์เข้าถึงตำแหน่ง',
                        });
                    }
                    return;
                }

                // Get current location
                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                    maxAge: 60000, // 1 minute
                    timeout: 10000, // 10 seconds
                });

                if (isMounted) {
                    setLocationData({
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude,
                        loading: false,
                        error: null,
                    });
                }
            } catch (error) {
                console.error('Error getting location:', error);
                if (isMounted) {
                    setLocationData({
                        latitude: null,
                        longitude: null,
                        loading: false,
                        error: 'ไม่สามารถดึงตำแหน่งได้',
                    });
                }
            }
        }

        getLocation();

        return () => {
            isMounted = false;
        };
    }, []);

    return locationData;
}

/**
 * Get location once without hook (for one-time use)
 */
export async function getCurrentLocation(): Promise<{ latitude: number | null; longitude: number | null }> {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
            return { latitude: null, longitude: null };
        }

        const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            maxAge: 60000,
            timeout: 10000,
        });

        return {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
        };
    } catch (error) {
        console.error('Error getting location:', error);
        return { latitude: null, longitude: null };
    }
}
