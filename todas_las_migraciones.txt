-- ===============================================================
-- ECOTRUEQUE VENEZUELA — MIGRACIONES COMPLETAS
-- Pegar TODO en Supabase Dashboard → SQL Editor → Run
-- Ejecutar en orden (010 → 011 → 013 → 014 → 015 → 016)
-- ===============================================================




-- ═══════════════════════════════════════════════════════════════
-- [010] FIX: Error al eliminar publicación (SECURITY DEFINER)
-- ═══════════════════════════════════════════════════════════════
-- El problema: al hacer UPDATE status='deleted', la política
-- RLS de SELECT (status != 'deleted') hace invisible la fila
-- DESPUÉS del update. PostgreSQL lanza un error porque la fila
-- actualizada ya no pasa el check de visibilidad.
-- La solución: función SECURITY DEFINER que hace el soft-delete
-- internamente, verifica que el usuario sea el dueño, y bypasea
-- la validación post-update de RLS.

CREATE OR REPLACE FUNCTION public.delete_own_listing(p_listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo el dueño puede eliminar
  IF NOT EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = p_listing_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado: solo el dueño puede eliminar esta publicación';
  END IF;

  -- Soft delete (bypasea el check de visibilidad por SECURITY DEFINER)
  UPDATE public.listings
  SET status = 'deleted', updated_at = NOW()
  WHERE id = p_listing_id;
END;
$$;

-- Permitir que usuarios autenticados llamen la función
GRANT EXECUTE ON FUNCTION public.delete_own_listing(UUID) TO authenticated;




-- ═══════════════════════════════════════════════════════════════
-- [011] MIGRACIÓN: Mover todos los usuarios al estado Trujillo
-- ═══════════════════════════════════════════════════════════════
-- Distribuye los usuarios entre las principales ciudades
-- del estado Trujillo, Venezuela.

-- PASO 1: Actualizar perfiles
UPDATE public.profiles
SET city = 'Valera', state = 'Trujillo', updated_at = NOW()
WHERE email = 'ncastaneda30@gmail.com';

UPDATE public.profiles
SET city = 'Trujillo', state = 'Trujillo', updated_at = NOW()
WHERE email = 'edicsonpepo@gmail.com';

UPDATE public.profiles
SET city = 'Valera', state = 'Trujillo', updated_at = NOW()
WHERE email NOT IN ('ncastaneda30@gmail.com', 'edicsonpepo@gmail.com');

-- PASO 2: Publicaciones de ncastaneda → coordenadas de Valera
DO $$
DECLARE
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE email = 'ncastaneda30@gmail.com';

  IF v_uid IS NULL THEN
    RAISE NOTICE 'Usuario ncastaneda30 no encontrado, saltando...';
    RETURN;
  END IF;

  WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
    FROM public.listings
    WHERE user_id = v_uid AND status != 'deleted'
  ),
  coords(rn, lat, lng, city_name) AS (
    VALUES
      (1,  9.3247, -70.6081, 'Valera'),
      (2,  9.3199, -70.6054, 'Valera'),
      (3,  9.3278, -70.6112, 'Valera'),
      (4,  9.3165, -70.6033, 'Valera'),
      (5,  9.3310, -70.6090, 'Valera'),
      (6,  9.3228, -70.6145, 'Valera'),
      (7,  9.3185, -70.6067, 'Valera'),
      (8,  9.3260, -70.5998, 'Valera'),
      (9,  9.3300, -70.6030, 'Valera'),
      (10, 9.3150, -70.6100, 'Valera')
  )
  UPDATE public.listings l
  SET
    city       = c.city_name,
    state      = 'Trujillo',
    latitude   = c.lat,
    longitude  = c.lng,
    location   = ST_SetSRID(ST_MakePoint(c.lng, c.lat), 4326)::GEOGRAPHY,
    updated_at = NOW()
  FROM numbered n
  JOIN coords c ON c.rn = n.rn
  WHERE l.id = n.id;
END $$;

