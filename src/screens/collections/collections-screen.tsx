import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { CollectionCard } from '@/components/ui/collection-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { FormNotice } from '@/components/ui/form-notice';
import { IconButton } from '@/components/ui/icon-button';
import { PreviewChip } from '@/components/ui/preview-chip';
import { Reveal } from '@/components/ui/reveal';
import { Screen } from '@/components/ui/screen';
import { useCollections } from '@/features/collections/collections-context';
import type { MusicCollection } from '@/features/collections/types';

export function CollectionsScreen() {
  const router = useRouter();
  const { collections, deleteCollection } = useCollections();
  const [pendingDelete, setPendingDelete] = useState<MusicCollection | null>(null);

  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    deleteCollection(pendingDelete.id);
    setPendingDelete(null);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <Screen scroll withTabBar contentClassName="gap-6">
      <Reveal className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          <PreviewChip label="Borradores locales" />
          <AppText variant="title">Colecciones</AppText>
          <AppText variant="caption" tone="muted">
            {collections.length === 0
              ? 'Crea agrupaciones con personalidad para tu música.'
              : `${collections.length} ${
                  collections.length === 1 ? 'colección creada' : 'colecciones creadas'
                } en esta sesión.`}
          </AppText>
        </View>

        <IconButton
          name="plus"
          variant="primary"
          size="lg"
          accessibilityLabel="Crear colección"
          onPress={() => router.push('/collections/new')}
        />
      </Reveal>

      <Reveal delay={80}>
        <FormNotice
          tone="info"
          title="Almacenamiento temporal"
          message="Las colecciones se guardan en memoria para revisar la interfaz. Al cerrar la app se pierden y no se envían a Supabase."
        />
      </Reveal>

      {collections.length === 0 ? (
        <Reveal delay={140}>
          <EmptyState
            title="Tu primera colección empieza aquí"
            description="Piensa en un mood, un género o un momento. Ponle nombre y una breve descripción."
            actionLabel="Crear colección"
            onAction={() => router.push('/collections/new')}
          />
        </Reveal>
      ) : (
        <Reveal delay={140} className="gap-4">
          <View className="gap-3">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onPress={() =>
                  router.push({ pathname: '/collections/[id]', params: { id: collection.id } })
                }
                onEdit={() =>
                  router.push({
                    pathname: '/collections/[id]/edit',
                    params: { id: collection.id },
                  })
                }
                onDelete={() => setPendingDelete(collection)}
              />
            ))}
          </View>

          <Button
            label="Nueva colección"
            icon="plus"
            variant="secondary"
            onPress={() => router.push('/collections/new')}
          />
        </Reveal>
      )}

      <ConfirmDialog
        visible={Boolean(pendingDelete)}
        title="¿Eliminar esta colección?"
        message={`"${pendingDelete?.name ?? ''}" se quitará de los borradores locales. No existe todavía una copia en Supabase.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}
