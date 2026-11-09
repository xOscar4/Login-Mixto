import '../../global.css';

import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Outfit_500Medium } from '@expo-google-fonts/outfit/500Medium';
import { Outfit_600SemiBold } from '@expo-google-fonts/outfit/600SemiBold';
import { Outfit_700Bold } from '@expo-google-fonts/outfit/700Bold';
import { Outfit_800ExtraBold } from '@expo-google-fonts/outfit/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider, DarkTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { CollectionsProvider } from '@/features/collections/collections-context';
import { SessionProvider } from '@/features/auth/session-context';
import { BACKGROUND_COLOR } from '@/lib/theme';

Uniwind.setTheme('dark');

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#3b82f6',
    background: BACKGROUND_COLOR,
    card: BACKGROUND_COLOR,
    text: '#f5f7ff',
    border: '#232a47',
    notification: '#8b5cf6',
  },
};

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SessionProvider>
          <CollectionsProvider>
            <ThemeProvider value={navigationTheme}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: BACKGROUND_COLOR },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="register" />
                <Stack.Screen name="forgot-password" />
                <Stack.Screen name="reset-password" />
                <Stack.Screen name="auth/callback" />
                <Stack.Screen name="(app)" />
              </Stack>
            </ThemeProvider>
          </CollectionsProvider>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