-- PASO 3: Publicaciones de edicsonpepo → Trujillo capital
DO $$
DECLARE
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE email = 'edicsonpepo@gmail.com';

  IF v_uid IS NULL THEN
    RAISE NOTICE 'Usuario edicsonpepo no encontrado, saltando...';
    RETURN;
  END IF;

  WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
    FROM public.listings
    WHERE user_id = v_uid AND status != 'deleted'
  ),
  coords(rn, lat, lng, city_name) AS (
    VALUES
      (1,  9.3650, -70.4398, 'Trujillo'),
      (2,  9.3601, -70.4352, 'Trujillo'),
      (3,  9.3678, -70.4421, 'Trujillo'),
      (4,  9.3577, -70.4380, 'Trujillo'),
      (5,  9.3625, -70.4310, 'Trujillo'),
      (6,  9.3555, -70.4405, 'Trujillo'),
      (7,  9.3700, -70.4360, 'Trujillo'),
      (8,  9.3588, -70.4335, 'Trujillo'),
      (9,  9.3640, -70.4450, 'Trujillo'),
      (10, 9.3610, -70.4295, 'Trujillo')
  )
  UPDATE public.listings l
  SET
    city       = c.city_name,
    state      = 'Trujillo',
    latitude   = c.lat,
    longitude  = c.lng,
    location   = ST_SetSRID(ST_MakePoint(c.lng, c.lat), 4326)::GEOGRAPHY,
    updated_at = NOW()
  FROM numbered n
  JOIN coords c ON c.rn = n.rn
  WHERE l.id = n.id;
END $$;

-- PASO 4: Cualquier publicación restante sin coordenadas de Trujillo
UPDATE public.listings
SET
  city      = 'Valera',
  state     = 'Trujillo',
  latitude  = 9.3200 + (random() * 0.02 - 0.01),
  longitude = -70.6067 + (random() * 0.02 - 0.01),
  updated_at = NOW()
WHERE state IS DISTINCT FROM 'Trujillo'
  AND status != 'deleted';

UPDATE public.listings
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::GEOGRAPHY
WHERE state = 'Trujillo'
  AND location IS NULL
  AND latitude IS NOT NULL
  AND status != 'deleted';

-- Verificación
SELECT
  p.email,
  p.full_name,
  p.city     AS perfil_ciudad,
  p.state    AS perfil_estado,
  COUNT(l.id) AS total_publicaciones
FROM public.profiles p
LEFT JOIN public.listings l ON l.user_id = p.id AND l.status != 'deleted'
GROUP BY p.id, p.email, p.full_name, p.city, p.state
ORDER BY p.email;




-- ═══════════════════════════════════════════════════════════════
-- [013] SEED: Ropa + Electrodomésticos para poblar categorías
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_ncastaneda UUID;
  v_edicson    UUID;
  v_rhonny     UUID;
