# EcoTrueque Venezuela

Aplicación móvil y web para el trueque de bienes y servicios en el estado Trujillo, Venezuela.
Permite publicar ofertas, encontrar intercambios cercanos mediante geolocalización, proponer
trueques, conversar en tiempo real, valorar a otros usuarios y consultar indicadores de consumo
responsable.

Trabajo de grado de Ingeniería en Computación — Universidad Valle del Momboy.
Autores: Br. Rhonny Jaimes y Br. Norlys Castañeda. Tutora: Prof. Caryuly Rosales.

**Versión web:** https://ecotrueque-venezuela-ten.vercel.app/

---

## Tecnologías

| Capa | Herramientas |
|---|---|
| Lenguaje | TypeScript 5.6, SQL y PL/pgSQL |
| Interfaz | React 19.1, React Native 0.81, Expo SDK 54 |
| Navegación | Expo Router 6 (rutas por archivos), React Native Web |
| Datos y estado | TanStack Query 5 (caché de consultas), Zustand 4 (estado global) |
| Formularios | React Hook Form, Zod |
| Mapas | Leaflet + OpenStreetMap en la web; `react-native-maps` en Android/iOS |
| Backend | Supabase: Auth, API REST/RPC, Realtime y Storage |
| Base de datos | PostgreSQL + PostGIS, `pg_trgm`, `unaccent` |
| Seguridad | Políticas Row Level Security (RLS) en todas las tablas |
| Despliegue | Vercel (web), EAS Build (Android/iOS) |

## Arquitectura

```
┌──────────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐
│  App EcoTrueque       │      │  Supabase                 │      │  PostgreSQL + PostGIS     │
│  React Native + Expo  │ ───► │  Auth · REST/RPC          │ ───► │  14 tablas + RLS          │
│  Android · iOS · Web  │ ◄─── │  Realtime · Storage       │ ◄─── │  Funciones y triggers     │
└──────────────────────┘      └──────────────────────────┘      └──────────────────────────┘
```

La app es un cliente que habla directamente con Supabase. La lógica sensible vive en la base de
datos (funciones PL/pgSQL, triggers y políticas RLS), de modo que un usuario solo puede leer o
modificar lo que le corresponde aunque manipule el cliente.

**Tablas:** `profiles`, `listings`, `favorites`, `trade_requests`, `trades`, `conversations`,
`messages`, `reviews`, `achievements`, `user_achievements`, `safe_spots`, `notifications`, `reports`,
`user_blocks`.

**Funciones principales del servidor**

| Función | Qué hace |
|---|---|
| `get_nearby_listings` | Devuelve publicaciones dentro de un radio (`ST_DWithin`), ordenadas por distancia, con filtros de categoría, tipo y texto |
| `get_trade_matches` | Sugiere publicaciones compatibles con una puntuación por reglas (misma categoría, lo que se busca, tipo y estado) |
| `complete_trade` | Cierra un trueque, marca ambas publicaciones como intercambiadas y suma CO₂, residuos y EcoPoints a los dos usuarios |
| `update_eco_level` | Recalcula el nivel según los EcoPoints |
| `update_user_reputation` | Trigger que recalcula la reputación (promedio de estrellas) al recibir una reseña |
| `delete_own_listing` | Elimina (borrado lógico) una publicación propia |
| `get_unread_message_count` | Cuenta los mensajes sin leer del usuario |
| `is_blocked_between` | Indica si dos personas se bloquearon; lo usan las políticas de mensajes y propuestas |

## Cómo funciona

