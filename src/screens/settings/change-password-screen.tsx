import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { FormNotice } from "@/components/ui/form-notice";
import { LottiePlayer } from "@/components/ui/lottie-player";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Reveal } from "@/components/ui/reveal";
import { Screen } from "@/components/ui/screen";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import {
    hasErrors,
    validatePasswordChange,
    type FieldErrors,
} from "@/lib/validation";
import { changePassword } from "@/services/auth";

export function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    const nextErrors = validatePasswordChange(
      currentPassword,
      newPassword,
      confirmPassword,
    );
    setErrors(nextErrors);
    setSubmitError(null);

    if (hasErrors(nextErrors)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await changePassword(newPassword, currentPassword);
      setShowSuccess(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la contraseña.",
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  if (showSuccess) {
    return (
      <Screen scroll contentClassName="gap-6">
        <ScreenHeader title="Cambiar contraseña" />

        <Reveal className="items-center gap-4 rounded-3xl border border-border bg-card/80 p-6 card-shadow">
          <LottiePlayer
            source={require("@/assets/animations/success-check.json")}
            fallback="success"
            className="h-40 w-40"
          />

          <View className="items-center gap-2">
            <AppText variant="heading" className="text-center">
              Flujo listo para revisar
            </AppText>
            <AppText variant="caption" tone="muted" className="text-center">
              Esta es la vista previa del estado de éxito. Ninguna contraseña
              fue modificada.
            </AppText>
          </View>

          {submitError ? (
            <FormNotice
              tone="danger"
              title="No se pudo actualizar la contraseña"
              message={submitError}
            />
          ) : null}

          <View className="w-full gap-3">
            <Button label="Volver a ajustes" onPress={() => router.back()} />
            <Button
              label="Revisar el formulario otra vez"
              variant="ghost"
              onPress={() => {
                setShowSuccess(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            />
          </View>
        </Reveal>
      </Screen>
    );
  }

  return (
    <Screen scroll contentClassName="gap-6">
      <ScreenHeader
        title="Cambiar contraseña"
        subtitle="Preparación visual del flujo"
      />

      <Reveal>
        <FormNotice
          tone="info"
          title="No se cambiará ninguna contraseña"
          message="Valida las reglas del formulario y muestra el estado de éxito, pero no existe una sesión real. La actualización se conectará con Supabase Auth."
        />
      </Reveal>

      <Reveal
        delay={80}
        className="gap-4 rounded-3xl border border-border bg-card/80 p-5 card-shadow"
      >
        <TextField
          label="Contraseña actual"
          icon="lock"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Requerida cuando Supabase esté conectado"
          secure
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="next"
          error={errors.currentPassword}
          hint="Se pedirá cuando exista una sesión autenticada."
        />

        <View className="h-px bg-border" />

        <TextField
          label="Nueva contraseña"
          icon="key"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Crea una contraseña segura"
          secure
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          error={errors.newPassword}
        />

        <PasswordStrength value={newPassword} />

        <TextField
          label="Confirmar nueva contraseña"
          icon="shield"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repite la nueva contraseña"
          secure
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          error={errors.confirmPassword}
        />
      </Reveal>

      <Reveal delay={140} className="gap-3">
        <Button
          label="Actualizar contraseña"
          icon="check"
          onPress={handleSubmit}
        />
        <Button
          label="Cancelar"
          variant="secondary"
          onPress={() => router.back()}
        />
      </Reveal>
    </Screen>
  );
}
