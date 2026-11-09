import { Pressable, View } from 'react-native';

import { AppText } from './app-text';
import { Icon } from './icon';

type SectionHeaderProps = {
  title: string;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, caption, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View className="flex-row items-end justify-between gap-4">
      <View className="flex-1 gap-1">
        <AppText variant="heading">{title}</AppText>
        {caption ? (
          <AppText variant="caption" tone="muted">
            {caption}
          </AppText>
        ) : null}
      </View>

      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          className="flex-row items-center gap-1 rounded-full px-2 py-1 active:opacity-70"
        >
          <AppText variant="caption" tone="primary">
            {actionLabel}
          </AppText>
          <Icon name="forward" size={13} tone="primary" />
        </Pressable>
      ) : null}
    </View>
  );
}
