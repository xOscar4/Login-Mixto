import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || supabaseUrl.trim() === '') {
  throw new Error(
    '[Melody Auth Web] Falta VITE_SUPABASE_URL en el archivo .env.\n' +
      'Encuéntrala en Supabase Dashboard → tu proyecto → Settings → API → Project URL.',
  )
}

if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
  throw new Error(
    '[Melody Auth Web] Falta VITE_SUPABASE_ANON_KEY o VITE_SUPABASE_PUBLISHABLE_KEY en el archivo .env.\n' +
      'NUNCA uses la service_role key en la aplicación web pública.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

export function getAuthRedirectUrl(path = '/auth/confirm') {
  const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin
  return new URL(path, baseUrl).toString()
}
