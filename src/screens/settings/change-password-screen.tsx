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
import { useSession } from "@/features/auth/session-context";
import {
  hasErrors,
  validatePasswordChange,
  type FieldErrors,
} from "@/lib/validation";
import {
  changePassword,
  GOOGLE_PASSWORD_URL,
  isGoogleOnlyUser,
  openGooglePasswordPage,
} from "@/services/auth";

export function ChangePasswordScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useSession();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const isGoogleAccount = isGoogleOnlyUser(user);
  const canChangePassword = isAuthenticated && !isGoogleAccount;

  async function handleOpenGooglePassword() {
    setGoogleError(null);

    try {
      await openGooglePasswordPage();
    } catch {
      setGoogleError(
        `No se pudo abrir el navegador. Abre ${GOOGLE_PASSWORD_URL} manualmente.`,
      );
    }
  }

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setSubmitError(null);
  }

  async function handleSubmit() {
    // Evita envíos duplicados mientras Supabase responde.
    if (isSubmitting || !canChangePassword) {
      return;
    }

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

    setIsSubmitting(true);

    try {
      await changePassword(newPassword, currentPassword);
      setShowSuccess(true);
      resetForm();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la contraseña. Inténtalo de nuevo.",
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
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
              Contraseña actualizada
            </AppText>
            <AppText variant="caption" tone="muted" className="text-center">
              Tu contraseña se ha cambiado correctamente. Úsala la próxima vez
              que inicies sesión con tu correo.
            </AppText>
          </View>

          <View className="w-full gap-3">
            <Button label="Volver a ajustes" onPress={() => router.back()} />
            <Button
              label="Revisar el formulario otra vez"
              variant="ghost"
              onPress={() => setShowSuccess(false)}
            />
          </View>
        </Reveal>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen scroll contentClassName="gap-6">
        <ScreenHeader title="Cambiar contraseña" />

        <Reveal>
          <FormNotice
            tone="info"
            title="Necesitas iniciar sesión"
            message="Esta función solo está disponible con una sesión activa de Supabase. Vuelve a iniciar sesión y ábrela de nuevo."
          />
        </Reveal>

        <Reveal delay={80}>
          <Button
            label="Volver a ajustes"
            variant="secondary"
            onPress={() => router.back()}
          />
        </Reveal>
      </Screen>
    );
  }

  if (isGoogleAccount) {
    return (
      <Screen scroll contentClassName="gap-6">
        <ScreenHeader title="Cambiar contraseña" />

        <Reveal>
          <FormNotice
            tone="info"
            title="Tu contraseña se administra en Google"
            message="Iniciaste sesión con Google, así que Melody no puede cambiar esa contraseña. Se gestiona desde tu cuenta de Google."
          />
        </Reveal>

        {googleError ? (
          <Reveal delay={60}>
            <FormNotice
              tone="danger"
              title="No se pudo abrir el navegador"
              message={googleError}
            />
          </Reveal>
        ) : null}

        <Reveal delay={80} className="gap-3">
          <AppText variant="caption" tone="muted">
            Tu sesión de Google sigue activa y no se ve afectada por este aviso.
          </AppText>
          <Button
            label="Abrir cuenta de Google"
            icon="forward"
            onPress={handleOpenGooglePassword}
          />
          <Button
            label="Volver a ajustes"
            variant="secondary"
            onPress={() => router.back()}
          />
        </Reveal>
      </Screen>
    );
  }

  return (
    <Screen scroll contentClassName="gap-6">
      <ScreenHeader
        title="Cambiar contraseña"
        subtitle={user?.email ?? undefined}
      />

      {submitError ? (
        <Reveal>
          <FormNotice
            tone="danger"
            title="No se pudo cambiar la contraseña"
            message={submitError}
          />
        </Reveal>
      ) : (
        <Reveal>
          <FormNotice
            tone="info"
            title="Actualización segura"
            message="Se validará tu sesión y se enviará la nueva contraseña a Supabase Auth para guardarla de forma segura."
          />
        </Reveal>
      )}

      <Reveal
        delay={80}
        className="gap-4 rounded-3xl border border-border bg-card/80 p-5 card-shadow"
      >
        <TextField
          label="Contraseña actual"
          icon="lock"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Tu contraseña actual"
          secure
          editable={!isSubmitting}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="next"
          error={errors.currentPassword}
          hint="Se requiere cuando existe una sesión autenticada."
        />

        <View className="h-px bg-border" />

        <TextField
          label="Nueva contraseña"
          icon="key"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Crea una contraseña segura"
          secure
          editable={!isSubmitting}
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
          editable={!isSubmitting}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          error={errors.confirmPassword}
        />
      </Reveal>

      <Reveal delay={140} className="gap-3">
        <Button
          label="Cambiar contraseña"
          icon="check"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
        <Button
          label="Cancelar"
          variant="secondary"
          onPress={() => router.back()}
          disabled={isSubmitting}
        />
      </Reveal>
    </Screen>
  );
}