1. **Acceso.** Registro e inicio de sesión con correo y contraseña o enlace mágico (Supabase Auth). La sesión se conserva en el dispositivo.
2. **Publicar.** Asistente de 4 pasos: tipo (bien o servicio), una de 15 categorías, título, qué se busca a cambio y fotos (Supabase Storage).
3. **Explorar.** Lista y mapa de ofertas cercanas, con búsqueda por texto, filtros por categoría y radio de 5, 10, 20 o 50 km. Si el GPS está lejos de Trujillo, la exploración parte de Valera.
4. **Proponer.** Desde una publicación ajena se elige qué ofrecer a cambio y se envía un mensaje. El dueño acepta o rechaza la solicitud.
5. **Conversar.** Cada propuesta abre un chat en tiempo real (Supabase Realtime) con envío de fotos. Las fotos del chat se guardan en un bucket privado y se muestran con enlaces firmados temporales. El menú del chat permite ver el perfil, ver la publicación o reportar al usuario.
6. **Cerrar y valorar.** Ambas partes confirman el encuentro; entonces `complete_trade` cierra el trueque y cada uno puede dejar una reseña de 1 a 5 estrellas.
7. **Impacto.** Panel con nivel, EcoPoints, metas, analogías y logros (ver la sección siguiente).

### Indicadores y EcoPoints

Cada categoría tiene factores promedio de CO₂ y residuos (`src/services/listings.service.ts`).
Al completarse un trueque se suman los factores de los dos artículos y se calculan los EcoPoints
para cada usuario:

```
EcoPoints = (CO₂ estimado × 2) + (residuos estimados × 3) + 20
```

Niveles: Semilla (0), Brote (100), Guardián (300), Protector (700), Héroe Eco (1.500) y Leyenda Verde (3.000).

> Los valores de CO₂, residuos y sus analogías (árboles, kilómetros, botellas, litros de agua) son
> **estimaciones orientativas configuradas por categoría**. La app no mide físicamente los
> artículos ni realiza análisis de ciclo de vida. EcoPoints es un mecanismo de gamificación, no una
> unidad de impacto ambiental.

## Requisitos

