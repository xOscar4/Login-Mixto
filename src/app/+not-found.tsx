import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';

export default function NotFoundScreen() {
  return (
    <Screen contentClassName="items-center justify-center gap-6">
      <View className="h-20 w-20 items-center justify-center rounded-3xl border border-secondary/30 bg-secondary/15">
        <Icon name="music" size={34} tone="secondary" />
      </View>

      <View className="items-center gap-2">
        <AppText variant="display">404</AppText>
        <AppText variant="heading" className="text-center">
          Esta pista no existe
        </AppText>
        <AppText variant="caption" tone="muted" className="text-center">
          La pantalla que buscas no forma parte de Melody.
        </AppText>
      </View>

      <Button
        label="Volver al inicio"
        icon="home"
        onPress={() => router.replace('/')}
        className="w-full max-w-xs"
      />
    </Screen>
  );
}
