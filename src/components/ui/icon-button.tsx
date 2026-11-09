import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';

import type { IconName } from './icon';
import { Icon } from './icon';

type IconButtonVariant = 'surface' | 'ghost' | 'primary' | 'danger';

type IconButtonProps = {
  name: IconName;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  accessibilityLabel?: string;
  className?: string;
};

const CONTAINER_CLASSES: Record<IconButtonVariant, string> = {
  surface: 'border border-border bg-surface/90',
  ghost: 'border border-transparent bg-transparent',
  primary: 'border border-white/10 bg-gradient-to-br from-primary to-secondary',
  danger: 'border border-danger/30 bg-danger/15',
};

const SIZES = {
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-12 w-12 rounded-2xl',
  lg: 'h-14 w-14 rounded-2xl',
} as const;

const ICON_SIZES = { sm: 16, md: 20, lg: 24 } as const;

const ICON_TONES = {
  surface: 'default',
  ghost: 'muted',
  primary: 'inverse',
  danger: 'danger',
} as const;

export function IconButton({
  name,
  onPress,
  variant = 'surface',
  size = 'md',
  accessibilityLabel,
  className,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn(
        'items-center justify-center active:scale-95 active:opacity-80',
        CONTAINER_CLASSES[variant],
        SIZES[size],
        className,
      )}
    >
      <Icon name={name} size={ICON_SIZES[size]} tone={ICON_TONES[variant]} />
    </Pressable>
  );
}
