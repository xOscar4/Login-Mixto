import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/features/auth/session-context';
import { BACKGROUND_COLOR } from '@/lib/theme';

export default function AppLayout() {
  const { isAuthenticated, isPreview, loading } = useSession();

  if (loading) {
    return null;
  }

  if (!isAuthenticated && !isPreview) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: BACKGROUND_COLOR },
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="collections/new" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="collections/[id]/index" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="collections/[id]/edit" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="settings/change-password" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
