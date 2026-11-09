import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { AppText } from './app-text';
import { Icon } from './icon';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
};

const TILE_SIZES = {
  sm: 'h-11 w-11 rounded-2xl',
  md: 'h-16 w-16 rounded-3xl',
  lg: 'h-20 w-20 rounded-[28px]',
} as const;

const ICON_SIZES = {
  sm: 22,
  md: 30,
  lg: 38,
} as const;

const WORDMARK_SIZES = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
} as const;

export function Logo({ size = 'md', showWordmark = false, className }: LogoProps) {
  return (
    <View className={cn('items-center gap-3', className)}>
      <View
        className={cn(
          'items-center justify-center border border-white/15 bg-gradient-to-br from-primary via-blue-500 to-secondary glow-primary',
          TILE_SIZES[size],
        )}
      >
        <View className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/25" />
        <Icon name="music" size={ICON_SIZES[size]} tone="inverse" />
      </View>

      {showWordmark ? (
        <View className="items-center gap-1">
          <AppText variant="display" className={cn('tracking-tight', WORDMARK_SIZES[size])}>
            Melody
          </AppText>
          <AppText variant="caption" tone="muted">
            Tu música, con orden y estilo
          </AppText>
        </View>
      ) : null}
    </View>
  );
}
