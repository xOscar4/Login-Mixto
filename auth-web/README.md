# Melody Auth Web

Sitio independiente para gestiones de autenticación de Supabase en web:

- Confirmación de correo: `/auth/confirm`
- Éxito de confirmación: `/auth/success`
- Recuperación de contraseña: `/reset-password`
- Error de verificación: `/auth/error`

## Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Luego completa:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL`

## Despliegue en Vercel

La app ya incluye `vercel.json` para SPA routing y usa `npm run build` como build command.

## Importante

No se usa la `service_role` key jamás en este proyecto. Solo `anon` o `publishable` key.
