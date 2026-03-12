import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DISCLAIMER_ACCEPTED_KEY = '@gindaimai:disclaimer_accepted';
const DISCLAIMER_SHOW_AGAIN_KEY = '@gindaimai:disclaimer_show_again';

export function useDisclaimer() {
    const [hasAccepted, setHasAccepted] = useState<boolean | null>(null);
    const [shouldShowAgain, setShouldShowAgain] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDisclaimerStatus();
    }, []);

    async function loadDisclaimerStatus() {
        try {
            const accepted = await AsyncStorage.getItem(DISCLAIMER_ACCEPTED_KEY);
            const showAgain = await AsyncStorage.getItem(DISCLAIMER_SHOW_AGAIN_KEY);
            
            setHasAccepted(accepted === 'true');
            setShouldShowAgain(showAgain !== 'false');
        } catch (error) {
            console.error('Error loading disclaimer status:', error);
        } finally {
            setLoading(false);
        }
    }

    async function acceptDisclaimer(dontShowAgain: boolean = false) {
        try {
            await AsyncStorage.setItem(DISCLAIMER_ACCEPTED_KEY, 'true');
            if (dontShowAgain) {
                await AsyncStorage.setItem(DISCLAIMER_SHOW_AGAIN_KEY, 'false');
            } else {
                await AsyncStorage.setItem(DISCLAIMER_SHOW_AGAIN_KEY, 'true');
            }
            setHasAccepted(true);
            setShouldShowAgain(!dontShowAgain);
        } catch (error) {
            console.error('Error saving disclaimer acceptance:', error);
        }
    }

    async function resetDisclaimer() {
        try {
            await AsyncStorage.removeItem(DISCLAIMER_ACCEPTED_KEY);
            await AsyncStorage.removeItem(DISCLAIMER_SHOW_AGAIN_KEY);
            setHasAccepted(false);
            setShouldShowAgain(true);
        } catch (error) {
            console.error('Error resetting disclaimer:', error);
        }
    }

    return {
        hasAccepted,
        shouldShowAgain,
        loading,
        acceptDisclaimer,
        resetDisclaimer,
    };
}

/**
 * Check if user has accepted disclaimer (for one-time check)
 */
export async function checkDisclaimerAccepted(): Promise<boolean> {
    try {
        const accepted = await AsyncStorage.getItem(DISCLAIMER_ACCEPTED_KEY);
        return accepted === 'true';
    } catch (error) {
        console.error('Error checking disclaimer:', error);
        return false;
    }
}

/**
 * Check if disclaimer should be shown (for first-time users or those who didn't select "don't show again")
 */
export async function shouldShowDisclaimer(): Promise<boolean> {
    try {
        const showAgain = await AsyncStorage.getItem(DISCLAIMER_SHOW_AGAIN_KEY);
        return showAgain !== 'false';
    } catch (error) {
        console.error('Error checking disclaimer:', error);
        return true;
    }
}