BEGIN
  SELECT id INTO v_ncastaneda FROM public.profiles WHERE email = 'ncastaneda30@gmail.com';
  SELECT id INTO v_edicson    FROM public.profiles WHERE email = 'edicsonpepo@gmail.com';
  SELECT id INTO v_rhonny     FROM public.profiles WHERE email = 'rhonnyjaimes1@gmail.com';

  -- ROPA — ncastaneda (Valera)
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_ncastaneda, 'good', 'clothing',
    'Chaqueta North Face Talla M — Como Nueva',
    'Chaqueta North Face Resolve 2 impermeable, talla M, color azul marino. Capucha ajustable, costuras selladas, bolsillos con cierre. Muy poco uso, sin manchas ni defectos. Ideal para temporada de lluvia en la montaña trujillana.',
    'like_new',
    'Zapatos deportivos talla 42, ropa deportiva, mochila o accesorios outdoor',
    ARRAY['chaqueta','north face','impermeable','ropa','outdoor','lluvia'],
    65,
    '[{"url":"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80&auto=format&fit=crop","order":0},{"url":"https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80&auto=format&fit=crop","order":1}]'::JSONB,
    'active', 9.3247, -70.6081,
    ST_SetSRID(ST_MakePoint(-70.6081, 9.3247), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":7,"waste_reduced_kg":1.2,"estimated_value_usd":65}'::JSONB,
    floor(random()*60+5)::INT, floor(random()*8+1)::INT
  );

  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_ncastaneda, 'good', 'clothing',
    'Ropa de Hombre Talla L — Lote de 8 piezas',
    'Lote de ropa masculina talla L en buen estado: 3 camisas de vestir, 2 pantalones casuales, 2 polos y 1 bermuda. Marcas variadas (Zara, H&M, imitaciones). Todo limpio y en buenas condiciones. Ideal para renovar el closet sin gastar.',
    'good',
    'Ropa de mujer talla S/M, zapatos, libros universitarios o artículos de cocina',
    ARRAY['ropa','hombre','lote','camisa','pantalon','casual','L'],
    40,
    '[{"url":"https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80&auto=format&fit=crop","order":0},{"url":"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80&auto=format&fit=crop","order":1}]'::JSONB,
    'active', 9.3199, -70.6054,
    ST_SetSRID(ST_MakePoint(-70.6054, 9.3199), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":6,"waste_reduced_kg":2,"estimated_value_usd":40}'::JSONB,
    floor(random()*45+5)::INT, floor(random()*6+1)::INT
  );

  -- ROPA — edicson (Trujillo capital)
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_edicson, 'good', 'clothing',
    'Vestidos de Mujer Talla S — 5 piezas',
    'Lote de 5 vestidos femeninos talla S: 2 de día casuales, 2 de noche elegantes y 1 playero. Colores variados, telas ligeras perfectas para el clima venezolano. Sin roturas ni manchas. Marcas locales e importadas.',
    'good',
    'Bolso de mujer, zapatos talla 36/37, accesorios o ropa de niño',
    ARRAY['vestido','mujer','ropa','talla S','femenino','casual','elegante'],
    45,
    '[{"url":"https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&q=80&auto=format&fit=crop","order":0},{"url":"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80&auto=format&fit=crop","order":1}]'::JSONB,
    'active', 9.3650, -70.4398,
    ST_SetSRID(ST_MakePoint(-70.4398, 9.3650), 4326)::GEOGRAPHY,
    'Trujillo', 'Trujillo',
    '{"co2_saved_kg":5,"waste_reduced_kg":1.5,"estimated_value_usd":45}'::JSONB,
    floor(random()*55+8)::INT, floor(random()*10+2)::INT
  );

  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_edicson, 'good', 'clothing',
    'Zapatillas Nike Air Max 270 — Talla 42',
    'Nike Air Max 270 originales, talla 42, color blanco/negro. Usadas 3 veces solamente. Sin desgaste en suela ni en material. Vienen con caja original. Son 100% originales, compradas en tienda oficial.',
    'like_new',
    'Zapatos de vestir talla 42, ropa deportiva, mancuernas o equipo de gym',
    ARRAY['nike','air max','zapatillas','zapatos','deportivo','original','talla 42'],
    95,
    '[{"url":"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop","order":0},{"url":"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80&auto=format&fit=crop","order":1},{"url":"https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80&auto=format&fit=crop","order":2}]'::JSONB,
    'active', 9.3601, -70.4352,
    ST_SetSRID(ST_MakePoint(-70.4352, 9.3601), 4326)::GEOGRAPHY,
    'Trujillo', 'Trujillo',
    '{"co2_saved_kg":8,"waste_reduced_kg":1,"estimated_value_usd":95}'::JSONB,
    floor(random()*80+10)::INT, floor(random()*14+3)::INT
  );

  -- ROPA — rhonny (Valera)
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_rhonny, 'good', 'clothing',
    'Ropa Deportiva Nike / Adidas — Talla M',
    'Lote de ropa deportiva talla M: 2 joggers (Nike y Adidas), 3 camisetas técnicas dry-fit y 2 medias de compresión. Perfecto para ir al gym o correr. Todo en excelente estado, usado pocas veces. Colores negro, gris y azul.',
    'good',
    'Suplementos proteicos, zapatillas deportivas, mancuernas o accesorios de gym',
    ARRAY['ropa deportiva','nike','adidas','gym','jogger','dry-fit','talla M'],
    55,
    '[{"url":"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80&auto=format&fit=crop","order":0},{"url":"https://images.unsplash.com/photo-1556906781-9a414e2a7735?w=800&q=80&auto=format&fit=crop","order":1}]'::JSONB,
    'active', 9.3278, -70.6112,
    ST_SetSRID(ST_MakePoint(-70.6112, 9.3278), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":6,"waste_reduced_kg":1.5,"estimated_value_usd":55}'::JSONB,
    floor(random()*50+5)::INT, floor(random()*8+1)::INT
  );

  -- ELECTRODOMÉSTICOS — ncastaneda: Lavadora
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_ncastaneda, 'good', 'electronics',
    'Lavadora Samsung 12kg — Carga Frontal',
    'Lavadora Samsung carga frontal 12kg, modelo WW12T. Tiene lavado rápido de 15 min, control de temperatura, centrifugado variable y función de vapor para higienizar. Funciona perfectamente, entrego en Valera con ayuda para cargarla.',
    'good',
    'Nevera pequeña, cocina de inducción, microondas o electrodomésticos de cocina',
    ARRAY['lavadora','samsung','electrodoméstico','carga frontal','12kg','hogar'],
    280,
    '[{"url":"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80&auto=format&fit=crop","order":0},{"url":"https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&q=80&auto=format&fit=crop","order":1}]'::JSONB,
    'active', 9.3165, -70.6033,
    ST_SetSRID(ST_MakePoint(-70.6033, 9.3165), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":35,"waste_reduced_kg":20,"estimated_value_usd":280}'::JSONB,
    floor(random()*70+10)::INT, floor(random()*9+2)::INT
  );

  -- ELECTRODOMÉSTICOS — edicson: Microondas
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_edicson, 'good', 'electronics',
    'Microondas LG 30L con Grill — Plateado',
    'Microondas LG 30 litros con función grill integrado, potencia 900W, 10 niveles de potencia, temporizador digital, función de descongelado automático. En perfecto estado, sin rayones internos. Incluye el plato giratorio original.',
    'good',
    'Licuadora potente, sandwichera, cafetera o cualquier electrodoméstico pequeño',
    ARRAY['microondas','LG','electrodoméstico','grill','cocina','hogar','30L'],
    75,
    '[{"url":"https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80&auto=format&fit=crop","order":0},{"url":"https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80&auto=format&fit=crop","order":1}]'::JSONB,
    'active', 9.3678, -70.4421,
    ST_SetSRID(ST_MakePoint(-70.4421, 9.3678), 4326)::GEOGRAPHY,
    'Trujillo', 'Trujillo',
    '{"co2_saved_kg":12,"waste_reduced_kg":5,"estimated_value_usd":75}'::JSONB,
    floor(random()*55+8)::INT, floor(random()*7+1)::INT
  );

  -- ELECTRODOMÉSTICOS — rhonny: Licuadora
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_rhonny, 'good', 'electronics',
    'Licuadora Oster Pro 1200W — Vaso de Vidrio',
    'Licuadora Oster Pro con motor 1200W, vaso de vidrio resistente al calor de 1.8L, 3 velocidades + pulso, cuchillas de acero inoxidable. Perfecta para smoothies, salsas y sopas calientes. En perfecto estado, como nueva.',
    'like_new',
    'Procesadora de alimentos, cafetera, sandwichera o utensilios de cocina',
    ARRAY['licuadora','oster','electrodoméstico','cocina','vidrio','1200W'],
    60,
    '[{"url":"https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80&auto=format&fit=crop","order":0},{"url":"https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80&auto=format&fit=crop","order":1}]'::JSONB,
    'active', 9.3228, -70.6145,
    ST_SetSRID(ST_MakePoint(-70.6145, 9.3228), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":10,"waste_reduced_kg":4,"estimated_value_usd":60}'::JSONB,
    floor(random()*50+5)::INT, floor(random()*8+1)::INT
  );

  -- ELECTRODOMÉSTICOS — ncastaneda: Plancha de vapor
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_ncastaneda, 'good', 'electronics',
    'Centro de Planchado Philips con Caldera de Vapor',
    'Centro de planchado Philips PerfectCare con caldera de vapor independiente, presión 6 bar, plancha sin calentamiento (vapor a temperatura fija), depósito de agua 1.5L. Mucho más rápido que una plancha convencional. En perfecto estado.',
    'like_new',
    'Aspiradora, lavadora pequeña, ropa o artículos de hogar',
    ARRAY['plancha','philips','vapor','electrodoméstico','hogar','ropa'],
    85,
    '[{"url":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop","order":0}]'::JSONB,
    'active', 9.3310, -70.6090,
    ST_SetSRID(ST_MakePoint(-70.6090, 9.3310), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":8,"waste_reduced_kg":3,"estimated_value_usd":85}'::JSONB,
    floor(random()*40+5)::INT, floor(random()*6+1)::INT
  );

  RAISE NOTICE 'Listo: 5 publicaciones de ropa + 4 electrodomésticos creados en Trujillo.';
