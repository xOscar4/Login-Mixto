import { ActivityIndicator, Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';

import { AppText } from './app-text';
import type { IconName } from './icon';
import { Icon } from './icon';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

const CONTAINER_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'border border-white/10 bg-gradient-to-r from-primary via-blue-500 to-secondary glow-primary',
  secondary: 'border border-border bg-surface/90',
  ghost: 'border border-transparent bg-transparent',
  danger: 'border border-danger/30 bg-danger/15',
};

const LABEL_TONES: Record<ButtonVariant, 'inverse' | 'default' | 'danger'> = {
  primary: 'inverse',
  secondary: 'default',
  ghost: 'default',
  danger: 'danger',
};

const ICON_TONES: Record<ButtonVariant, 'inverse' | 'default' | 'danger'> = {
  primary: 'inverse',
  secondary: 'default',
  ghost: 'default',
  danger: 'danger',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  trailingIcon,
  loading = false,
  disabled = false,
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      className={cn(
        'min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4 active:scale-[0.99] active:opacity-90',
        CONTAINER_CLASSES[variant],
        isDisabled && 'opacity-50',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          colorClassName={variant === 'primary' ? 'accent-white' : 'accent-blue-500'}
        />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon ? <Icon name={icon} size={18} tone={ICON_TONES[variant]} /> : null}
          <AppText variant="label" tone={LABEL_TONES[variant]} className="text-[15px]">
            {label}
          </AppText>
          {trailingIcon ? (
            <Icon name={trailingIcon} size={16} tone={ICON_TONES[variant]} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
