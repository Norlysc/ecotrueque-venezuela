-- =======================================================
-- SEED: Ropa + Electrodomésticos para poblar categorías
-- Distribuido entre los 3 usuarios existentes
-- Pegar en Supabase Dashboard → SQL Editor → Run
-- =======================================================

DO $$
DECLARE
  v_ncastaneda UUID;
  v_edicson    UUID;
  v_rhonny     UUID;
BEGIN
  SELECT id INTO v_ncastaneda FROM public.profiles WHERE email = 'ncastaneda30@gmail.com';
  SELECT id INTO v_edicson    FROM public.profiles WHERE email = 'edicsonpepo@gmail.com';
  SELECT id INTO v_rhonny     FROM public.profiles WHERE email = 'rhonnyjaimes1@gmail.com';

  -- ==============================================
  -- ROPA — ncastaneda (Valera)
  -- ==============================================

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
    '[
      {"url":"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
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
    '[
      {"url":"https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    'active', 9.3199, -70.6054,
    ST_SetSRID(ST_MakePoint(-70.6054, 9.3199), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":6,"waste_reduced_kg":2,"estimated_value_usd":40}'::JSONB,
    floor(random()*45+5)::INT, floor(random()*6+1)::INT
  );

  -- ==============================================
  -- ROPA — edicson (Trujillo capital)
  -- ==============================================

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
    '[
      {"url":"https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
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
    '[
      {"url":"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    'active', 9.3601, -70.4352,
    ST_SetSRID(ST_MakePoint(-70.4352, 9.3601), 4326)::GEOGRAPHY,
    'Trujillo', 'Trujillo',
    '{"co2_saved_kg":8,"waste_reduced_kg":1,"estimated_value_usd":95}'::JSONB,
    floor(random()*80+10)::INT, floor(random()*14+3)::INT
  );

  -- ==============================================
  -- ROPA — rhonny (Valera)
  -- ==============================================

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
    '[
      {"url":"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1556906781-9a414e2a7735?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    'active', 9.3278, -70.6112,
    ST_SetSRID(ST_MakePoint(-70.6112, 9.3278), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":6,"waste_reduced_kg":1.5,"estimated_value_usd":55}'::JSONB,
    floor(random()*50+5)::INT, floor(random()*8+1)::INT
  );

  -- ==============================================
  -- ELECTRODOMÉSTICOS (category: electronics)
  -- Los electrodomésticos están bajo "Electrónica"
  -- ==============================================

  -- Lavadora — ncastaneda
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
    '[
      {"url":"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    'active', 9.3165, -70.6033,
    ST_SetSRID(ST_MakePoint(-70.6033, 9.3165), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":35,"waste_reduced_kg":20,"estimated_value_usd":280}'::JSONB,
    floor(random()*70+10)::INT, floor(random()*9+2)::INT
  );

  -- Microondas — edicson
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
    '[
      {"url":"https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    'active', 9.3678, -70.4421,
    ST_SetSRID(ST_MakePoint(-70.4421, 9.3678), 4326)::GEOGRAPHY,
    'Trujillo', 'Trujillo',
    '{"co2_saved_kg":12,"waste_reduced_kg":5,"estimated_value_usd":75}'::JSONB,
    floor(random()*55+8)::INT, floor(random()*7+1)::INT
  );

  -- Licuadora Oster — rhonny
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
    '[
      {"url":"https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    'active', 9.3228, -70.6145,
    ST_SetSRID(ST_MakePoint(-70.6145, 9.3228), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":10,"waste_reduced_kg":4,"estimated_value_usd":60}'::JSONB,
    floor(random()*50+5)::INT, floor(random()*8+1)::INT
  );

  -- Plancha de vapor — ncastaneda
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
    '[
      {"url":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop","order":0}
    ]'::JSONB,
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
