-- ============================================================
-- FIX: Columna `location` (GEOGRAPHY) en listings existentes
--
-- CONTEXTO: La migración 002_indexes.sql ya crea el trigger
--   trg_update_listing_location que auto-puebla location desde
--   latitude/longitude en cada INSERT o UPDATE.
--
-- PROBLEMA: Si hay listings insertados ANTES de que se corriera
--   002_indexes.sql, esos listings tienen location = NULL aunque
--   tengan latitude/longitude. La RPC get_nearby_listings los
--   devuelve pero con distance_km = NULL.
--
-- FIX: Re-hacer un UPDATE no-op sobre las columnas lat/lng para
--   que el trigger dispare y llene location retroactivamente.
-- ============================================================

-- ── PASO 1: Verificar si el trigger existe ───────────────────
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  'Trigger OK ✅' AS estado
FROM information_schema.triggers
WHERE event_object_table = 'listings'
  AND trigger_name = 'trg_update_listing_location'

UNION ALL

SELECT
  'trg_update_listing_location',
  'INSERT/UPDATE',
  'BEFORE',
  'Trigger NO EXISTE ❌ — correr migración 002_indexes.sql' AS estado
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.triggers
  WHERE event_object_table = 'listings'
    AND trigger_name = 'trg_update_listing_location'
);


-- ── PASO 2: ¿Hay listings sin location aunque tienen lat/lng? ─
SELECT
  COUNT(*) FILTER (WHERE location IS NOT NULL)                           AS con_geography,
  COUNT(*) FILTER (WHERE location IS NULL AND latitude IS NOT NULL)      AS sin_geography_necesitan_fix,
  COUNT(*) FILTER (WHERE latitude IS NULL)                               AS sin_coordenadas
FROM public.listings;


-- ── PASO 3 (EJECUTAR SOLO SI sin_geography_necesitan_fix > 0) ─
-- Dispara el trigger trg_update_listing_location sobre los registros
-- que tienen lat/lng pero location = NULL.
-- Efecto: el trigger rellena location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
UPDATE public.listings
SET
  latitude  = latitude,
  longitude = longitude
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location IS NULL;

-- Resultado esperado: "UPDATE N" donde N = número de listings corregidos
-- Después de esto, volver a correr PASO 2 y ver sin_geography = 0


-- ── PASO 4: Verificar resultado ──────────────────────────────
SELECT
  COUNT(*) FILTER (WHERE location IS NOT NULL)                         AS con_geography,
  COUNT(*) FILTER (WHERE location IS NULL AND latitude IS NOT NULL)    AS sin_geography,
  'Todos los listings con lat/lng ahora tienen GEOGRAPHY ✅' AS mensaje
FROM public.listings
HAVING COUNT(*) FILTER (WHERE location IS NULL AND latitude IS NOT NULL) = 0;
