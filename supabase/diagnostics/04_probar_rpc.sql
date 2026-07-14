-- ============================================================
-- TEST DIRECTO DE LA RPC get_nearby_listings
-- Ejecutar después de correr el diagnóstico y los fixes
-- ============================================================


-- ── TEST 1: Radio amplio (50 km) — debe devolver todos los listings ──
-- ESPERADO: 10 filas (seed data) con distance_km en números reales
-- Si distance_km = NULL en todas: falta correr 02_fix_location_trigger.sql
-- Si 0 filas: PostGIS falta o la función no existe
-- Si error: ver mensaje — postgis, grants, o función inexistente
SELECT
  title,
  category,
  city,
  status,
  latitude,
  longitude,
  distance_km,
  CASE
    WHEN distance_km IS NOT NULL THEN '✅ Distancia OK: ' || distance_km || ' km'
    WHEN latitude IS NOT NULL    THEN '⚠️  Sin GEOGRAPHY — distancia NULL (ejecutar fix 02)'
    ELSE                              '❌ Sin coordenadas — no aparece en mapa'
  END AS diagnostico
FROM public.get_nearby_listings(
  10.4806,    -- Centro Caracas — lat
  -66.9036,   -- Centro Caracas — lng
  50,         -- 50 km de radio
  NULL,       -- todas las categorías
  NULL,       -- todos los tipos
  NULL,       -- sin búsqueda
  50,         -- hasta 50 resultados
  0
)
ORDER BY distance_km ASC NULLS LAST;


-- ── TEST 2: Radio pequeño (5 km) — filtro específico ──
-- Con el seed data centrado en Caracas y radio de 5km,
-- debería devolver algunos listings cercanos al centro.
-- Si 0 filas pero TEST 1 devuelve resultados: coordenadas del seed
-- están bien pero el radio filtró. Normal con listings en diferentes zonas.
SELECT
  COUNT(*) AS resultados_5km,
  MIN(distance_km) AS distancia_minima_km,
  MAX(distance_km) AS distancia_maxima_km
FROM public.get_nearby_listings(
  10.4806, -66.9036,
  5,       -- 5 km radio
  NULL, NULL, NULL, 30, 0
);


-- ── TEST 3: Filtro por categoría ──
-- Buscar solo electrónica — debe devolver 2 listings (Laptop + iPhone)
SELECT
  title, category, city, distance_km
FROM public.get_nearby_listings(
  10.4806, -66.9036, 50,
  'electronics',  -- solo electrónica
  NULL, NULL, 30, 0
);


-- ── TEST 4: Búsqueda por texto ──
-- Buscar 'laptop' — debe devolver el listing de la Dell
SELECT
  title, category, city, distance_km
FROM public.get_nearby_listings(
  10.4806, -66.9036, 50,
  NULL, NULL,
  'laptop',  -- búsqueda de texto
  30, 0
);


-- ── TEST 5: Verificar que el seed data existe ──
-- Si este devuelve 0: el seed (007_test_listings.sql) no se corrió
SELECT
  category,
  COUNT(*) AS cantidad,
  MIN(latitude) AS lat_min,
  MAX(latitude) AS lat_max
FROM public.listings
WHERE status = 'active'
GROUP BY category
ORDER BY category;
