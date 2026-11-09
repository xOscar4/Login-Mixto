import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormNotice } from '@/components/ui/form-notice';
import { Icon, type IconName } from '@/components/ui/icon';
import { Logo } from '@/components/ui/logo';
import { PreviewChip } from '@/components/ui/preview-chip';
import { Reveal } from '@/components/ui/reveal';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { INTEGRATIONS } from '@/config/integrations';
import { useSession } from '@/features/auth/session-context';
import { signOut } from '@/services/auth';

type SettingsRowProps = {
  icon: IconName;
  title: string;
  caption: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
};

function SettingsRow({ icon, title, caption, onPress, tone = 'default' }: SettingsRowProps) {
  const isDanger = tone === 'danger';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface/60 p-4 active:opacity-80"
    >
      <View
        className={
          isDanger
            ? 'h-11 w-11 items-center justify-center rounded-2xl bg-danger/15'
            : 'h-11 w-11 items-center justify-center rounded-2xl bg-primary/15'
        }
      >
        <Icon name={icon} size={19} tone={isDanger ? 'danger' : 'primary'} />
      </View>

      <View className="flex-1 gap-0.5">
        <AppText variant="label" tone={isDanger ? 'danger' : 'default'}>
          {title}
        </AppText>
        <AppText variant="caption" tone="muted">
          {caption}
        </AppText>
      </View>

      <Icon name="forward" size={16} tone="muted" />
    </Pressable>
  );
}

export function SettingsScreen() {
  const router = useRouter();
  const { exitPreview, isAuthenticated } = useSession();
  const [confirmExit, setConfirmExit] = useState(false);

  async function handleSignOut() {
    setConfirmExit(false);

    try {
      if (isAuthenticated) {
        await signOut();
      }
    } finally {
      exitPreview();
      router.replace('/');
    }
  }

  return (
    <Screen scroll withTabBar contentClassName="gap-7">
      <Reveal className="gap-2">
        <PreviewChip label="Modo de revisión" />
        <AppText variant="title">Ajustes</AppText>
        <AppText variant="caption" tone="muted">
          Preferencias y estado de las integraciones de Melody.
        </AppText>
      </Reveal>

      <Reveal delay={80}>
        <View className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/30 via-card to-secondary/30 p-5 card-shadow">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-surface">
              <Icon name="user" size={28} tone="primary" />
            </View>

            <View className="flex-1 gap-1">
              <AppText variant="subheading">Sesión de vista previa</AppText>
              <AppText variant="caption" tone="muted">
                Sin cuenta conectada
              </AppText>
            </View>

            <Logo size="sm" />
          </View>

          <View className="mt-4 rounded-2xl border border-border bg-background/40 p-3">
            <AppText variant="caption" tone="muted">
              No hay un usuario real cargado. Supabase Auth se conectará en la siguiente etapa.
            </AppText>
          </View>
        </View>
      </Reveal>

      <Reveal delay={140} className="gap-3">
        <SectionHeader title="Cuenta" caption="Acceso y seguridad" />

        <View className="gap-3">
          <SettingsRow
            icon="key"
            title="Cambiar contraseña"
            caption="Prepara el flujo y revisa sus estados"
            onPress={() => router.push('/settings/change-password')}
          />
          <SettingsRow
            icon="logout"
            title="Cerrar sesión de vista previa"
            caption="Vuelve a la pantalla de inicio de sesión"
            onPress={() => setConfirmExit(true)}
            tone="danger"
          />
        </View>
      </Reveal>

      <Reveal delay={200} className="gap-3">
        <SectionHeader title="Integraciones" caption="Todavía no configuradas" />

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

        <FormNotice
          tone="info"
          title="Sin credenciales configuradas"
          message="No se solicitan claves ni se realizan conexiones. Esta pantalla solo refleja el estado pendiente."
        />
      </Reveal>

      <Reveal delay={260} className="gap-3">
        <SectionHeader title="Acerca de" caption="Melody" />

        <View className="flex-row items-center gap-4 rounded-3xl border border-border bg-card/70 p-5">
          <Logo size="sm" />
          <View className="flex-1 gap-1">
            <AppText variant="bodyStrong">Melody · 1.0.0</AppText>
            <AppText variant="caption" tone="muted">
              Una base visual premium para organizar tu música. Hecha con Expo Router y Uniwind.
            </AppText>
          </View>
        </View>
      </Reveal>

      <ConfirmDialog
        visible={confirmExit}
        title="¿Cerrar la vista previa?"
        message="Volverás al inicio de sesión. No se cerrará ninguna sesión real porque no existe una cuenta conectada."
        confirmLabel="Volver al login"
        onConfirm={handleSignOut}
        onCancel={() => setConfirmExit(false)}
      />
    </Screen>
  );
}
