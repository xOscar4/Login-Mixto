import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { AppText } from './app-text';

type PreviewChipProps = {
  label?: string;
  className?: string;
};

export function PreviewChip({ label = 'Vista previa', className }: PreviewChipProps) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-2 self-start rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5',
        className,
      )}
    >
      <View className="h-1.5 w-1.5 rounded-full bg-accent" />
      <AppText variant="overline" tone="accent" className="tracking-wider">
        {label}
      </AppText>
    </View>
  );
}
