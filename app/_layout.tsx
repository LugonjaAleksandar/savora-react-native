import { Fraunces_600SemiBold, Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Appearance } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ToastHost } from '@/core/components/ToastHost';
import { Container, ContainerProvider, createContainer, useSettings } from '@/core/di/container';
import { i18n, resolveLanguage } from '@/core/i18n/i18n';
import { useColors } from '@/core/theme/theme';

void SplashScreen.preventAutoHideAsync();

/** Composition root for the running app; tests build their own container. */
const container = createContainer();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const settingsHydrated = useHydrated(container);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ContainerProvider container={container}>
        <I18nextProvider i18n={i18n}>
          <AppShell isReady={fontsLoaded && settingsHydrated} />
        </I18nextProvider>
      </ContainerProvider>
    </GestureHandlerRootView>
  );
}

/** Applies theme and language from Settings, then renders the navigation stack. */
function AppShell({ isReady }: { isReady: boolean }) {
  const theme = useSettings((store) => store.theme);
  const language = useSettings((store) => store.language);
  const colors = useColors();

  useEffect(() => {
    Appearance.setColorScheme(theme === 'system' ? 'unspecified' : theme);
  }, [theme]);

  useEffect(() => {
    void i18n.changeLanguage(resolveLanguage(language));
  }, [language]);

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="meal/[id]" options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen
          name="review/[id]"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.62, 1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 32,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </Stack>
      <ToastHost />
    </>
  );
}

/** Waits for the persisted settings, so the first frame already has the right theme and language. */
function useHydrated({ settingsStore }: Container) {
  const [hydrated, setHydrated] = useState(() => settingsStore.persist.hasHydrated());
  useEffect(() => settingsStore.persist.onFinishHydration(() => setHydrated(true)), [settingsStore]);
  return hydrated;
}
