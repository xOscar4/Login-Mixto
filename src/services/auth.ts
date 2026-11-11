/**
 * Servicio de autenticación — Melody
 *
 * Implementa la autenticación real con Supabase Auth para email + password,
 * recuperación de acceso, cambio de contraseña y cierre de sesión.
 */

import * as WebBrowser from "expo-web-browser";
import type { Session, User } from "@supabase/supabase-js";

import { getAuthRedirectUrl, getOAuthRedirectUrl, supabase } from "@/lib/supabase";

export type { Session, User } from "@supabase/supabase-js";

export { supabase };

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
) {
  const redirectUrl = getAuthRedirectUrl("auth/callback");
  console.log("[Melody] signUp emailRedirectTo:", redirectUrl);

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: displayName?.trim() ? { full_name: displayName.trim() } : undefined,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function resetPasswordForEmail(email: string) {
  const publicSiteUrl =
    (
      process.env.EXPO_PUBLIC_SITE_URL ?? "https://melody-auth-eight.vercel.app"
    ).replace(/\/$/, "") + "/reset-password";

  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: publicSiteUrl,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function changePassword(
  newPassword: string,
  currentPassword?: string,
) {
  const attributes: { password: string; current_password?: string } = {
    password: newPassword,
  };

  if (currentPassword && currentPassword.trim().length > 0) {
    attributes.current_password = currentPassword;
  }

  const { data, error } = await supabase.auth.updateUser(attributes);

  if (error) {
    throw new Error(describePasswordError(error));
  }

  if (!data.user) {
    throw new Error(
      "Supabase no confirmó el cambio de contraseña. Vuelve a intentarlo.",
    );
  }

  return data.user as User;
}

/**
 * Mensajes entendibles para los errores de `updateUser`.
 * Se conserva el `message` de Supabase cuando no hay una traducción directa.
 */
function describePasswordError(error: {
  message: string;
  code?: string;
}): string {
  const byCode: Record<string, string> = {
    same_password: "La nueva contraseña debe ser distinta a la anterior.",
    weak_password:
      "La contraseña no cumple la política de seguridad configurada en Supabase.",
    current_password_mismatch: "La contraseña actual no es correcta.",
    reauthentication_needed:
      "Por seguridad, vuelve a iniciar sesión antes de cambiar la contraseña.",
    session_not_found: "Tu sesión expiró. Vuelve a iniciar sesión.",
  };

  if (error.code && byCode[error.code]) {
    return byCode[error.code];
  }

  const message = error.message ?? "";

  if (/auth session missing|session.*not found/i.test(message)) {
    return "Tu sesión expiró. Vuelve a iniciar sesión.";
  }

  if (/failed to fetch|network request failed/i.test(message)) {
    return "No se pudo conectar con Supabase. Revisa tu conexión e inténtalo de nuevo.";
  }

  if (/should be different|same password/i.test(message)) {
    return "La nueva contraseña debe ser distinta a la anterior.";
  }

  return message || "No se pudo cambiar la contraseña. Inténtalo de nuevo.";
}

/**
 * Proveedores de Supabase asociados al usuario, por ejemplo ["email"] o ["google"].
 * Se combinan `identities`, `app_metadata.providers` y `app_metadata.provider`.
 */
export function getAuthProviders(user: User | null): string[] {
  if (!user) {
    return [];
  }

  const fromIdentities = (user.identities ?? []).map(
    (identity) => identity.provider,
  );
  const fromMetadata = Array.isArray(user.app_metadata?.providers)
    ? (user.app_metadata.providers as string[])
    : [];
  const singleProvider = user.app_metadata?.provider;

  const providers = [
    ...fromIdentities,
    ...fromMetadata,
    ...(typeof singleProvider === "string" ? [singleProvider] : []),
  ].filter((provider): provider is string => Boolean(provider));

  return Array.from(new Set(providers));
}

/** true cuando la cuenta entra únicamente con Google (sin contraseña de Melody). */
export function isGoogleOnlyUser(user: User | null): boolean {
  const providers = getAuthProviders(user);

  return (
    providers.length > 0 && providers.every((provider) => provider === "google")
  );
}

/** Página oficial de Google para cambiar la contraseña de la cuenta. */
export const GOOGLE_PASSWORD_URL =
  "https://myaccount.google.com/signinoptions/password";

/**
 * Abre la página de Google en el navegador del sistema (o el navegador
 * interno de Expo). No modifica la sesión ni la configuración de OAuth.
 */
export async function openGooglePasswordPage() {
  await WebBrowser.openBrowserAsync(GOOGLE_PASSWORD_URL);
}

export async function signInWithGoogle() {
  const redirectTo = getOAuthRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error("No se pudo generar la URL de acceso con Google.");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === "cancel" || result.type === "dismiss") {
    throw new Error("Se canceló el inicio de sesión con Google.");
  }

  if (result.type !== "success" || !result.url) {
    throw new Error("No se pudo completar el inicio de sesión con Google.");
  }

  const callbackUrl = new URL(result.url);
  const authError = callbackUrl.searchParams.get("error");
  const authDescription =
    callbackUrl.searchParams.get("error_description") ??
    "No se pudo completar la autenticación con Google.";

  if (authError) {
    throw new Error(authDescription);
  }

  const authCode = callbackUrl.searchParams.get("code");

  if (!authCode) {
    throw new Error("No se recibió el código de Google para continuar.");
  }

  return exchangeCodeForSessionOnce(authCode);
}

type PendingCodeExchange = {
  code: string;
  promise: Promise<Session>;
};

let lastCodeExchange: PendingCodeExchange | null = null;

/**
 * Canjea un `code` PKCE por una sesión de Supabase.
 *
 * El callback puede ser procesado a la vez por `openAuthSessionAsync`, por la
 * ruta `/auth/callback` y por el listener de deep links. Supabase invalida el
 * código después del primer canje, así que todos comparten la misma promesa.
 */
export function exchangeCodeForSessionOnce(code: string): Promise<Session> {
  if (lastCodeExchange?.code === code) {
    return lastCodeExchange.promise;
  }

  const promise = supabase.auth
    .exchangeCodeForSession(code)
    .then(({ data, error }) => {
      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error(
          "Supabase no devolvió una sesión válida al completar el acceso.",
        );
      }

      return data.session;
    });

  lastCodeExchange = { code, promise };

  promise.catch(() => {
    if (lastCodeExchange?.code === code) {
      lastCodeExchange = null;
    }
  });

  return promise;
}

export async function resetPassword(_email: string): Promise<never> {
  throw new Error("resetPassword: uso revertido; usa resetPasswordForEmail().");
}
