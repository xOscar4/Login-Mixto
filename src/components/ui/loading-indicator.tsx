import { View, type StyleProp, type ViewStyle } from 'react-native';

import { cn } from '@/lib/cn';
import { AppText } from './app-text';
import { LottiePlayer } from './lottie-player';

const LOADING_ANIMATION = require('@/assets/animations/page-loading.json');

type LoadingSize = 'sm' | 'md' | 'lg';

type LoadingIndicatorProps = {
  size?: LoadingSize;
  label?: string;
  fullscreen?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const SIZE_MAP: Record<LoadingSize, { player: number; className: string }> = {
  sm: { player: 40, className: 'h-10 w-10' },
  md: { player: 64, className: 'h-16 w-16' },
  lg: { player: 128, className: 'h-32 w-32' },
};

export function LoadingIndicator({
  size = 'md',
  label,
  fullscreen = false,
  className,
  style,
}: LoadingIndicatorProps) {
  const currentSize = SIZE_MAP[size];

  const content = (
    <View
      style={style}
      className={cn('items-center justify-center gap-3', className)}
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Cargando'}
    >
      <LottiePlayer
        source={LOADING_ANIMATION}
        fallback="loading"
        className={currentSize.className}
        size={currentSize.player}
      />
      {label ? (
        <AppText variant="caption" tone="muted" className="text-center font-medium">
          {label}
        </AppText>
      ) : null}
    </View>
  );

  if (fullscreen) {
    return (
      <View className="absolute inset-0 z-50 items-center justify-center bg-background/80 backdrop-blur-md px-6">
        <View className="items-center gap-4 rounded-3xl border border-border bg-card/90 p-8 card-shadow">
          <LottiePlayer
            source={LOADING_ANIMATION}
            fallback="loading"
            className="h-32 w-32"
            size={128}
          />
          {label ? (
            <AppText variant="subheading" className="text-center">
              {label}
            </AppText>
          ) : null}
        </View>
      </View>
    );
  }

  return content;
}
