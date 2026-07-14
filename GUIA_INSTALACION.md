# 📱 Guía de Instalación — EcoTrueque Venezuela

## PASO 1: Configurar Supabase (backend gratuito)

1. Ve a **supabase.com** y crea una cuenta gratuita
2. Crea un nuevo proyecto llamado "ecotrueque"
3. Anota tu **Project URL** y **anon key** (en Settings → API)
4. En el SQL Editor, ejecuta los archivos en este orden:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_indexes.sql`
   - `supabase/migrations/003_functions.sql`
   - `supabase/migrations/004_rls_policies.sql`
   - `supabase/migrations/005_storage.sql`
   - `supabase/migrations/006_seed_data.sql`

## PASO 2: Configurar Google Maps

1. Ve a **console.cloud.google.com**
2. Crea un proyecto y habilita "Maps SDK for Android" y "Maps SDK for iOS"
3. Crea una API Key y anótala

## PASO 3: Configurar el proyecto

```bash
# Clonar / abrir la carpeta del proyecto
cd ecotrueque

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Edita `.env` con tus datos:
```
EXPO_PUBLIC_SUPABASE_URL=https://TU_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
EXPO_PUBLIC_GOOGLE_MAPS_KEY=tu_api_key_maps
```

## PASO 4: Ejecutar en desarrollo

```bash
npx expo start

# Escanea el QR con Expo Go (iOS/Android)
# O presiona 'a' para Android emulator
# O presiona 'i' para iOS simulator
```

## PASO 5: Build para producción

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Build Android (APK de prueba)
eas build --platform android --profile preview

# Build para Play Store
eas build --platform android --profile production
```

## Problemas comunes

### Error: "supabase not found"
```bash
npm install -g supabase
```

### Error: "Cannot find module '@lib/supabase'"
Verifica que `babel.config.js` tenga los alias configurados correctamente.

### El mapa no aparece
Verifica que `EXPO_PUBLIC_GOOGLE_MAPS_KEY` esté en tu `.env`

### Las notificaciones no llegan
Las notificaciones push solo funcionan en dispositivo físico, no en emulador.

## Soporte

Si tienes problemas, revisa:
- Los logs de Supabase en el dashboard
- Los logs de Expo: `npx expo start --clear`
- Que todas las migraciones SQL se ejecutaron sin error
