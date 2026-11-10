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

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});