- **Node.js 20 LTS o superior** (probado con Node 22) y npm.
- **Git**.
- Una cuenta gratuita en **Supabase** (https://supabase.com).
- Para probar en el teléfono: la app **Expo Go** (Android/iOS) o un emulador de Android / simulador de iOS.
- Opcional: una clave de **Google Maps** para el mapa en Android y una cuenta de **Expo** para compilar con EAS.

## Instalación

### 1. Descargar el código

```bash
git clone https://github.com/Norlysc/ecotrueque-venezuela.git
cd ecotrueque-venezuela
npm install
```

### 2. Crear la base de datos en Supabase

1. Crea un proyecto en Supabase y copia la **Project URL** y la **anon key** (Settings → API).
2. En **SQL Editor**, ejecuta estos archivos en este orden:

| Orden | Archivo | Contenido |
|---|---|---|
| 1 | `supabase/all_migrations.sql` | Extensiones, tablas, índices, funciones, políticas RLS, buckets de Storage y datos base (equivale a 001–006) |
| 2 | `supabase/migrations/010_soft_delete_listing.sql` | Borrado lógico de publicaciones |
| 3 | `supabase/migrations/014_fix_favorites_is_favorited.sql` | Búsqueda cercana con datos del autor y «Me gusta» |
| 4 | `supabase/migrations/015_unread_message_count.sql` | Conteo de mensajes sin leer |
| 5 | `supabase/migrations/016_conversations_listing_id.sql` | Publicación asociada a cada conversación |
| 6 | `supabase/migrations/017_fix_reputation_score.sql` | Corrección del cálculo de reputación |
| 7 | `supabase/migrations/020_politicas_seguridad.sql` | Correo privado y políticas de notificaciones, logros y fotos del chat |
| 8 | `supabase/migrations/021_bloqueo_usuarios.sql` | Bloqueo de usuarios |
| 9 | `supabase/migrations/022_sitios_seguros_valera.sql` | Sitios seguros sugeridos en Valera (datos de OpenStreetMap) |

Los archivos 007–009, 011–013, 018 y 019 cargan publicaciones de ejemplo para cuentas de prueba
concretas; no son necesarios para que la app funcione. Si la base de datos ya existe y solo faltan
las mejoras de noviembre de 2026, basta con ejecutar `supabase/aplicar_mejoras_2026-11.sql`
(015, 020, 021 y 022 juntos). `supabase/historico/` guarda el consolidado que se aplicó antes; no
hay que volver a ejecutarlo.

### 3. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_KEY=          # opcional: mapa nativo en Android
```

## Ejecutar

```bash
npx expo start
```

En la terminal aparece un código QR y un menú:

- Escanea el QR con **Expo Go** para abrirla en tu teléfono (misma red Wi-Fi).
- Pulsa **`w`** para abrir la versión web en el navegador.
- Pulsa **`a`** para el emulador de Android o **`i`** para el simulador de iOS (solo macOS).

Atajo directo a la web:

```bash
npx expo start --web
```

### Otros comandos

| Comando | Para qué |
|---|---|
| `npm run lint` | Revisa el código con ESLint |
| `npm run type-check` | Verifica los tipos de TypeScript |
| `npm test` | Ejecuta las pruebas de Jest (`src/tests/`) con informe de cobertura |
| `npx expo export --platform web` | Genera la versión web estática en `dist/` |

## Despliegue

- **Web (Vercel):** `vercel.json` ya define el build (`npx expo export --platform web`) y la carpeta `dist`. Basta con conectar el repositorio a Vercel y configurar las mismas variables `EXPO_PUBLIC_*`. Cada push a `main` publica una nueva versión.
- **Android / iOS (EAS):**

```bash
npm install -g eas-cli
eas login
eas build --platform android   # o ios
```

Para enviar actualizaciones sin pasar por las tiendas: `scripts/publish-update.sh`.

## Estructura del proyecto

```
ecotrueque/
├── src/
│   ├── app/                     # Pantallas (Expo Router: cada archivo es una ruta)
│   │   ├── (auth)/              # Inicio de sesión, registro, recuperar contraseña
│   │   ├── (tabs)/              # Inicio, Mapa, Publicar, Chat, Perfil
│   │   ├── listing/[id].tsx     # Detalle de una publicación
│   │   ├── edit-listing/[id].tsx
│   │   ├── trade/request.tsx    # Proponer un trueque
│   │   ├── trade-requests.tsx   # Solicitudes recibidas
│   │   ├── chat/[conversationId].tsx
│   │   ├── review-modal.tsx     # Reseña con estrellas
│   │   ├── eco/dashboard.tsx    # Panel de impacto
│   │   ├── user/[userId].tsx    # Perfil público
│   │   └── notifications, help, about, edit-profile, reset-password
│   ├── components/              # chat/, listing/, ui/ (componentes reutilizables)
│   ├── services/                # Acceso a Supabase: auth, listings, trades, chat, eco, reports, blocks
│   ├── hooks/                   # Hooks de React Query y ubicación
│   ├── stores/                  # Estado global con Zustand (sesión, ubicación, tema, avisos)
│   ├── constants/               # Tema, colores, niveles y categorías
│   ├── lib/                     # Cliente de Supabase y React Query
│   ├── utils/                   # Cálculos puros: EcoPoints, logros, ubicación aproximada, formatos
│   ├── tests/                   # Pruebas automatizadas (Jest)
│   └── types/                   # Tipos TypeScript del dominio
├── supabase/
│   ├── all_migrations.sql       # Esquema completo para crear la base de datos
│   ├── migrations/              # Migraciones numeradas (001–022) y datos de ejemplo
│   ├── aplicar_mejoras_2026-11.sql # Mejoras 015, 020, 021 y 022 en un solo archivo
│   ├── historico/               # Consolidado aplicado anteriormente (referencia)
│   └── diagnostics/             # Consultas de diagnóstico del mapa y RPC
├── assets/                      # Íconos, logos y splash
├── scripts/                     # setup.sh, publish-update.sh
├── app.config.ts                # Configuración de Expo
├── eas.json                     # Perfiles de compilación EAS
└── vercel.json                  # Despliegue web
```

## Limitaciones conocidas

- Las cifras de CO₂ y residuos son estimaciones por categoría, no mediciones certificadas.
- No hay notificaciones push (solo avisos dentro de la app) ni panel de administración.
- Los sitios seguros son sugerencias; el lugar del encuentro lo acuerdan las dos personas por el chat.
- El mapa muestra una ubicación aproximada (cuadrícula de unos 550 m); la distancia exacta solo se usa en el servidor para ordenar.
