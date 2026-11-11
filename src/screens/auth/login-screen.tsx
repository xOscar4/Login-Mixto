import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { FormNotice, type FormNoticeTone } from "@/components/ui/form-notice";
import { GoogleMark } from "@/components/ui/google-mark";
import { Logo } from "@/components/ui/logo";
import { LottiePlayer } from "@/components/ui/lottie-player";
import { PreviewChip } from "@/components/ui/preview-chip";
import { Reveal } from "@/components/ui/reveal";
import { Screen } from "@/components/ui/screen";
import { TextField } from "@/components/ui/text-field";
import { useSession } from "@/features/auth/session-context";
import { hasErrors, validateLogin, type FieldErrors } from "@/lib/validation";
import { signInWithEmail, signInWithGoogle } from "@/services/auth";

type Notice = { tone: FormNoticeTone; title: string; message: string };

export function LoginScreen() {
  const { enterPreview, exitPreview } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit() {
    const nextErrors = validateLogin(email, password);
    setErrors(nextErrors);
    setNotice(null);

    if (hasErrors(nextErrors)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await signInWithEmail(email, password);
      exitPreview();
      setNotice({
        tone: "success",
        title: "Sesión iniciada",
        message: "Se restaurará tu acceso en la aplicación.",
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Comprueba tus credenciales e inténtalo otra vez.";

      setNotice({
        tone: "danger",
        title: "No se pudo iniciar sesión",
        message,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function handleGoogle() {
    setErrors({});
    setNotice(null);
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      setNotice({
        tone: "success",
        title: "Sesión iniciada",
        message: "Se restaurará tu acceso en la aplicación.",
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión con Google.";

      setNotice({
        tone: "danger",
        title: "No se pudo continuar con Google",
        message,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  function handlePreview() {
    enterPreview();
    router.replace("/home");
  }

  return (
    <Screen scroll contentClassName="gap-6">
      <Reveal className="items-center gap-4 pt-2">
        <LottiePlayer
          source={require("@/assets/animations/splash-vinyl.json")}
          fallback="vinyl"
          className="h-32 w-32"
        />
        <Logo size="md" showWordmark showMark={false} />
      </Reveal>

      <Reveal delay={80} className="gap-2">
        <AppText variant="title">Bienvenido de nuevo</AppText>
        <AppText variant="caption" tone="muted">
          Organiza tu música en colecciones con una experiencia pensada para
          sentirse bien.
        </AppText>
      </Reveal>

      <Reveal delay={160}>
        <View className="gap-4 rounded-3xl border border-border bg-card/80 p-5 card-shadow">
          <TextField
            label="Correo electrónico"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            error={errors.email}
          />

          <View className="gap-2">
            <TextField
              label="Contraseña"
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              secure
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              error={errors.password}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/forgot-password")}
              className="self-end py-1 active:opacity-70"
            >
              <AppText variant="caption" tone="primary">
                ¿Olvidaste tu contraseña?
              </AppText>
            </Pressable>
          </View>

          {notice ? (
            <FormNotice
              tone={notice.tone}
              title={notice.title}
              message={notice.message}
            />
          ) : null}

          <View className="gap-3">
            <Button
              label="Iniciar sesión"
              trailingIcon="forward"
              onPress={handleSubmit}
            />

            <View className="flex-row items-center gap-3">
              <View className="h-px flex-1 bg-border" />
              <AppText variant="caption" tone="muted">
                o
              </AppText>
              <View className="h-px flex-1 bg-border" />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleGoogle}
              disabled={isGoogleLoading}
              className="min-h-14 flex-row items-center justify-center gap-3 rounded-2xl border border-border bg-surface/90 px-5 py-4 active:scale-[0.99] active:opacity-85 disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#dbeafe" />
              ) : (
                <GoogleMark size={20} />
              )}
              <AppText variant="label">
                {isGoogleLoading ? "Conectando..." : "Continuar con Google"}
              </AppText>
            </Pressable>
          </View>
        </View>
      </Reveal>

      <Reveal delay={240}>
        <View className="flex-row items-center justify-center gap-1">
          <AppText variant="caption" tone="muted">
            ¿Aún no tienes cuenta?
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/register")}
            className="py-1 active:opacity-70"
          >
            <AppText variant="caption" tone="primary">
              Crear cuenta
            </AppText>
          </Pressable>
        </View>
      </Reveal>

      <Reveal delay={320}>
        <View className="items-center gap-3 rounded-3xl border border-dashed border-border bg-surface/40 p-5">
          <PreviewChip label="Modo de revisión" />
          <AppText variant="caption" tone="muted" className="text-center">
            Abre la interfaz sin iniciar sesión. No se crea una cuenta ni se
            simula autenticación.
          </AppText>
          <Button
            label="Explorar la interfaz"
            icon="sparkle"
            variant="secondary"
            onPress={handlePreview}
            className="w-full"
          />
        </View>
      </Reveal>
    </Screen>
  );
}
