# Melody

Aplicación móvil de música construida con **Expo SDK 57**, **Expo Router** y **Uniwind**. Esta
primera etapa es exclusivamente visual: pantallas, navegación, formularios y estados de interfaz.

> **Importante:** Supabase y Google Cloud todavía **no están configurados**. No se simula una
> autenticación exitosa ni se guardan colecciones ficticias como si fueran datos reales.

## Qué incluye

- Login, registro y recuperación de contraseña.
- Inicio con saludo, resumen de colecciones, animación musical y estado de integraciones.
- Lista de colecciones con estado vacío, creación, edición y eliminación.
- Formulario de colección con nombre, descripción y vista previa.
- Detalle de colección con acciones y sección de pistas preparada para la siguiente etapa.
- Ajustes con información de cuenta, cambio de contraseña y cierre de la vista previa.
- Cambio de contraseña con reglas de seguridad y estado de éxito de muestra.
- Tema oscuro con azul eléctrico, violeta, tarjetas redondeadas, gradientes y tipografías
  `Outfit` + `DM Sans`.

## Requisitos

- Node.js 20 o superior.
- Expo Go (para revisar la interfaz) o un development build (para Lottie nativo).

## Instalación y arranque

```bash
npm install
npx expo start
```

Luego abre el proyecto en Expo Go o en un emulador. También puedes usar:

```bash
npx expo start --android
npx expo start --ios
```

## Modo de vista previa

El botón **Explorar la interfaz** del login abre las pantallas de la app sin iniciar sesión.
`isPreview` es solo un estado de navegación local:

- No crea usuarios.
- No valida credenciales reales.
- No simula una sesión autenticada.
- Se reinicia al cerrar la app.

Los envíos de login, registro, recuperación y cambio de contraseña validan el formulario y muestran
un aviso de **“Supabase pendiente”**. No hay respuestas falsas de éxito.

## Colecciones

Las colecciones creadas se guardan en un **borrador en memoria** (`CollectionsProvider`). Se
pierden al cerrar o recargar la app y nunca se envían a un servidor. La interfaz lo indica en cada
pantalla.

Puntos de integración futura:

- `src/features/auth/session-context.tsx`: reemplazar la vista previa por Supabase Auth.
- `src/features/collections/collections-context.tsx`: sustituir el estado local por consultas a
  `supabase.from('collections')` con RLS por `user_id`.
- `src/config/integrations.ts`: estado visible de Supabase y Google Cloud.

## Lottie y Expo Go

`lottie-react-native` no está incluido en Expo Go. La app detecta `Constants.executionEnvironment`
y usa una animación equivalente con `Animated` de React Native. Para ver los archivos Lottie
nativos:

```bash
npx expo run:android
# o
npx expo run:ios
```

Las animaciones son archivos locales originales en `assets/animations/`.

## Estructura

```text
src/
  app/                 Rutas de Expo Router
    (app)/(tabs)/      Inicio, colecciones y ajustes
    (app)/collections/ Formularios y detalle
  components/app/      Barra de pestañas
  components/ui/       Sistema visual reutilizable
  features/            Sesión de vista previa y colecciones en memoria
  screens/             Cuerpo de cada pantalla
  lib/                 Validaciones, formato y utilidades
  config/              Estado de integraciones
global.css             Tokens de Uniwind/Tailwind y utilidades
```

## Verificación

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
npx expo export --platform android
```

## Privacidad de credenciales

No hay claves, URLs de Supabase ni clientes OAuth en el proyecto. La configuración de esas
integraciones queda para la siguiente etapa y fuera del alcance de esta entrega.
