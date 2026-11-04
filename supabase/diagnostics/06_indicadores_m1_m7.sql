-- =============================================================
-- EcoTrueque: corte de datos de los indicadores M1–M7 (solo lectura)
-- Ejecutar en Supabase → SQL Editor. Cambiar las dos fechas del período.
-- Definiciones según la Tabla 32 del trabajo de grado.
-- =============================================================
WITH periodo AS (
  SELECT TIMESTAMPTZ '2026-06-01 00:00:00-04' AS desde,
         TIMESTAMPTZ '2026-11-04 23:59:59-04' AS hasta
),
cierres AS (
  SELECT t.* FROM public.trades t, periodo p WHERE t.completed_at BETWEEN p.desde AND p.hasta
),
articulos AS (   -- las dos publicaciones de cada trueque cerrado
  SELECT l.* FROM cierres c JOIN public.listings l ON l.id IN (c.requested_listing_id, c.offered_listing_id)
),
solicitudes AS ( -- solicitudes válidas: todas las creadas en el período, salvo las canceladas por quien las envió
  SELECT r.* FROM public.trade_requests r, periodo p
  WHERE r.created_at BETWEEN p.desde AND p.hasta AND r.status <> 'cancelled'
)
SELECT 'M1 Intercambios completados' AS indicador, COUNT(*)::TEXT AS valor, 'Registro directo (trades)' AS tipo FROM cierres
UNION ALL
SELECT 'M2 Bienes reutilizados', COUNT(*)::TEXT, 'Registro directo (bienes en trueques cerrados)' FROM articulos WHERE type = 'good'
UNION ALL
SELECT 'M3 Servicios gestionados', COUNT(*)::TEXT, 'Registro directo (servicios en trueques cerrados)' FROM articulos WHERE type = 'service'
UNION ALL
SELECT 'M4 Tasa de conversión', COALESCE(ROUND(100.0 * (SELECT COUNT(*) FROM cierres) / NULLIF(COUNT(*), 0), 1)::TEXT || ' %', 'sin solicitudes'),
       'Indicador calculado (cierres ÷ solicitudes válidas)' FROM solicitudes
UNION ALL
SELECT 'M5 Compras potencialmente evitadas', COUNT(*)::TEXT, 'Estimación condicionada (supuesto: cada bien recibido sustituye una compra)' FROM articulos WHERE type = 'good'
UNION ALL
SELECT 'M6 Ahorro económico aproximado', COALESCE('USD ' || SUM(estimated_value_usd)::TEXT, 'sin valores declarados'),
       'Estimación condicionada (valor declarado en las publicaciones)' FROM articulos
UNION ALL
SELECT 'M7 Distribución: ' || category || ' · ' || COALESCE(city, 'sin ciudad'), COUNT(*)::TEXT,
       'Registro directo (categoría y municipio)' FROM articulos GROUP BY category, city;
