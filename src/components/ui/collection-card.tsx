import { Pressable, View } from 'react-native';

import { formatDate } from '@/lib/format';
import type { MusicCollection } from '@/features/collections/types';
import { cn } from '@/lib/cn';

import { AppText } from './app-text';
import { IconButton } from './icon-button';
import { MusicCover } from './music-cover';

type CollectionCardProps = {
  collection: MusicCollection;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
};

export function CollectionCard({
  collection,
  onPress,
  onEdit,
  onDelete,
  className,
}: CollectionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        'flex-row gap-4 rounded-3xl border border-border bg-card/80 p-4 active:scale-[0.99] active:opacity-90 card-shadow',
        className,
      )}
    >
      <MusicCover index={collection.coverIndex} size="md" />

      <View className="flex-1 gap-1.5">
        <AppText variant="bodyStrong" numberOfLines={1}>
          {collection.name}
        </AppText>

        <AppText variant="caption" tone="muted" numberOfLines={2}>
          {collection.description || 'Sin descripción. Añade una nota para recordar su estilo.'}
        </AppText>

        <View className="flex-row items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full bg-accent" />
          <AppText variant="caption" tone="muted">
            Guardada en Supabase · {formatDate(collection.updatedAt)}
          </AppText>
        </View>
      </View>

      <View className="justify-center gap-2">
        <IconButton
          name="edit"
          size="sm"
          accessibilityLabel={`Editar ${collection.name}`}
          onPress={onEdit}
        />
        <IconButton
          name="trash"
          size="sm"
          variant="danger"
          accessibilityLabel={`Eliminar ${collection.name}`}
          onPress={onDelete}
        />
      </View>
    </Pressable>
  );
}
