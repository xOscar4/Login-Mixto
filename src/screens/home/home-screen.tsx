import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { CollectionCard } from '@/components/ui/collection-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormNotice } from '@/components/ui/form-notice';
import { Icon } from '@/components/ui/icon';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { LottiePlayer } from '@/components/ui/lottie-player';
import { Logo } from '@/components/ui/logo';
import { MusicCover } from '@/components/ui/music-cover';
import { PreviewChip } from '@/components/ui/preview-chip';
import { Reveal } from '@/components/ui/reveal';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { useSession } from '@/features/auth/session-context';
import { useCollections } from '@/features/collections/collections-context';
import type { MusicCollection } from '@/features/collections/types';
import { INTEGRATIONS } from '@/config/integrations';
import { formatDate } from '@/lib/format';

const HOME_ANIMATION = require('@/assets/animations/home-hero.json');
const EQUALIZER_ANIMATION = require('@/assets/animations/equalizer.json');

function greetingFor(hour: number) {
  if (hour < 12) {
    return 'Buenos días';
  }

  if (hour < 19) {
    return 'Buenas tardes';
  }

  return 'Buenas noches';
}

export function HomeScreen() {
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

  const greeting = greetingFor(new Date().getHours());
  const recent = collections.slice(0, 2);

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
    <Screen scroll withTabBar contentClassName="gap-7">
      <Reveal className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          {isAuthenticated ? (
            <View className="flex-row items-center gap-2 self-start rounded-full border border-success/30 bg-success/10 px-3 py-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-success" />
              <AppText variant="overline" tone="success" className="tracking-wider">
                Sesión activa
              </AppText>
            </View>
          ) : (
            <PreviewChip label="Vista previa sin sesión" />
          )}
          <AppText variant="title">{greeting}</AppText>
          <AppText variant="caption" tone="muted">
            Tu música merece un lugar tan cuidado como su sonido.
          </AppText>
        </View>

        <Logo size="sm" />
      </Reveal>

      <Reveal delay={80}>
        <View className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-primary/35 via-card to-secondary/35 p-6 card-shadow">
          <View className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/10" />
          <View className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-accent/10" />

          <LottiePlayer
            source={HOME_ANIMATION}
            fallback="vinyl"
            className="absolute -right-4 -top-2 h-36 w-36 opacity-80"
          />

          <View className="gap-2 pr-24">
            <View className="flex-row items-center gap-2 rounded-full border border-white/10 bg-surface/50 px-3 py-1.5 self-start">
              <LottiePlayer
                source={EQUALIZER_ANIMATION}
                fallback="equalizer"
                className="h-3.5 w-5"
              />
              <AppText variant="overline" tone="accent">
                Tu espacio musical
              </AppText>
            </View>
            <AppText variant="title">Haz que cada colección suene a ti.</AppText>
            <AppText variant="caption" tone="muted">
              Agrupa ideas, estados de ánimo y descubrimientos en un solo lugar.
            </AppText>
          </View>

          <Button
            label="Ver colecciones"
            trailingIcon="forward"
            onPress={() => router.push('/collections')}
            className="mt-6 self-start"
          />
        </View>
      </Reveal>

      <Reveal delay={140} className="flex-row gap-3">
        <View className="flex-1 gap-2 rounded-3xl border border-border bg-card/70 p-4">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/15">
            <Icon name="collections" size={19} tone="primary" />
          </View>
          <AppText variant="display">{collections.length}</AppText>
          <AppText variant="caption" tone="muted">
            {collections.length === 1 ? 'Colección guardada' : 'Colecciones guardadas'}
          </AppText>
        </View>

        <View className="flex-1 gap-2 rounded-3xl border border-border bg-card/70 p-4">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-accent/15">
            <Icon name="shield" size={19} tone="accent" />
          </View>
          <AppText variant="subheading">RLS</AppText>
          <AppText variant="caption" tone="muted">
            Cada usuario solo ve sus propios registros
          </AppText>
        </View>
      </Reveal>

      {error ? (
        <Reveal delay={160} className="gap-3">
          <FormNotice tone="danger" title="Error al cargar colecciones" message={error} />
          <Button
            label="Reintentar"
            icon="forward"
            variant="secondary"
            onPress={() => void refreshCollections()}
          />
        </Reveal>
      ) : null}

      {actionError ? (
        <Reveal delay={160}>
          <FormNotice tone="danger" title="No se pudo eliminar" message={actionError} />
        </Reveal>
      ) : null}

      <Reveal delay={200} className="gap-4">
        <SectionHeader
          title="Tus colecciones"
          caption={
            isAuthenticated
              ? 'Guardadas en Supabase y visibles solo para tu cuenta'
              : 'Inicia sesión para ver tus colecciones guardadas'
          }
          actionLabel="Ver todas"
          onAction={() => router.push('/collections')}
        />

        {isAuthenticated && loading ? (
          <View className="items-center gap-3 rounded-3xl border border-border bg-card/70 px-6 py-10 card-shadow">
            <LoadingIndicator size="lg" label="Cargando colecciones..." />
          </View>
        ) : recent.length === 0 ? (
          <View className="items-center gap-4 overflow-hidden rounded-3xl border border-dashed border-border bg-card/60 p-6">
            <LottiePlayer
              source={EQUALIZER_ANIMATION}
              fallback="equalizer"
              size="lg"
              className="h-28 w-44"
            />
            <View className="items-center gap-1">
              <AppText variant="subheading">Aún no hay colecciones</AppText>
              <AppText variant="caption" tone="muted" className="text-center">
                {isAuthenticated
                  ? 'Crea tu primera colección y dale un nombre a ese sonido que te acompaña.'
                  : 'Inicia sesión para crear tu primera colección.'}
              </AppText>
            </View>
            <Button
              label={isAuthenticated ? 'Crear colección' : 'Iniciar sesión'}
              icon={isAuthenticated ? 'plus' : 'lock'}
              onPress={() =>
                isAuthenticated ? router.push('/collections/new') : router.replace('/')
              }
              className="w-full"
            />
          </View>
        ) : (
          <View className="gap-3">
            {recent.map((collection) => (
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
        )}
      </Reveal>

      <Reveal delay={260} className="gap-3">
        <SectionHeader title="Integraciones" caption="Estado real de la configuración" />

        <View className="gap-3 rounded-3xl border border-border bg-card/70 p-4">
          {Object.values(INTEGRATIONS).map((integration) => (
            <View key={integration.name} className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-surface">
                <Icon
                  name={integration.name === 'Supabase' ? 'album' : 'sparkle'}
                  size={18}
                  tone="primary"
                />
              </View>
              <View className="flex-1 gap-0.5">
                <AppText variant="label">{integration.name}</AppText>
                <AppText variant="caption" tone="muted">
                  {integration.description}
                </AppText>
              </View>
              <View
                className={
                  integration.status === 'Activo'
                    ? 'rounded-full border border-success/30 bg-success/10 px-2.5 py-1'
                    : 'rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1'
                }
              >
                <AppText
                  variant="overline"
                  tone={integration.status === 'Activo' ? 'success' : undefined}
                  className={integration.status === 'Activo' ? 'tracking-wider' : 'text-warning'}
                >
                  {integration.status}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </Reveal>

      <Reveal delay={320}>
        <FormNotice
          tone={isAuthenticated ? 'success' : 'info'}
          title={isAuthenticated ? 'Sincronizado con Supabase' : 'Vista previa sin sesión'}
          message={
            isAuthenticated
              ? 'Tus colecciones se guardan en la tabla collections con tu user_id. RLS impide que otros usuarios lean o modifiquen tus registros.'
              : 'Inicia sesión para consultar y guardar colecciones reales en Supabase.'
          }
        />
      </Reveal>

      {collections.length > 0 ? (
        <Reveal delay={360}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/collections')}
            className="flex-row items-center gap-3 rounded-3xl border border-border bg-surface/60 p-4 active:opacity-80"
          >
            <MusicCover index={collections[0]?.coverIndex ?? 0} size="sm" />
            <View className="flex-1">
              <AppText variant="caption" tone="muted">
                Última actualización
              </AppText>
              <AppText variant="label">{formatDate(collections[0]?.updatedAt ?? '')}</AppText>
            </View>
            <Icon name="forward" size={18} tone="muted" />
          </Pressable>
        </Reveal>
      ) : null}

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