END $$;

-- Verificar por categoría
SELECT
  category,
  COUNT(*) AS total,
  STRING_AGG(city, ', ' ORDER BY city) AS ciudades
FROM public.listings
WHERE status = 'active'
  AND category IN ('clothing', 'electronics')
GROUP BY category
ORDER BY category;




-- ═══════════════════════════════════════════════════════════════
-- [014] FIX: get_nearby_listings con is_favorited + user info
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_nearby_listings(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_km INTEGER DEFAULT 20,
  p_category TEXT DEFAULT NULL,
  p_listing_type TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 30,
  p_offset INTEGER DEFAULT 0,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID, user_id UUID, title TEXT, description TEXT,
  type TEXT, category TEXT, subcategory TEXT, condition TEXT,
  images JSONB, tags TEXT[], looking_for TEXT,
  estimated_value_usd NUMERIC, latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION, city TEXT, state TEXT,
  status TEXT, views_count INTEGER, favorites_count INTEGER,
  eco_impact JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION,
  user_full_name TEXT, user_avatar_url TEXT, user_eco_level TEXT,
  is_favorited BOOLEAN
) AS $$
DECLARE
  v_point GEOGRAPHY;
BEGIN
  v_point := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::GEOGRAPHY;

  RETURN QUERY
  SELECT
    l.id, l.user_id, l.title, l.description,
    l.type, l.category, l.subcategory, l.condition,
    l.images, l.tags, l.looking_for,
    l.estimated_value_usd, l.latitude, l.longitude,
    l.city, l.state, l.status, l.views_count, l.favorites_count,
    l.eco_impact, l.created_at, l.updated_at,
    ROUND((ST_Distance(l.location, v_point) / 1000.0)::NUMERIC, 2)::DOUBLE PRECISION AS distance_km,
    pr.full_name  AS user_full_name,
    pr.avatar_url AS user_avatar_url,
    pr.eco_level  AS user_eco_level,
    CASE
      WHEN p_user_id IS NOT NULL THEN
        EXISTS(
          SELECT 1 FROM public.favorites f
          WHERE f.listing_id = l.id AND f.user_id = p_user_id
        )
      ELSE FALSE
    END AS is_favorited
  FROM public.listings l
  LEFT JOIN public.profiles pr ON pr.id = l.user_id
  WHERE
    l.status = 'active'
    AND (l.location IS NULL OR ST_DWithin(l.location, v_point, p_radius_km * 1000))
    AND (p_category IS NULL OR l.category = p_category)
    AND (p_listing_type IS NULL OR l.type = p_listing_type)
    AND (
      p_search_query IS NULL
      OR l.search_vector @@ plainto_tsquery('spanish', unaccent(p_search_query))
      OR l.title ILIKE '%' || p_search_query || '%'
    )
  ORDER BY
    CASE WHEN l.location IS NOT NULL THEN ST_Distance(l.location, v_point) ELSE 999999999 END ASC,
    l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;




-- ═══════════════════════════════════════════════════════════════
-- [015] Función: contar mensajes sin leer (badge del chat)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_unread_message_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*)::INTEGER, 0)
  FROM public.messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  WHERE m.is_read = false
    AND m.sender_id != p_user_id
    AND (c.requester_id = p_user_id OR c.owner_id = p_user_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_unread_message_count(UUID) TO authenticated;




-- ═══════════════════════════════════════════════════════════════
-- [016] Agregar listing_id a conversations
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_listing_id
  ON public.conversations(listing_id)
  WHERE listing_id IS NOT NULL;
