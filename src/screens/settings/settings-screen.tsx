import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormNotice } from "@/components/ui/form-notice";
import { Icon, type IconName } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { PreviewChip } from "@/components/ui/preview-chip";
import { Reveal } from "@/components/ui/reveal";
import { Screen } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { INTEGRATIONS } from "@/config/integrations";
import { useSession } from "@/features/auth/session-context";
import {
  isGoogleOnlyUser,
  openGooglePasswordPage,
  signOut,
} from "@/services/auth";

type SettingsRowProps = {
  icon: IconName;
  title: string;
  caption: string;
  onPress: () => void;
  tone?: "default" | "danger";
};

function SettingsRow({
  icon,
  title,
  caption,
  onPress,
  tone = "default",
}: SettingsRowProps) {
  const isDanger = tone === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface/60 p-4 active:opacity-80"
    >
      <View
        className={
          isDanger
            ? "h-11 w-11 items-center justify-center rounded-2xl bg-danger/15"
            : "h-11 w-11 items-center justify-center rounded-2xl bg-primary/15"
        }
      >
        <Icon name={icon} size={19} tone={isDanger ? "danger" : "primary"} />
      </View>

      <View className="flex-1 gap-0.5">
        <AppText variant="label" tone={isDanger ? "danger" : "default"}>
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
  const { exitPreview, isAuthenticated, user } = useSession();
  const [confirmExit, setConfirmExit] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{
    tone: "info" | "danger";
    title: string;
    message: string;
  } | null>(null);

  const isGoogleAccount = isGoogleOnlyUser(user);

  async function handleChangePassword() {
    // Cuenta de Google: no existe contraseña de Melody que cambiar.
    if (isGoogleAccount) {
      setPasswordNotice({
        tone: "info",
        title: "Tu contraseña se administra en Google",
        message:
          "Abrimos la página oficial de tu cuenta de Google. Melody no guarda ni modifica esa contraseña.",
      });

      try {
        await openGooglePasswordPage();
      } catch {
        setPasswordNotice({
          tone: "danger",
          title: "No se pudo abrir el navegador",
          message:
            "Abre https://myaccount.google.com/signinoptions/password manualmente desde tu navegador.",
        });
      }

      return;
    }

    router.push("/settings/change-password");
  }

  async function handleSignOut() {
    setConfirmExit(false);

    try {
      if (isAuthenticated) {
        await signOut();
      }
    } finally {
      exitPreview();
      router.replace("/");
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
              <AppText variant="subheading">
                {isAuthenticated
                  ? "Cuenta conectada"
                  : "Sesión de vista previa"}
              </AppText>
              <AppText variant="caption" tone="muted">
                {isAuthenticated
                  ? (user?.email ?? "Cuenta autenticada")
                  : "Sin cuenta conectada"}
              </AppText>
            </View>

            <Logo size="sm" />
          </View>

          <View className="mt-4 rounded-2xl border border-border bg-background/40 p-3">
            <AppText variant="caption" tone="muted">
              {isAuthenticated
                ? "Tu sesión se gestiona con Supabase Auth y se restaura al abrir la app."
                : "No hay un usuario real cargado. Inicia sesión para continuar."}
            </AppText>
          </View>
        </View>
      </Reveal>

      <Reveal delay={140} className="gap-3">
        <SectionHeader title="Cuenta" caption="Acceso y seguridad" />

        {passwordNotice ? (
          <FormNotice
            tone={passwordNotice.tone}
            title={passwordNotice.title}
            message={passwordNotice.message}
          />
        ) : null}

        <View className="gap-3">
          <SettingsRow
            icon="key"
            title="Cambiar contraseña"
            caption={
              isGoogleAccount
                ? "Se administra en tu cuenta de Google"
                : isAuthenticated
                  ? "Actualiza la contraseña de tu cuenta"
                  : "Necesitas iniciar sesión primero"
            }
            onPress={handleChangePassword}
          />
          <SettingsRow
            icon="logout"
            title={
              isAuthenticated
                ? "Cerrar sesión"
                : "Cerrar sesión de vista previa"
            }
            caption="Vuelve a la pantalla de inicio de sesión"
            onPress={() => setConfirmExit(true)}
            tone="danger"
          />
        </View>
      </Reveal>

      <Reveal delay={200} className="gap-3">
        <SectionHeader
          title="Integraciones"
          caption="Estado real de la configuración"
        />

        <View className="gap-3 rounded-3xl border border-border bg-card/70 p-4">
          {Object.values(INTEGRATIONS).map((integration) => (
            <View
              key={integration.name}
              className="flex-row items-center gap-3"
            >
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-surface">
                <Icon
                  name={integration.name === "Supabase" ? "album" : "sparkle"}
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
                  integration.status === "Activo"
                    ? "rounded-full border border-success/30 bg-success/10 px-2.5 py-1"
                    : "rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1"
                }
              >
                <AppText
                  variant="overline"
                  tone={integration.status === "Activo" ? "success" : undefined}
                  className={
                    integration.status === "Activo"
                      ? "tracking-wider"
                      : "text-warning"
                  }
                >
                  {integration.status}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <FormNotice
          tone="success"
          title="Supabase y Google conectados"
          message="Supabase gestiona la autenticación y las colecciones con RLS. Google Cloud se usa para el inicio de sesión con Google."
        />
      </Reveal>

      <Reveal delay={260} className="gap-3">
        <SectionHeader title="Acerca de" caption="Melody" />

        <View className="flex-row items-center gap-4 rounded-3xl border border-border bg-card/70 p-5">
          <Logo size="sm" />
          <View className="flex-1 gap-1">
            <AppText variant="bodyStrong">Melody · 1.0.0</AppText>
            <AppText variant="caption" tone="muted">
              Una base visual premium para organizar tu música. Hecha con Expo
              Router y Uniwind.
            </AppText>
          </View>
        </View>
      </Reveal>

      <ConfirmDialog
        visible={confirmExit}
        title={isAuthenticated ? "¿Cerrar sesión?" : "¿Cerrar la vista previa?"}
        message={
          isAuthenticated
            ? "Se cerrará la sesión actual de Supabase y volverás a la pantalla de inicio."
            : "Volverás al inicio de sesión. La vista previa se cerrará sin afectar tu cuenta real."
        }
        confirmLabel={isAuthenticated ? "Cerrar sesión" : "Volver al login"}
        onConfirm={handleSignOut}
        onCancel={() => setConfirmExit(false)}
      />
    </Screen>
  );
}
