-- ============================================================
-- ECOTRUEQUE — DIAGNÓSTICO COMPLETO DEL MAPA
-- Copiar y ejecutar en: Supabase Dashboard → SQL Editor
-- Ejecutar sección por sección y comparar con los resultados esperados
-- ============================================================


-- ============================================================
-- PASO 1: ¿PostGIS está habilitado?
-- ============================================================
-- ESPERADO: 1 fila con extname='postgis'
-- SI 0 FILAS: La RPC falla con "function st_setsrid does not exist"
-- SOLUCIÓN: Activar en Supabase Dashboard → Database → Extensions → postgis
-- ============================================================
SELECT
  extname,
  extversion,
  'PostGIS OK ✅' AS estado
FROM pg_extension
WHERE extname = 'postgis'

UNION ALL

SELECT
  'postgis' AS extname,
  'NO ENCONTRADO' AS extversion,
  'PostGIS FALTA ❌ — actívalo en Dashboard → Database → Extensions' AS estado
WHERE NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis');


-- ============================================================
-- PASO 2: ¿La función get_nearby_listings existe?
-- ============================================================
-- ESPERADO: 1 fila con routine_name='get_nearby_listings'
-- SI 0 FILAS: La migración 003_functions.sql no se ejecutó
-- SOLUCIÓN: Ejecutar el contenido de supabase/migrations/003_functions.sql
-- ============================================================
SELECT
  routine_name,
  routine_type,
  security_type,
  'Función OK ✅' AS estado
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_nearby_listings'

UNION ALL

SELECT
  'get_nearby_listings',
  'FUNCTION',
  'N/A',
  'Función NO EXISTE ❌ — ejecuta la migración 003_functions.sql' AS estado
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name = 'get_nearby_listings'
);


-- ============================================================
-- PASO 3: ¿La función tiene permisos EXECUTE para anon y authenticated?
-- ============================================================
-- ESPERADO: 2 filas — una para 'anon' y otra para 'authenticated'
-- SI 0 FILAS: La RPC devuelve error de permisos 403 / "permission denied"
-- SOLUCIÓN: Correr el script de fix de grants (ver PASO 3 FIX abajo)
-- ============================================================
SELECT
  grantee,
  privilege_type,
  'Grant OK ✅' AS estado
FROM information_schema.role_routine_grants
WHERE routine_schema = 'public'
  AND routine_name = 'get_nearby_listings'
  AND grantee IN ('anon', 'authenticated');


-- ============================================================
-- PASO 4: ¿Cuántos listings hay? ¿Tienen coordenadas?
-- ============================================================
-- ESPERADO (después de correr seed):
--   total=10, active=10
--   con_latlon=10 (tienen latitude/longitude)
--   con_location_geography=10 (tienen columna GEOGRAPHY para PostGIS)
--   sin_location_geography=0
-- SI con_location_geography=0: el trigger auto-location no existe
--   → Los listings aparecen en la lista pero la distancia es NULL
--   → El mapa SÍ muestra marcadores (usa latitude/longitude)
-- SI total=0: no hay datos → ejecutar 007_test_listings.sql
-- ============================================================
SELECT
  COUNT(*)                                                          AS total,
  COUNT(*) FILTER (WHERE status = 'active')                        AS active,
  COUNT(*) FILTER (WHERE status = 'deleted')                       AS deleted,
  COUNT(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL)  AS con_latlon,
  COUNT(*) FILTER (WHERE location IS NOT NULL)                     AS con_location_geography,
  COUNT(*) FILTER (WHERE location IS NULL AND latitude IS NOT NULL)       AS sin_location_geography
FROM public.listings;


-- ============================================================
-- PASO 5: ¿La tabla profiles tiene usuarios?
-- ============================================================
-- ESPERADO: al menos 1 fila
-- SI 0 FILAS: ningún usuario se ha registrado → no hay listings posibles
--   (listings.user_id es FK a profiles.id)
-- ============================================================
SELECT
  COUNT(*) AS total_usuarios,
  MAX(created_at) AS ultimo_registro
FROM public.profiles;


-- ============================================================
-- PASO 6: Ver los primeros listings con su estado de coordenadas
-- ============================================================
-- ESPERADO: rows con latitude/longitude != NULL y location != NULL
-- Si ves location = NULL en todos: necesitas correr el fix del trigger
-- ============================================================
SELECT
  id,
  title,
  category,
  status,
  city,
  latitude,
  longitude,
  CASE WHEN location IS NOT NULL THEN 'Sí ✅' ELSE 'No ❌' END AS tiene_geography,
  created_at
FROM public.listings
ORDER BY created_at DESC
LIMIT 15;


