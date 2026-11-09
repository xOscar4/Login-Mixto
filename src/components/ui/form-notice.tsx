import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { AppText } from './app-text';
import type { IconName } from './icon';
import { Icon } from './icon';

export type FormNoticeTone = 'info' | 'pending' | 'success' | 'danger';

type FormNoticeProps = {
  tone?: FormNoticeTone;
  title: string;
  message?: string;
  className?: string;
};

const TONE_CLASSES: Record<FormNoticeTone, string> = {
  info: 'border-primary/30 bg-primary/10',
  pending: 'border-warning/30 bg-warning/10',
  success: 'border-success/30 bg-success/10',
  danger: 'border-danger/30 bg-danger/10',
};

const ICONS: Record<FormNoticeTone, IconName> = {
  info: 'info',
  pending: 'info',
  success: 'check',
  danger: 'alert',
};

const ICON_TONES = {
  info: 'primary',
  pending: 'accent',
  success: 'success',
  danger: 'danger',
} as const;

export function FormNotice({ tone = 'info', title, message, className }: FormNoticeProps) {
  return (
    <View className={cn('flex-row gap-3 rounded-2xl border p-4', TONE_CLASSES[tone], className)}>
      <View className="pt-0.5">
        <Icon name={ICONS[tone]} size={18} tone={ICON_TONES[tone]} />
      </View>
      <View className="flex-1 gap-1">
        <AppText variant="label">{title}</AppText>
        {message ? (
          <AppText variant="caption" tone="muted">
            {message}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
