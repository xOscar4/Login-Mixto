/**
 * Servicio de autenticación — Melody
 *
 * Implementa la autenticación real con Supabase Auth para email + password,
 * recuperación de acceso, cambio de contraseña y cierre de sesión.
 */

import type { User } from "@supabase/supabase-js";

import { getAuthRedirectUrl, supabase } from "@/lib/supabase";

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
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: getAuthRedirectUrl("reset-password"),
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
  const payload: { password: string; current_password?: string } = {
    password: newPassword,
  };

  if (currentPassword && currentPassword.trim().length > 0) {
    payload.current_password = currentPassword;
  }

  const { data, error } = await supabase.auth.updateUser(payload);

  if (error) {
    throw error;
  }

  return data.user as User;
}

export async function signInWithGoogle(): Promise<never> {
  throw new Error(
    "signInWithGoogle: todavía no implementado. Ver siguiente paso de OAuth.",
  );
}

export async function resetPassword(_email: string): Promise<never> {
  throw new Error("resetPassword: uso revertido; usa resetPasswordForEmail().");
}
