import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { FormNotice } from '@/components/ui/form-notice';
import { Logo } from '@/components/ui/logo';
import { PasswordStrength } from '@/components/ui/password-strength';
import { Reveal } from '@/components/ui/reveal';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { hasErrors, validateRegister, type FieldErrors } from '@/lib/validation';
import { signUpWithEmail } from '@/services/auth';

export function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string; tone: 'success' | 'danger' } | null>(null);

  async function handleSubmit() {
    const nextErrors = validateRegister(name, email, password, confirmPassword);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      setSubmitted(false);
      setNotice(null);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      const data = await signUpWithEmail(email, password, name);
      const needsConfirmation = !data.session;

      setSubmitted(true);
      setNotice({
        tone: needsConfirmation ? 'success' : 'success',
        title: needsConfirmation ? 'Cuenta creada' : 'Cuenta creada',
        message: needsConfirmation
          ? 'Revisa tu correo para confirmar la cuenta y completar el registro.'
          : 'Tu cuenta ya quedó lista para entrar.',
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (data.session) {
        router.replace('/home');
      }
    } catch (error) {
      setSubmitted(false);
      setNotice({
        tone: 'danger',
        title: 'No se pudo crear la cuenta',
        message: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  return (
    <Screen scroll contentClassName="gap-7">
      <Reveal delay={40} className="items-center gap-3 pt-2">
        <Logo size="sm" />
        <View className="items-center gap-1">
          <AppText variant="title">Crea tu cuenta</AppText>
          <AppText variant="caption" tone="muted" className="text-center">
            Guarda tus colecciones musicales en un solo lugar.
          </AppText>
        </View>
      </Reveal>

      <Reveal delay={120}>
        <View className="gap-4 rounded-3xl border border-border bg-card/80 p-5 card-shadow">
          <TextField
            label="Nombre"
            icon="user"
            value={name}
            onChangeText={setName}
            placeholder="¿Cómo te llamas?"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            error={errors.name}
          />

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

          <TextField
            label="Contraseña"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            placeholder="Crea una contraseña segura"
            secure
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            error={errors.password}
          />

          <PasswordStrength value={password} />

          <TextField
            label="Confirmar contraseña"
            icon="shield"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repite tu contraseña"
            secure
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            error={errors.confirmPassword}
          />

          {notice ? <FormNotice tone={notice.tone} title={notice.title} message={notice.message} /> : null}

          <Button label="Crear cuenta" icon="sparkle" onPress={handleSubmit} />
        </View>
      </Reveal>

      {submitted && !notice ? (
        <FormNotice
          tone="info"
          title="Registro listo para continuar"
          message="La cuenta se procesará con Supabase Auth."
        />
      ) : null}

      <Reveal delay={220}>
        <View className="flex-row items-center justify-center gap-1">
          <AppText variant="caption" tone="muted">
            ¿Ya tienes cuenta?
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="py-1 active:opacity-70"
          >
            <AppText variant="caption" tone="primary">
              Volver al inicio de sesión
            </AppText>
          </Pressable>
        </View>
      </Reveal>
    </Screen>
  );
}
