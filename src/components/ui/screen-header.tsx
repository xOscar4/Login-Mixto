import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from './app-text';
import { Icon } from './icon';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
};

export function ScreenHeader({ title, subtitle, right, onBack }: ScreenHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  }

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={handleBack}
        className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface/90 active:scale-95 active:opacity-80"
      >
        <Icon name="back" size={18} />
      </Pressable>

      <View className="flex-1 gap-0.5">
        <AppText variant="subheading" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {right}
    </View>
  );
}
