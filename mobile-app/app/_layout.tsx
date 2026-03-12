import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts } from 'expo-font';
import { Kanit_400Regular, Kanit_700Bold } from '@expo-google-fonts/kanit';
import * as SplashScreen from 'expo-splash-screen';
import { NotificationProvider } from '../src/context/NotificationContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const [fontsLoaded, fontError] = useFonts({
    Kanit_400Regular,
    Kanit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoaded(true);
    });

    supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (!navigationState?.key || !sessionLoaded) return;

    const inTabsGroup = segments[0] === '(tabs)' || segments[0] === 'camera' || segments[0] === 'preview' || segments[0] === 'result';

    if (!session && inTabsGroup) {
      // Redirect to the login page.
      router.replace('/auth');
    } else if (session && segments[0] === 'auth') {
      // Redirect away from the login page.
      router.replace('/(tabs)');
    }
  }, [session, sessionLoaded, segments, navigationState, router]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <NotificationProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="camera" options={{ headerShown: false }} />
          <Stack.Screen name="preview" options={{ title: 'Preview' }} />
          <Stack.Screen name="result" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="disclaimer" options={{ title: 'ข้อความปฏิเสธความรับผิดชอบ', headerBackTitle: 'กลับ' }} />
          <Stack.Screen name="anomaly-detail" options={{ title: 'รายละเอียดความผิดปกติ', headerBackTitle: 'กลับ' }} />
          <Stack.Screen name="profile" options={{ title: 'โปรไฟล์', headerBackTitle: 'กลับ' }} />
          <Stack.Screen name="privacy" options={{ title: 'นโยบายความเป็นส่วนตัว', headerBackTitle: 'กลับ' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </NotificationProvider>
  );
}
