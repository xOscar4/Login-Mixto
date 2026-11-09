import { type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
  /** Deja espacio inferior para la barra de pestañas flotante. */
  withTabBar?: boolean;
}>;

function AmbientBackground() {
  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      <View className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-gradient-to-br from-primary/35 via-primary/10 to-transparent" />
      <View className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-gradient-to-tr from-secondary/30 via-secondary/10 to-transparent" />
      <View className="absolute -bottom-36 right-0 h-80 w-80 rounded-full bg-gradient-to-tl from-accent/20 via-accent/5 to-transparent" />
      <View className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 via-background/40 to-transparent" />
    </View>
  );
}

export function Screen({
  children,
  scroll = false,
  className,
  contentClassName,
  withTabBar = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = withTabBar ? 132 : 32;

  if (scroll) {
    return (
      <View className={cn('flex-1 bg-background', className)}>
        <AmbientBackground />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName={cn('grow px-5', contentClassName)}
            contentContainerStyle={{
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + bottomPadding,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View className={cn('flex-1 bg-background', className)}>
      <AmbientBackground />
      <View
        className={cn('flex-1 px-5', contentClassName)}
        style={{
          paddingTop: insets.top + 20,
          paddingBottom: withTabBar ? 0 : insets.bottom + 24,
        }}
      >
        {children}
      </View>
    </View>
  );
}
