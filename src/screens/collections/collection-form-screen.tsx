import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { FormNotice } from '@/components/ui/form-notice';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { LottiePlayer } from '@/components/ui/lottie-player';
import { MusicCover } from '@/components/ui/music-cover';
import { PreviewChip } from '@/components/ui/preview-chip';
import { Reveal } from '@/components/ui/reveal';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { useSession } from '@/features/auth/session-context';
import {
  coverIndexFor,
  useCollections,
} from '@/features/collections/collections-context';
import type { MusicCollection } from '@/features/collections/types';
import { hasErrors, validateCollection, type FieldErrors } from '@/lib/validation';

type CollectionFormScreenProps = {
  mode: 'create' | 'edit';
  collectionId?: string;
};

const DESCRIPTION_LIMIT = 280;

export function CollectionFormScreen({ mode, collectionId }: CollectionFormScreenProps) {
  const router = useRouter();
  const { isAuthenticated } = useSession();
  const { getCollection, loading } = useCollections();
  const existing = mode === 'edit' && collectionId ? getCollection(collectionId) : undefined;

  if (loading) {
    return (
      <Screen scroll contentClassName="gap-6">
        <ScreenHeader title={mode === 'edit' ? 'Editar colección' : 'Nueva colección'} />
        <View className="items-center gap-3 rounded-3xl border border-border bg-card/70 px-6 py-10 card-shadow">
          <LoadingIndicator size="lg" label="Cargando colección..." />
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen scroll contentClassName="gap-6">
        <ScreenHeader title={mode === 'edit' ? 'Editar colección' : 'Nueva colección'} />
        <FormNotice
          tone="info"
          title="Inicia sesión para continuar"
          message="Las colecciones se guardan en Supabase y necesitan una cuenta autenticada."
        />
        <Button
          label="Iniciar sesión"
          icon="lock"
          onPress={() => router.replace('/')}
        />
      </Screen>
    );
  }

  if (mode === 'edit' && !existing) {
    return (
      <Screen scroll contentClassName="gap-6">
        <ScreenHeader title="Editar colección" />
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
            label="Volver a colecciones"
            variant="secondary"
            onPress={() => router.replace('/collections')}
            className="w-full"
          />
        </View>
      </Screen>
    );
  }

  return (
    <CollectionForm
      key={collectionId ?? 'new'}
      mode={mode}
      collectionId={collectionId}
      existing={existing}
    />
  );
}

type CollectionFormProps = {
  mode: 'create' | 'edit';
  collectionId?: string;
  existing?: MusicCollection;
};

function CollectionForm({ mode, collectionId, existing }: CollectionFormProps) {
  const router = useRouter();
  const { createCollection, updateCollection } = useCollections();
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    const nextErrors = validateCollection(name, description);
    setErrors(nextErrors);
    setSaveError(null);

    if (hasErrors(nextErrors)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setSaveState('saving');

    try {
      if (mode === 'edit' && collectionId) {
        await updateCollection(collectionId, { name, description });
      } else {
        await createCollection({ name, description });
      }

      setSaveState('success');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        router.back();
      }, 1800);
    } catch (error) {
      setSaveState('idle');
      setSaveError(
        error instanceof Error ? error.message : 'No se pudo guardar la colección.',
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  return (
    <Screen scroll contentClassName="gap-6">
      <ScreenHeader
        title={mode === 'edit' ? 'Editar colección' : 'Nueva colección'}
        subtitle="Se guarda en tu cuenta de Supabase"
      />

      <Reveal className="gap-3 rounded-3xl border border-border bg-card/80 p-5 card-shadow">
        <View className="flex-row items-center gap-4">
          <MusicCover index={coverIndexFor(name || 'Melody')} size="lg" />
          <View className="flex-1 gap-1">
            <PreviewChip label="Vista previa" />
            <AppText variant="subheading" numberOfLines={1}>
              {name.trim() || 'Nombre de tu colección'}
            </AppText>
            <AppText variant="caption" tone="muted" numberOfLines={2}>
              {description.trim() || 'Una breve descripción le dará personalidad.'}
            </AppText>
          </View>
        </View>
      </Reveal>

      <Reveal delay={80} className="gap-4">
        <TextField
          label="Nombre"
          icon="music"
          value={name}
          onChangeText={setName}
          placeholder="Ej. Noches de synthwave"
          maxLength={80}
          autoCapitalize="sentences"
          returnKeyType="next"
          error={errors.name}
        />

        <TextField
          label="Descripción"
          icon="edit"
          value={description}
          onChangeText={setDescription}
          placeholder="¿Qué hace especial a esta colección?"
          maxLength={DESCRIPTION_LIMIT}
          multiline
          textAlignVertical="top"
          inputClassName="min-h-32"
          hint={`${description.length}/${DESCRIPTION_LIMIT} caracteres`}
          error={errors.description}
        />
      </Reveal>

      <Reveal delay={140}>
        <FormNotice
          tone="success"
          title="Guardado real en Supabase"
          message="La colección se guarda en la tabla collections con tu user_id. Las políticas RLS solo te permiten ver y editar tus propios registros."
        />
      </Reveal>

      {saveError ? (
        <Reveal delay={160}>
          <FormNotice tone="danger" title="No se pudo guardar" message={saveError} />
        </Reveal>
      ) : null}

      <Reveal delay={200} className="gap-3">
        <Button
          label={mode === 'edit' ? 'Guardar cambios' : 'Guardar colección'}
          icon="check"
          loading={saveState === 'saving'}
          disabled={saveState !== 'idle'}
          onPress={handleSave}
        />
        <Button
          label="Cancelar"
          variant="secondary"
          disabled={saveState !== 'idle'}
          onPress={() => router.back()}
        />
      </Reveal>

      <Modal
        visible={saveState !== 'idle'}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 items-center justify-center bg-background/85 px-6">
          <View className="w-full max-w-xs items-center gap-4 rounded-3xl border border-border bg-card p-6 card-shadow">
            {saveState === 'saving' ? (
              <LoadingIndicator size="lg" label="Guardando en Supabase..." />
            ) : (
              <>
                <LottiePlayer
                  source={require('@/assets/animations/success-check.json')}
                  fallback="success"
                  loop={false}
                  className="h-28 w-28"
                />
                <View className="items-center gap-1.5">
                  <AppText variant="heading" className="text-center">
                    {mode === 'edit' ? 'Cambios guardados' : '¡Colección creada!'}
                  </AppText>
                  <AppText variant="caption" tone="muted" className="text-center">
                    Ya está guardada en tu cuenta de Supabase.
                  </AppText>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
