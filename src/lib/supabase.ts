/**
 * Cliente Supabase para Melody.
 *
 * Importa este archivo en cualquier servicio o hook que necesite
 * hablar con Supabase Auth o la base de datos.
 *
 * Requisitos de entorno (.env en la raíz del proyecto):
 *   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
 */

import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

if (!supabaseUrl || supabaseUrl.trim() === "") {
  throw new Error(
    "[Melody] Falta EXPO_PUBLIC_SUPABASE_URL en el archivo .env.\n" +
      "Encuéntrala en Supabase Dashboard → tu proyecto → Settings → API → Project URL.",
  );
}

if (!supabasePublishableKey || supabasePublishableKey.trim() === "") {
  throw new Error(
    "[Melody] Falta EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en el archivo .env.\n" +
      "Encuéntrala en Supabase Dashboard → tu proyecto → Settings → API → Publishable key.\n" +
      "NUNCA uses la service_role key en la aplicación móvil.",
  );
}

export function getAuthRedirectUrl(path = "auth/callback") {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const publicUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (publicUrl) {
    const target = normalizedPath || "auth/callback";
    return new URL(target, publicUrl).toString();
  }

  return Linking.createURL(normalizedPath || "auth/callback");
}

/** Debe coincidir con `expo.scheme` definido en app.json. */
export const APP_SCHEME = "melody";

export const AUTH_CALLBACK_PATH = "auth/callback";

/**
 * URL de retorno nativa para OAuth.
 *
 * Se construye de forma determinista porque `Linking.createURL()` incluye el
 * host del servidor de desarrollo dentro de un development build
 * (por ejemplo `melody://192.168.x.x:8081/auth/callback`). Supabase rechazaría
 * ese host y terminaría redirigiendo al Site URL (Vercel) con `?code=...`.
 */
export function getMobileAuthRedirectUrl(path = AUTH_CALLBACK_PATH) {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${APP_SCHEME}://${normalizedPath || AUTH_CALLBACK_PATH}`;
}

/**
 * Redirect que se envía a Supabase en `signInWithOAuth`.
 * - Nativo: esquema propio de la app (`melody://auth/callback`).
 * - Web: la URL pública configurada en `EXPO_PUBLIC_SITE_URL`.
 */
export function getOAuthRedirectUrl() {
  if (Platform.OS === "web") {
    return getAuthRedirectUrl(AUTH_CALLBACK_PATH);
  }

  return getMobileAuthRedirectUrl(AUTH_CALLBACK_PATH);
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});
