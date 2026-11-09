import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { AppText } from './app-text';
import { Button } from './button';
import { LottiePlayer } from './lottie-player';

const EMPTY_ANIMATION = require('@/assets/animations/empty-vinyl.json');

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <View
      className={cn(
        'items-center gap-5 rounded-3xl border border-border bg-card/70 px-6 py-10 card-shadow',
        className,
      )}
    >
      <LottiePlayer
        source={EMPTY_ANIMATION}
        fallback="vinyl"
        className="h-36 w-36"
      />

      <View className="items-center gap-2">
        <AppText variant="heading" className="text-center">
          {title}
        </AppText>
        <AppText variant="caption" tone="muted" className="text-center">
          {description}
        </AppText>
      </View>

      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          icon="plus"
          onPress={onAction}
          className="w-full max-w-xs"
        />
      ) : null}
    </View>
  );
}
