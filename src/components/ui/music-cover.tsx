import { View } from 'react-native';

import { cn } from '@/lib/cn';

type MusicCoverProps = {
  index?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const COVER_GRADIENTS = [
  'bg-gradient-to-br from-primary via-blue-500 to-secondary',
  'bg-gradient-to-br from-secondary via-fuchsia-500 to-primary',
  'bg-gradient-to-br from-accent via-cyan-500 to-primary',
  'bg-gradient-to-br from-indigo-500 via-primary to-secondary',
] as const;

const COVER_SIZES = {
  sm: 'h-14 w-14 rounded-2xl',
  md: 'h-16 w-16 rounded-2xl',
  lg: 'h-24 w-24 rounded-3xl',
  xl: 'h-32 w-32 rounded-[32px]',
} as const;

const RING_SIZES = {
  sm: ['h-8 w-8', 'h-12 w-12'],
  md: ['h-9 w-9', 'h-14 w-14'],
  lg: ['h-14 w-14', 'h-20 w-20'],
  xl: ['h-20 w-20', 'h-28 w-28'],
} as const;

export function MusicCover({ index = 0, size = 'md', className }: MusicCoverProps) {
  const gradient = COVER_GRADIENTS[Math.abs(index) % COVER_GRADIENTS.length];
  const rings = RING_SIZES[size];

  return (
    <View
      className={cn(
        'items-center justify-center overflow-hidden border border-white/15 card-shadow',
        gradient,
        COVER_SIZES[size],
        className,
      )}
    >
      <View className={cn('absolute rounded-full border border-white/25', rings[0])} />
      <View className={cn('absolute rounded-full border border-white/15', rings[1])} />

      <View className="h-2.5 w-2.5 rounded-full bg-white/90" />
      <View className="absolute right-1 top-1 h-2 w-2 rounded-full bg-white/40" />
    </View>
  );
}
