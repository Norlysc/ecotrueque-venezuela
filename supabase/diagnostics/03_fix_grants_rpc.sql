-- ============================================================
-- FIX: Permisos EXECUTE para las RPC functions
--
-- En Supabase, las funciones creadas via SQL Editor o migraciones
-- necesitan GRANT EXECUTE explícito para los roles anon y authenticated.
-- Sin esto la llamada supabase.rpc('get_nearby_listings') devuelve:
--   { error: { code: "42501", message: "permission denied for function get_nearby_listings" } }
-- ============================================================

-- Permisos para get_nearby_listings (mapa)
GRANT EXECUTE ON FUNCTION public.get_nearby_listings(
  DOUBLE PRECISION, DOUBLE PRECISION, INTEGER,
  TEXT, TEXT, TEXT, INTEGER, INTEGER
) TO anon, authenticated;

-- Permisos para get_trade_matches (matching de trueques)
GRANT EXECUTE ON FUNCTION public.get_trade_matches(UUID, UUID, INTEGER)
  TO authenticated;

-- Permisos para complete_trade (si existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name = 'complete_trade'
  ) THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.complete_trade(UUID, UUID) TO authenticated';
  END IF;
END $$;

-- Verificar que los grants quedaron aplicados
SELECT
  routine_name,
  grantee,
  privilege_type
FROM information_schema.role_routine_grants
WHERE routine_schema = 'public'
  AND routine_name IN ('get_nearby_listings', 'get_trade_matches', 'complete_trade')
  AND grantee IN ('anon', 'authenticated')
ORDER BY routine_name, grantee;
