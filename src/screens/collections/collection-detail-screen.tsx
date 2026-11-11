import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormNotice } from '@/components/ui/form-notice';
import { IconButton } from '@/components/ui/icon-button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { LottiePlayer } from '@/components/ui/lottie-player';
import { MusicCover } from '@/components/ui/music-cover';
import { Reveal } from '@/components/ui/reveal';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useCollections } from '@/features/collections/collections-context';
import { formatDate } from '@/lib/format';

export function CollectionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getCollection, deleteCollection, loading, error } = useCollections();
  const collection = id ? getCollection(id) : undefined;
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (loading) {
    return (
      <Screen scroll contentClassName="gap-6">
        <ScreenHeader title="Colección" />
        <View className="items-center gap-3 rounded-3xl border border-border bg-card/70 px-6 py-10 card-shadow">
          <LoadingIndicator size="lg" label="Cargando colección..." />
        </View>
      </Screen>
    );
  }

  if (!collection) {
    return (
      <Screen scroll contentClassName="gap-6">
        <ScreenHeader title="Colección" />
        <View className="items-center gap-4 rounded-3xl border border-border bg-card/80 p-8 card-shadow">
          <LottiePlayer
            source={require('@/assets/animations/empty-vinyl.json')}
            fallback="vinyl"
            className="h-28 w-28"
          />
          <View className="items-center gap-2">
            <AppText variant="heading" className="text-center">
              No encontramos esta colección
            </AppText>
            <AppText variant="caption" tone="muted" className="text-center">
              Puede que la hayas eliminado o que no pertenezca a tu cuenta.
            </AppText>
          </View>
          <Button
            label="Ir a mis colecciones"
            variant="secondary"
            onPress={() => router.replace('/collections')}
            className="w-full"
          />
        </View>

        {error ? (
          <FormNotice tone="danger" title="Error de conexión" message={error} />
        ) : null}
      </Screen>
    );
  }

  async function handleDelete() {
    if (!collection) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteCollection(collection.id);
      setConfirming(false);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/collections');
    } catch (deleteError) {
      setConfirming(false);
      setDeleteError(
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
    <Screen scroll contentClassName="gap-6">
      <ScreenHeader
        title="Detalle"
        subtitle="Guardada en Supabase"
        right={
          <IconButton
            name="edit"
            accessibilityLabel="Editar colección"
            onPress={() =>
              router.push({
                pathname: '/collections/[id]/edit',
                params: { id: collection.id },
              })
            }
          />
        }
      />

      <Reveal>
        <View className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-primary/30 via-card to-secondary/25 p-6 card-shadow">
          <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/10" />

          <View className="flex-row items-start gap-5">
            <MusicCover index={collection.coverIndex} size="xl" />

            <View className="flex-1 gap-2 pt-1">
              <View className="flex-row items-center gap-2 self-start rounded-full border border-success/30 bg-success/10 px-3 py-1.5">
                <View className="h-1.5 w-1.5 rounded-full bg-success" />
                <AppText variant="overline" tone="success" className="tracking-wider">
                  Guardada en Supabase
                </AppText>
              </View>
              <AppText variant="title" numberOfLines={3}>
                {collection.name}
              </AppText>
              <AppText variant="caption" tone="muted">
                {formatDate(collection.updatedAt)}
              </AppText>
            </View>
          </View>

          {collection.description ? (
            <AppText variant="body" tone="muted" className="mt-5">
              {collection.description}
            </AppText>
          ) : null}
        </View>
      </Reveal>

      {deleteError ? (
        <Reveal delay={60}>
          <FormNotice tone="danger" title="No se pudo eliminar" message={deleteError} />
        </Reveal>
      ) : null}

      <Reveal delay={80} className="flex-row gap-3">
        <Button
          label="Editar"
          icon="edit"
          onPress={() =>
            router.push({
              pathname: '/collections/[id]/edit',
              params: { id: collection.id },
            })
          }
          className="flex-1"
        />
        <Button
          label="Eliminar"
          icon="trash"
          variant="danger"
          onPress={() => setConfirming(true)}
          className="flex-1"
        />
      </Reveal>

      <Reveal delay={140} className="gap-3">
        <View className="flex-row items-center justify-between">
          <AppText variant="heading">Pistas</AppText>
          <View className="rounded-full border border-border bg-surface px-3 py-1">
            <AppText variant="overline" tone="muted">
              0 pistas
            </AppText>
          </View>
        </View>

        <View className="items-center gap-3 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-8">
          <View className="h-16 w-24 items-center justify-center rounded-2xl bg-surface/80">
            <LottiePlayer
              source={require('@/assets/animations/equalizer.json')}
              fallback="equalizer"
              size="md"
              className="h-11 w-20"
            />
          </View>
          <AppText variant="subheading" className="text-center">
            Las pistas llegarán después
          </AppText>
          <AppText variant="caption" tone="muted" className="text-center">
            El CRUD de esta etapa cubre nombre, descripción y portada de la colección.
          </AppText>
        </View>
      </Reveal>

      <ConfirmDialog
        visible={confirming}
        title="¿Eliminar esta colección?"
        message={`"${collection.name}" se eliminará de tu cuenta en Supabase. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}
