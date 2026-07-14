-- ============================================
-- EcoTrueque Venezuela - Datos semilla
-- ============================================

-- ============================================
-- LOGROS (16 logros predefinidos)
-- ============================================
INSERT INTO public.achievements (key, title, description, emoji, points_reward, requirement_type, requirement_value)
VALUES
  ('first_trade', 'Primera Semilla', 'Completa tu primer trueque ecológico', '🌱', 50, 'trades_count', 1),
  ('five_trades', 'Cinco Trueques', 'Realiza 5 trueques ecológicos', '🔄', 100, 'trades_count', 5),
  ('ten_trades', 'Decena Verde', 'Completa 10 trueques', '🌿', 200, 'trades_count', 10),
  ('twenty_trades', 'Veterano del Trueque', 'Completa 20 trueques', '🏆', 400, 'trades_count', 20),
  ('sprout_level', 'Nivel Brote', 'Alcanza el nivel Brote (100 pts)', '🌿', 75, 'eco_points', 100),
  ('guardian_level', 'Nivel Guardián', 'Alcanza el nivel Guardián (300 pts)', '🍃', 150, 'eco_points', 300),
  ('protector_level', 'Nivel Protector', 'Alcanza el nivel Protector (700 pts)', '🌳', 250, 'eco_points', 700),
  ('hero_level', 'Nivel Héroe Eco', 'Alcanza el nivel Héroe (1500 pts)', '🦋', 400, 'eco_points', 1500),
  ('legend_level', 'Leyenda Verde', 'Alcanza el nivel Leyenda (3000 pts)', '🌍', 600, 'eco_points', 3000),
  ('co2_saver_50', 'Ahorrador CO₂', 'Evita 50 kg de CO₂', '🌬️', 100, 'co2_saved_kg', 50),
  ('co2_saver_200', 'Guardián del Aire', 'Evita 200 kg de CO₂', '💨', 300, 'co2_saved_kg', 200),
  ('waste_reducer_10', 'Anti Residuos', 'Evita 10 kg de residuos', '♻️', 75, 'waste_reduced_kg', 10),
  ('waste_reducer_50', 'Reciclador Pro', 'Evita 50 kg de residuos', '🔄', 200, 'waste_reduced_kg', 50),
  ('reviewer_1', 'Primera Reseña', 'Escribe tu primera reseña', '⭐', 25, 'reviews_given', 1),
  ('perfect_rating', 'Reputación Perfecta', 'Mantén 5 estrellas con 5+ reseñas', '🌟', 200, 'reputation_stars', 5),
  ('community_pillar', 'Pilar de la Comunidad', 'Recibe 50 reseñas positivas', '🏛️', 500, 'reviews_received', 50)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SITIOS SEGUROS - CARACAS
-- ============================================
INSERT INTO public.safe_spots (name, type, address, city, state, latitude, longitude, is_24h, phone)
VALUES
  ('Sambil Caracas', 'mall', 'Av. Libertador, El Rosal', 'Caracas', 'Distrito Capital', 10.5002, -66.8511, FALSE, NULL),
  ('Centro Comercial El Recreo', 'mall', 'Av. Casanova, Sabana Grande', 'Caracas', 'Distrito Capital', 10.5007, -66.8789, FALSE, NULL),
  ('Centro Comercial Paseo Las Mercedes', 'mall', 'Calle París, Las Mercedes', 'Caracas', 'Distrito Capital', 10.4841, -66.8618, FALSE, NULL),
  ('Metro Altamira', 'metro', 'Av. Luis Roche, Altamira', 'Caracas', 'Distrito Capital', 10.4927, -66.8395, TRUE, NULL),
  ('Metro Plaza Venezuela', 'metro', 'Av. Universidad, Plaza Venezuela', 'Caracas', 'Distrito Capital', 10.5015, -66.8948, TRUE, NULL),
  ('Metro Chacaíto', 'metro', 'Av. Francisco de Miranda, Chacaíto', 'Caracas', 'Distrito Capital', 10.4974, -66.8620, TRUE, NULL),
  ('Metro Bellas Artes', 'metro', 'Av. Lecuna, Bellas Artes', 'Caracas', 'Distrito Capital', 10.5063, -66.9015, TRUE, NULL),
  ('Metro La California', 'metro', 'Av. La California', 'Caracas', 'Distrito Capital', 10.4785, -66.8455, TRUE, NULL),
  ('CICPC Las Mercedes', 'police', 'Calle Londres, Las Mercedes', 'Caracas', 'Distrito Capital', 10.4875, -66.8609, TRUE, '0212-993-7766'),
  ('Comisaría de El Cafetal', 'police', 'Av. El Cafetal', 'Caracas', 'Distrito Capital', 10.4755, -66.8328, TRUE, NULL),
  ('Centro Comercial La Lagunita', 'mall', 'El Hatillo', 'Caracas', 'Miranda', 10.4449, -66.8105, FALSE, NULL),

-- SITIOS SEGUROS - MARACAIBO
  ('Sambil Maracaibo', 'mall', 'Av. 8B, Maracaibo', 'Maracaibo', 'Zulia', 10.6748, -71.6197, FALSE, NULL),
  ('Centro Comercial Galerías Mall', 'mall', 'Av. 5 de Julio, Maracaibo', 'Maracaibo', 'Zulia', 10.6668, -71.5967, FALSE, NULL),
  ('CCCT Maracaibo', 'mall', 'Av. Bella Vista, Maracaibo', 'Maracaibo', 'Zulia', 10.6524, -71.6285, FALSE, NULL),

-- SITIOS SEGUROS - VALENCIA
  ('Sambil Valencia', 'mall', 'Av. Bolívar Norte, Valencia', 'Valencia', 'Carabobo', 10.1888, -67.9942, FALSE, NULL),
  ('Centro Comercial Metrópolis', 'mall', 'Av. Bolívar Norte, Valencia', 'Valencia', 'Carabobo', 10.2014, -67.9977, FALSE, NULL),
  ('CC Gran Bazar Valencia', 'mall', 'Valencia', 'Valencia', 'Carabobo', 10.1797, -68.0018, FALSE, NULL),

-- SITIOS SEGUROS - BARQUISIMETO
  ('CC Sambil Barquisimeto', 'mall', 'Av. Pedro León Torres', 'Barquisimeto', 'Lara', 10.0749, -69.3093, FALSE, NULL),
  ('CC Las Trinitarias', 'mall', 'Av. 20, Barquisimeto', 'Barquisimeto', 'Lara', 10.0636, -69.3367, FALSE, NULL),

-- SITIOS SEGUROS - MÉRIDA
  ('CC Hacienda La Trinidad', 'mall', 'Av. Andrés Bello, Mérida', 'Mérida', 'Mérida', 8.5839, -71.1517, FALSE, NULL)

ON CONFLICT DO NOTHING;

-- ============================================
-- ACTIVAR REALTIME en tablas necesarias (idempotente)
-- ============================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['messages', 'conversations', 'trade_requests', 'notifications'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- ============================================
-- ÍNDICES adicionales para sitios seguros
-- ============================================
CREATE INDEX IF NOT EXISTS idx_safe_spots_city
  ON public.safe_spots (city);

CREATE INDEX IF NOT EXISTS idx_safe_spots_state
  ON public.safe_spots (state);
