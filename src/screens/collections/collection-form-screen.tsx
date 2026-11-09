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
import {
  coverIndexFor,
  useCollections,
} from '@/features/collections/collections-context';
import { hasErrors, validateCollection, type FieldErrors } from '@/lib/validation';

type CollectionFormScreenProps = {
  mode: 'create' | 'edit';
  collectionId?: string;
};

const DESCRIPTION_LIMIT = 280;

export function CollectionFormScreen({ mode, collectionId }: CollectionFormScreenProps) {
  const router = useRouter();
  const { createCollection, updateCollection, getCollection } = useCollections();
  const existing = mode === 'edit' && collectionId ? getCollection(collectionId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success'>('idle');

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
              Este borrador ya no existe
            </AppText>
            <AppText variant="caption" tone="muted" className="text-center">
              Los borradores viven en memoria. Si recargaste la app o eliminaste la colección, no
              hay datos que editar.
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

  function handleSave() {
    const nextErrors = validateCollection(name, description);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setSaveState('saving');

    if (mode === 'edit' && collectionId) {
      updateCollection(collectionId, { name, description });
    } else {
      createCollection({ name, description });
    }

    setTimeout(() => {
      setSaveState('success');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        router.back();
      }, 2200);
    }, 600);
  }

  return (
    <Screen scroll contentClassName="gap-6">
      <ScreenHeader
        title={mode === 'edit' ? 'Editar colección' : 'Nueva colección'}
        subtitle="Solo borrador local por ahora"
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
          tone="pending"
          title="Guardado local, sin Supabase"
          message="Al guardar, la colección se añade a la memoria de esta sesión. No se escribe en una base de datos ni se envía a ningún servidor."
        />
      </Reveal>

      <Reveal delay={200} className="gap-3">
        <Button
          label={mode === 'edit' ? 'Guardar cambios' : 'Guardar colección'}
          icon="check"
          loading={saveState === 'saving'}
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
              <LoadingIndicator size="lg" label="Guardando colección..." />
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
                    Borrador listo en tu biblioteca local.
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