-- ============================================================
-- PASO 7: Probar la RPC directamente con coordenadas de Caracas
-- ============================================================
-- ESPERADO: al menos 1 fila con id, title, latitude, longitude, distance_km
-- SI 0 FILAS pero listings existen: problema en RLS, grants, o PostGIS
-- SI ERROR: ver mensaje de error — puede ser PostGIS faltante o función inexistente
-- distance_km = NULL significa que la columna location (GEOGRAPHY) está vacía
-- ============================================================
SELECT
  id,
  title,
  category,
  city,
  status,
  latitude,
  longitude,
  distance_km,
  CASE
    WHEN distance_km IS NULL THEN 'Sin GEOGRAPHY ⚠️ — falta trigger'
    ELSE distance_km || ' km ✅'
  END AS estado_distancia
FROM public.get_nearby_listings(
  10.4806,    -- latitud centro Caracas
  -66.9036,   -- longitud centro Caracas
  50,         -- radio 50 km (amplio para asegurar que capture todo)
  NULL,       -- sin filtro de categoría
  NULL,       -- sin filtro de tipo
  NULL,       -- sin búsqueda
  30,         -- límite 30 resultados
  0           -- offset 0
);


-- ============================================================
-- PASO 8: ¿Las políticas RLS de listings son correctas?
-- ============================================================
-- ESPERADO:
--   listings_select_active → cmd=SELECT, qual=(status <> 'deleted')
--   listings_insert_own    → cmd=INSERT
--   listings_update_own    → cmd=UPDATE
--   listings_delete_own    → cmd=DELETE
-- Si 0 filas en SELECT: RLS está bloqueando toda lectura
-- Si hay policy con qual = 'auth.uid() = user_id' para SELECT: solo el dueño puede ver sus listings
-- ============================================================
SELECT
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'listings'
ORDER BY cmd, policyname;


-- ============================================================
-- PASO 9: ¿La función es SECURITY INVOKER o SECURITY DEFINER?
-- ============================================================
-- ESPERADO: prosecdef = false (SECURITY INVOKER)
-- SECURITY INVOKER → la RLS de listings aplica al usuario que llama
-- Con listings_select_active USING (status != 'deleted') y anon habilitado:
--   usuarios no autenticados SÍ pueden ver listings activos ✅
-- Si prosecdef = true (DEFINER) → ejecuta como el dueño de la función,
--   bypasea RLS → también debería funcionar ✅
-- ============================================================
SELECT
  proname                                        AS funcion,
  CASE WHEN prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS modo_seguridad,
  provolatile                                    AS volatilidad,
  pg_get_function_arguments(oid)                 AS parametros
FROM pg_proc
WHERE proname = 'get_nearby_listings'
  AND pronamespace = 'public'::regnamespace;


-- ============================================================
-- RESUMEN DE DIAGNÓSTICO
-- ============================================================
-- Corre esto al final para ver todo en una sola tabla
-- ============================================================
SELECT check_name, resultado FROM (
  SELECT 1 AS orden, 'PostGIS habilitado'           AS check_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname='postgis')
         THEN 'OK ✅' ELSE 'FALTA ❌' END           AS resultado
  UNION ALL
  SELECT 2, 'Función get_nearby_listings existe',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema='public' AND routine_name='get_nearby_listings')
         THEN 'OK ✅' ELSE 'FALTA ❌ — correr migración 003' END
  UNION ALL
  SELECT 3, 'Grant EXECUTE para anon',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.role_routine_grants WHERE routine_schema='public' AND routine_name='get_nearby_listings' AND grantee='anon')
         THEN 'OK ✅' ELSE 'FALTA ❌ — correr fix de grants' END
  UNION ALL
  SELECT 4, 'Grant EXECUTE para authenticated',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.role_routine_grants WHERE routine_schema='public' AND routine_name='get_nearby_listings' AND grantee='authenticated')
         THEN 'OK ✅' ELSE 'FALTA ❌ — correr fix de grants' END
  UNION ALL
  SELECT 5, 'Listings en la base de datos',
    COALESCE((SELECT COUNT(*)::TEXT FROM public.listings WHERE status='active'), '0') || ' activos'
  UNION ALL
  SELECT 6, 'Usuarios en profiles',
    COALESCE((SELECT COUNT(*)::TEXT FROM public.profiles), '0') || ' usuarios'
  UNION ALL
  SELECT 7, 'Listings con GEOGRAPHY (location)',
    COALESCE((SELECT COUNT(*)::TEXT FROM public.listings WHERE location IS NOT NULL), '0')
    || ' / ' || COALESCE((SELECT COUNT(*)::TEXT FROM public.listings WHERE status='active'),'0')
    || ' activos'
  UNION ALL
  SELECT 8, 'RLS SELECT policy en listings',
    CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listings' AND cmd='SELECT')
         THEN 'OK ✅ — ' || (SELECT qual FROM pg_policies WHERE tablename='listings' AND cmd='SELECT' LIMIT 1)
         ELSE 'SIN POLICY ❌ — todo bloqueado' END
) AS checks
ORDER BY orden;
