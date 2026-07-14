# 🌿 EcoTrueque Venezuela

> Aplicación móvil de trueque ecológico para Venezuela.
> Intercambia bienes y servicios sin dinero. Cuida el planeta.

## Stack tecnológico

- **Frontend**: React Native + Expo + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Mapas**: Google Maps
- **Notificaciones**: Expo Push Notifications
- **Estado**: Zustand + React Query
- **Formularios**: React Hook Form + Zod

## Inicio rápido

### 1. Prerrequisitos
- Node.js 18+
- Expo CLI: `npm install -g expo-cli eas-cli`
- Cuenta Supabase (supabase.com)
- Cuenta Expo (expo.dev)

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 4. Configurar Supabase
```bash
# Opción A: Supabase CLI
npx supabase login
npx supabase db push

# Opción B: Dashboard manual
# Ejecutar archivos en supabase/migrations/ en orden
```

### 5. Iniciar la app
```bash
npx expo start
```

## Estructura del proyecto

```
ecotrueque/
├── src/
│   ├── app/              # Expo Router (pantallas)
│   │   ├── auth/         # Login, registro, recuperación
│   │   ├── tabs/         # Tabs principales
│   │   ├── listing/      # Detalle y creación de listings
│   │   ├── trade/        # Solicitudes de trueque
│   │   ├── chat/         # Conversaciones
│   │   ├── profile/      # Perfil y configuración
│   │   ├── eco/          # Dashboard ecológico
│   │   └── admin/        # Panel administrativo
│   ├── components/       # Componentes reutilizables
│   ├── hooks/            # Custom hooks
│   ├── stores/           # Estado global (Zustand)
│   ├── services/         # Lógica de negocio
│   ├── types/            # Tipos TypeScript
│   ├── constants/        # Tema, categorías, etc.
│   ├── utils/            # Utilidades
│   └── lib/              # Configuración Supabase, etc.
├── supabase/
│   ├── migrations/       # Esquema SQL
│   └── functions/        # Edge Functions
└── assets/               # Imágenes, íconos
```

## Características

- 🗺️ Mapa interactivo estilo Airbnb
- 🤖 Motor de matching inteligente (IA)
- 💬 Chat en tiempo real
- 🌿 Dashboard ecológico gamificado
- 🏆 16 logros desbloqueables
- 6 niveles eco (Semilla → Leyenda Verde)
- 🛡️ Sitios seguros para encuentros
- 🌙 Modo oscuro nativo
- 📱 Android + iOS

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima Supabase |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | API Key de Google Maps |
| `EAS_PROJECT_ID` | ID del proyecto en EAS |

## Deploy

```bash
# Android (APK de prueba)
eas build --platform android --profile preview

# Android (Play Store)
eas build --platform android --profile production

# iOS (TestFlight)
eas build --platform ios --profile production
```

## Licencia

MIT © EcoTrueque Venezuela 2024
