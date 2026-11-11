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
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { PreviewChip } from '@/components/ui/preview-chip';
import { Reveal } from '@/components/ui/reveal';
import { Screen } from '@/components/ui/screen';
import { useSession } from '@/features/auth/session-context';
import { useCollections } from '@/features/collections/collections-context';
import type { MusicCollection } from '@/features/collections/types';

export function CollectionsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useSession();
  const {
    collections,
    deleteCollection,
    error,
    loading,
    refreshCollections,
  } = useCollections();
  const [pendingDelete, setPendingDelete] = useState<MusicCollection | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setDeleting(true);
    setActionError(null);

    try {
      await deleteCollection(pendingDelete.id);
      setPendingDelete(null);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (deleteError) {
      setPendingDelete(null);
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : 'No se pudo eliminar la colección.',
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Screen scroll withTabBar contentClassName="gap-6">
      <Reveal className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          {isAuthenticated ? (
            <View className="flex-row items-center gap-2 self-start rounded-full border border-success/30 bg-success/10 px-3 py-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-success" />
              <AppText variant="overline" tone="success" className="tracking-wider">
                Guardadas en Supabase
              </AppText>
            </View>
          ) : (
            <PreviewChip label="Vista previa sin sesión" />
          )}
          <AppText variant="title">Colecciones</AppText>
          <AppText variant="caption" tone="muted">
            {collections.length === 0
              ? 'Crea agrupaciones con personalidad para tu música.'
              : `${collections.length} ${
                  collections.length === 1 ? 'colección guardada' : 'colecciones guardadas'
                } en tu cuenta.`}
          </AppText>
        </View>

        {isAuthenticated ? (
          <IconButton
            name="plus"
            variant="primary"
            size="lg"
            accessibilityLabel="Crear colección"
            onPress={() => router.push('/collections/new')}
          />
        ) : null}
      </Reveal>

      {!isAuthenticated ? (
        <Reveal delay={60} className="gap-3">
          <FormNotice
            tone="info"
            title="Necesitas una sesión activa"
            message="Inicia sesión para consultar y guardar tus colecciones reales en Supabase. La vista previa solo muestra la interfaz."
          />
          <Button
            label="Iniciar sesión"
            icon="lock"
            variant="secondary"
            onPress={() => router.replace('/')}
          />
        </Reveal>
      ) : null}

      {actionError ? (
        <Reveal delay={60}>
          <FormNotice tone="danger" title="No se pudo eliminar" message={actionError} />
        </Reveal>
      ) : null}

      {isAuthenticated && error ? (
        <Reveal delay={60} className="gap-3">
          <FormNotice tone="danger" title="Error al cargar colecciones" message={error} />
          <Button
            label="Reintentar"
            icon="forward"
            variant="secondary"
            onPress={() => void refreshCollections()}
          />
        </Reveal>
      ) : null}

      {isAuthenticated && loading ? (
        <Reveal delay={120}>
          <View className="items-center gap-3 rounded-3xl border border-border bg-card/70 px-6 py-10 card-shadow">
            <LoadingIndicator size="lg" label="Cargando tus colecciones..." />
          </View>
        </Reveal>
      ) : collections.length === 0 ? (
        <Reveal delay={140}>
          <EmptyState
            title="Tu primera colección empieza aquí"
            description="Piensa en un mood, un género o un momento. Ponle nombre y una breve descripción."
            actionLabel={isAuthenticated ? 'Crear colección' : undefined}
            onAction={isAuthenticated ? () => router.push('/collections/new') : undefined}
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

          {isAuthenticated ? (
            <Button
              label="Nueva colección"
              icon="plus"
              variant="secondary"
              onPress={() => router.push('/collections/new')}
            />
          ) : null}
        </Reveal>
      )}

      <ConfirmDialog
        visible={Boolean(pendingDelete)}
        title="¿Eliminar esta colección?"
        message={`"${pendingDelete?.name ?? ''}" se eliminará de tu cuenta en Supabase. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}
