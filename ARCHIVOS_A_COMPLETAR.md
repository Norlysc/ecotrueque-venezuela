# Archivos que necesitas completar con el código de las fases

Copia el código correspondiente de la conversación a cada archivo:

## FASE 1 — Arquitectura
- [ ] src/lib/supabase.ts ✅ (ya tiene código base)
- [ ] src/lib/queryClient.ts ✅ (ya tiene código base)
- [ ] src/lib/notifications.ts (de Fase 9)
- [ ] src/types/app.types.ts
- [ ] src/types/database.types.ts
- [ ] src/constants/theme.ts
- [ ] src/constants/categories.ts
- [ ] src/stores/authStore.ts
- [ ] src/stores/locationStore.ts
- [ ] src/stores/notificationStore.ts
- [ ] src/app/_layout.tsx
- [ ] src/app/index.tsx

## FASE 2 — Base de datos (ejecutar en Supabase)
- [ ] supabase/migrations/001_initial_schema.sql
- [ ] supabase/migrations/002_indexes.sql
- [ ] supabase/migrations/003_functions.sql
- [ ] supabase/migrations/004_rls_policies.sql
- [ ] supabase/migrations/005_storage.sql
- [ ] supabase/migrations/006_seed_data.sql

## FASE 3 — Autenticación
- [ ] src/services/auth.service.ts
- [ ] src/hooks/useAuth.ts
- [ ] src/app/auth/_layout.tsx
- [ ] src/app/auth/login.tsx
- [ ] src/app/auth/register.tsx
- [ ] src/app/auth/forgot-password.tsx
- [ ] src/app/auth/verify-email.tsx

## FASE 4 — Design System
- [ ] src/components/ui/Button.tsx
- [ ] src/components/ui/Input.tsx
- [ ] src/components/ui/Badge.tsx
- [ ] src/components/ui/Avatar.tsx
- [ ] src/components/ui/Card.tsx
- [ ] src/components/ui/Skeleton.tsx
- [ ] src/components/ui/EmptyState.tsx
- [ ] src/components/ui/Toast.tsx
- [ ] src/components/listing/ListingCard.tsx
- [ ] src/app/tabs/_layout.tsx

## FASE 5 — Pantallas
- [ ] src/services/listings.service.ts
- [ ] src/hooks/useListings.ts
- [ ] src/hooks/useLocation.ts
- [ ] src/app/tabs/index.tsx
- [ ] src/app/listing/[id].tsx
- [ ] src/app/eco/dashboard.tsx
- [ ] src/app/tabs/profile.tsx

## FASE 6 — Mapa
- [ ] src/app/tabs/map.tsx

## FASE 7 — Publicar
- [ ] src/app/tabs/publish.tsx

## FASE 8 — Motor de trueques
- [ ] src/services/trades.service.ts
- [ ] src/hooks/useTrades.ts
- [ ] src/app/trade/request.tsx

## FASE 9 — Chat
- [ ] src/services/chat.service.ts
- [ ] src/hooks/useChat.ts
- [ ] src/app/tabs/chat.tsx
- [ ] src/app/chat/[conversationId].tsx
- [ ] src/lib/notifications.ts
- [ ] src/stores/notificationStore.ts
- [ ] supabase/functions/send-notification/index.ts

## FASE 10 — Eco avanzado
- [ ] src/services/eco.service.ts
- [ ] src/app/eco/achievements.tsx

## FASE 11 — Admin
- [ ] src/app/admin/index.tsx

## FASE 12 — QA
- [ ] src/utils/security.ts
- [ ] src/tests/eco.service.test.ts
- [ ] src/tests/validators.test.ts
- [ ] jest.config.js

## FASE 13 — Deploy
- [ ] scripts/setup.sh ✅
- [ ] scripts/publish-update.sh ✅
