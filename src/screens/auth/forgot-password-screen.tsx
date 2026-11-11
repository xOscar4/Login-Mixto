import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { FormNotice } from "@/components/ui/form-notice";
import { LottiePlayer } from "@/components/ui/lottie-player";
import { Reveal } from "@/components/ui/reveal";
import { Screen } from "@/components/ui/screen";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import { hasErrors, validateForgot, type FieldErrors } from "@/lib/validation";
import { resetPasswordForEmail } from "@/services/auth";

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    const nextErrors = validateForgot(email);
    setErrors(nextErrors);
    setErrorMessage(null);

    if (hasErrors(nextErrors)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await resetPasswordForEmail(email);
      setSent(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo enviar el enlace.",
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  return (
    <Screen scroll contentClassName="gap-6">
      <ScreenHeader
        title="Recuperar acceso"
        subtitle="Te ayudamos a volver a tu música"
      />

      {sent ? (
        <Reveal className="gap-6">
          <View className="items-center gap-4 rounded-3xl border border-border bg-card/80 p-6 card-shadow">
            <LottiePlayer
              source={require("@/assets/animations/success-check.json")}
              fallback="success"
              className="h-40 w-40"
            />

            <View className="items-center gap-2">
              <AppText variant="heading" className="text-center">
                Enlace enviado
              </AppText>
              <AppText variant="caption" tone="muted" className="text-center">
                Revisa <AppText variant="caption">{email.trim()}</AppText> para
                continuar con la recuperación de acceso.
              </AppText>
            </View>

            {errorMessage ? (
              <FormNotice
                tone="danger"
                title="No se pudo enviar la solicitud"
                message={errorMessage}
              />
            ) : null}

            <View className="w-full gap-3">
              <Button
                label="Volver al inicio de sesión"
                variant="secondary"
                onPress={() => router.replace("/")}
              />
              <Button
                label="Usar otro correo"
                variant="ghost"
                onPress={() => setSent(false)}
              />
            </View>
          </View>
        </Reveal>
      ) : (
        <>
          <Reveal
            delay={60}
            className="gap-4 rounded-3xl border border-border bg-card/80 p-5 card-shadow"
          >
            <View className="h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
              <AppText variant="display" tone="primary">
                ?
              </AppText>
            </View>

            <View className="gap-2">
              <AppText variant="heading">¿Olvidaste tu contraseña?</AppText>
              <AppText variant="caption" tone="muted">
                Escribe el correo con el que te registrarás. Supabase enviará un
                enlace para restablecer la contraseña y abrir la pantalla de
                recuperación segura.
              </AppText>
            </View>

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
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              error={errors.email}
            />

            <Button
              label="Solicitar recuperación"
              icon="mail"
              onPress={handleSubmit}
            />
          </Reveal>

          <Reveal delay={140}>
            <FormNotice
              tone="info"
              title="Enviar enlace de recuperación"
              message="Se enviará un enlace a tu correo para restablecer la contraseña desde la web de confirmación de Melody."
            />
          </Reveal>

          <Reveal delay={200}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              className="items-center py-2 active:opacity-70"
            >
              <AppText variant="caption" tone="primary">
                Volver al inicio de sesión
              </AppText>
            </Pressable>
          </Reveal>
        </>
      )}
    </Screen>
  );
}
