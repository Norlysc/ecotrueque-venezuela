-- =============================================================
-- EcoTrueque: Sitios seguros sugeridos en Valera, estado Trujillo (noviembre 2026)
-- Ejecutar en Supabase SQL Editor
-- =============================================================
-- Lugares públicos de referencia para acordar el encuentro. El punto final lo
-- deciden las dos personas por el chat; la app solo los muestra como sugerencia.
-- Nombres y coordenadas tomados de OpenStreetMap (consulta Overpass del
-- 4/11/2026); entre paréntesis, el identificador del elemento en OSM.
-- Las direcciones sin calle registrada en OSM se indican como «Valera».
-- No se marca atención 24 horas ni teléfono porque OSM no los registra.

INSERT INTO public.safe_spots (name, type, address, city, state, latitude, longitude, is_24h, phone)
SELECT v.name, v.type, v.address, 'Valera', 'Trujillo', v.lat, v.lng, FALSE, NULL
FROM (VALUES
  ('Plaza Bolívar de Valera',            'public', 'Centro de Valera (OSM way/242779132)',              9.31480, -70.60807),
  ('Alcaldía del Municipio Valera',      'public', 'Avenida 11, Valera (OSM node/5253389841)',          9.31519, -70.60845),
  ('C.I.C.P.C. Valera',                  'police', 'Valera (OSM way/545668480)',                        9.30761, -70.60778),
  ('Protección Civil Valera',            'public', 'Valera (OSM node/4016851403)',                      9.32079, -70.59978),
  ('Centro Comercial Trumetta',          'mall',   'Calle Américo Briceño, Valera (OSM node/4993844347)', 9.31773, -70.60029),
  ('Multicentro El Recreo',              'mall',   'Valera (OSM way/543778802)',                        9.30470, -70.60974),
  ('Centro Comercial Las Acacias',       'mall',   'Valera (OSM way/543779184)',                        9.30546, -70.61068),
  ('C.C. Plaza',                         'mall',   'Valera (OSM way/446384826)',                        9.29765, -70.61531)
) AS v(name, type, address, lat, lng)
WHERE NOT EXISTS (
  SELECT 1 FROM public.safe_spots s WHERE s.name = v.name AND s.city = 'Valera'
);
