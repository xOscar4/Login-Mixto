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
import { LottiePlayer } from '@/components/ui/lottie-player';
import { Logo } from '@/components/ui/logo';
import { MusicCover } from '@/components/ui/music-cover';
import { PreviewChip } from '@/components/ui/preview-chip';
import { Reveal } from '@/components/ui/reveal';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
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
  const { collections, deleteCollection } = useCollections();
  const [pendingDelete, setPendingDelete] = useState<MusicCollection | null>(null);

  const greeting = greetingFor(new Date().getHours());
  const recent = collections.slice(0, 2);

  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    deleteCollection(pendingDelete.id);
    setPendingDelete(null);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <Screen scroll withTabBar contentClassName="gap-7">
      <Reveal className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          <PreviewChip label="Vista previa sin sesión" />
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
            {collections.length === 1 ? 'Colección en borrador' : 'Colecciones en borrador'}
          </AppText>
        </View>

        <View className="flex-1 gap-2 rounded-3xl border border-border bg-card/70 p-4">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-accent/15">
            <Icon name="shield" size={19} tone="accent" />
          </View>
          <AppText variant="subheading">Pendiente</AppText>
          <AppText variant="caption" tone="muted">
            Sincronización con Supabase
          </AppText>
        </View>
      </Reveal>

      <Reveal delay={200} className="gap-4">
        <SectionHeader
          title="Tus colecciones"
          caption="Borradores locales guardados solo durante esta sesión"
          actionLabel="Ver todas"
          onAction={() => router.push('/collections')}
        />

        {recent.length === 0 ? (
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
                Crea tu primera colección y dale un nombre a ese sonido que te acompaña.
              </AppText>
            </View>
            <Button
              label="Crear colección"
              icon="plus"
              onPress={() => router.push('/collections/new')}
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
              <View className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1">
                <AppText variant="overline" className="text-warning">
                  {integration.status}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </Reveal>

      <Reveal delay={320}>
        <FormNotice
          tone="info"
          title="Nada de esto se sincroniza todavía"
          message="Las colecciones que crees ahora viven en memoria y desaparecen al cerrar la app. Supabase se conectará en la siguiente etapa."
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
        message={`"${pendingDelete?.name ?? ''}" se quitará de los borradores locales. Esta acción no afecta a Supabase porque aún no está conectado.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}
