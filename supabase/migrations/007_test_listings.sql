-- ============================================
-- EcoTrueque Venezuela — Publicaciones de prueba
-- 10 listados variados en Caracas
-- REQUISITO: Ejecutar DESPUÉS de registrar al menos un usuario.
-- IDEMPOTENTE: Solo inserta si no existen listados de prueba.
-- ============================================

DO $$
DECLARE
  v_user_id   UUID;
  v_user2_id  UUID;
  v_user3_id  UUID;
BEGIN

  -- Obtener usuarios existentes en profiles (ordenados por fecha de creación)
  SELECT id INTO v_user_id  FROM public.profiles ORDER BY created_at ASC  LIMIT 1;
  SELECT id INTO v_user2_id FROM public.profiles ORDER BY created_at ASC  LIMIT 1 OFFSET 1;
  SELECT id INTO v_user3_id FROM public.profiles ORDER BY created_at ASC  LIMIT 1 OFFSET 2;

  -- Si no hay ningún usuario, abortar con mensaje claro
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios en public.profiles. Registra al menos un usuario en la app primero.';
  END IF;

  -- Si solo hay 1 usuario, usar el mismo para todos los listados
  IF v_user2_id IS NULL THEN v_user2_id := v_user_id; END IF;
  IF v_user3_id IS NULL THEN v_user3_id := v_user_id; END IF;

  -- Solo insertar si no existen ya listados de prueba (idempotente)
  IF EXISTS (SELECT 1 FROM public.listings WHERE title = 'Laptop Dell Inspiron 15 3000') THEN
    RAISE NOTICE 'Las publicaciones de prueba ya existen. No se insertaron duplicados.';
    RETURN;
  END IF;

  -- ================================================
  -- 10 publicaciones variadas en Caracas
  -- ================================================
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory,
    condition, images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location,
    city, state, status, views_count, favorites_count, eco_impact
  ) VALUES

  -- 1. ELECTRÓNICA — Laptop (Chacao)
  (
    v_user_id,
    'Laptop Dell Inspiron 15 3000',
    'Laptop en excelente estado, procesador Intel Core i5 10ma generación, 8GB RAM, SSD 256GB. Funciona perfectamente, incluye maletín original y cargador. Solo quiero cambiarla por algo más compacto.',
    'good', 'electronics', 'Computadoras',
    'good',
    '[{"url":"https://picsum.photos/seed/laptop-eco1/400/300","order":0},{"url":"https://picsum.photos/seed/laptop-eco2/400/300","order":1}]'::JSONB,
    ARRAY['laptop','dell','computadora','intel','ssd','i5'],
    'Smartphone Android reciente o tablet',
    280.00,
    10.4938, -66.8524,
    ST_SetSRID(ST_MakePoint(-66.8524, 10.4938), 4326)::GEOGRAPHY,
    'Chacao', 'Distrito Capital', 'active', 12, 3,
    '{"co2_saved_kg":15,"waste_reduced_kg":2,"estimated_value_usd":280,"eco_points":79}'::JSONB
  ),

  -- 2. DEPORTES — Bicicleta (Altamira)
  (
    v_user2_id,
    'Bicicleta Trek Marlin 5 Mountain Bike 29"',
    'Bicicleta de montaña Trek talla M, poco uso. Frenos hidráulicos Shimano, ruedas 29 pulgadas, 21 velocidades. Ideal para ciclismo urbano o senderos. Incluye candado y luces LED recargables.',
    'good', 'sports', 'Ciclismo',
    'like_new',
    '[{"url":"https://picsum.photos/seed/bike-eco1/400/300","order":0},{"url":"https://picsum.photos/seed/bike-eco2/400/300","order":1}]'::JSONB,
    ARRAY['bicicleta','trek','mountain bike','ciclismo','deporte','shimano'],
    'Equipo de fotografía, dron o kayak',
    350.00,
    10.4950, -66.8473,
    ST_SetSRID(ST_MakePoint(-66.8473, 10.4950), 4326)::GEOGRAPHY,
    'Altamira', 'Distrito Capital', 'active', 25, 8,
    '{"co2_saved_kg":12,"waste_reduced_kg":3,"estimated_value_usd":350,"eco_points":69}'::JSONB
  ),

  -- 3. LIBROS — Ingeniería (La Candelaria)
  (
    v_user3_id,
    'Colección libros Ingeniería Civil (15 tomos)',
    'Libros universitarios de ingeniería civil: Estructuras, Hidráulica, Concreto Armado, Topografía, Geotecnia y más. Autores: Cengel, McCormac, Nilson. Buen estado, subrayados leves.',
    'good', 'books', 'Libros universitarios',
    'good',
    '[{"url":"https://picsum.photos/seed/books-eco1/400/300","order":0},{"url":"https://picsum.photos/seed/books-eco2/400/300","order":1}]'::JSONB,
    ARRAY['libros','ingeniería','universidad','civil','estructuras','hidráulica'],
    'Libros de medicina, computación o idiomas',
    45.00,
    10.5020, -66.9148,
    ST_SetSRID(ST_MakePoint(-66.9148, 10.5020), 4326)::GEOGRAPHY,
    'La Candelaria', 'Distrito Capital', 'active', 7, 2,
    '{"co2_saved_kg":2,"waste_reduced_kg":0.5,"estimated_value_usd":45,"eco_points":11}'::JSONB
  ),

  -- 4. MUEBLES — Silla ergonómica (Las Mercedes)
  (
    v_user2_id,
    'Silla ergonómica de oficina con soporte lumbar ajustable',
    'Silla ejecutiva con soporte lumbar ajustable, reposabrazos 3D, altura regulable, tela transpirable color gris. Comprada hace 1 año, uso mínimo. En perfectas condiciones.',
    'good', 'furniture', 'Oficina',
    'like_new',
    '[{"url":"https://picsum.photos/seed/chair-eco1/400/300","order":0},{"url":"https://picsum.photos/seed/chair-eco2/400/300","order":1}]'::JSONB,
    ARRAY['silla','ergonómica','oficina','lumbar','trabajo','home office'],
    'Escritorio, estantería o monitor',
    120.00,
    10.4768, -66.8552,
    ST_SetSRID(ST_MakePoint(-66.8552, 10.4768), 4326)::GEOGRAPHY,
    'Las Mercedes', 'Distrito Capital', 'active', 18, 5,
    '{"co2_saved_kg":25,"waste_reduced_kg":8,"estimated_value_usd":120,"eco_points":149}'::JSONB
  ),

  -- 5. SERVICIOS — Clases de inglés (Baruta)
  (
    v_user3_id,
    'Clases de inglés nivel B2-C1 (10 sesiones)',
    'Ofrezco 10 clases de inglés de 1 hora c/u. Nivel intermedio-avanzado (B2/C1), metodología conversacional. Especialidad en inglés de negocios y preparación TOEFL/IELTS. Modalidad presencial en Baruta o virtual.',
    'service', 'services', 'Clases particulares',
    NULL,
    '[{"url":"https://picsum.photos/seed/english-eco1/400/300","order":0}]'::JSONB,
    ARRAY['inglés','clases','idioma','TOEFL','IELTS','virtual','presencial','business english'],
    'Clases de programación, diseño gráfico o corte y costura',
    80.00,
    10.4321, -66.8832,
    ST_SetSRID(ST_MakePoint(-66.8832, 10.4321), 4326)::GEOGRAPHY,
    'Baruta', 'Miranda', 'active', 31, 9,
    '{"co2_saved_kg":0,"waste_reduced_kg":0,"estimated_value_usd":80,"eco_points":20}'::JSONB
  ),

  -- 6. JUGUETES — LEGO Technic (El Hatillo)
  (
    v_user_id,
    'LEGO Technic 42083 Bugatti Chiron (3599 piezas, completo)',
    'Set LEGO Technic #42083 Bugatti Chiron completo. 3599 piezas, armado una sola vez con mucho cuidado. Todas las piezas intactas, instrucciones originales y caja incluidas. Ideal para coleccionista.',
    'good', 'toys', 'Juguetes educativos',
    'like_new',
    '[{"url":"https://picsum.photos/seed/lego-eco1/400/300","order":0},{"url":"https://picsum.photos/seed/lego-eco2/400/300","order":1}]'::JSONB,
    ARRAY['lego','technic','coleccionable','bugatti','juguete','armable'],
    'Otro set LEGO Technic o Creator o juego de mesa estratégico',
    180.00,
    10.3971, -66.8286,
    ST_SetSRID(ST_MakePoint(-66.8286, 10.3971), 4326)::GEOGRAPHY,
    'El Hatillo', 'Miranda', 'active', 44, 12,
    '{"co2_saved_kg":1.5,"waste_reduced_kg":0.5,"estimated_value_usd":180,"eco_points":10}'::JSONB
  ),

  -- 7. ROPA — Deportiva Nike/Adidas (Chacaíto)
  (
    v_user2_id,
    'Lote ropa deportiva Nike y Adidas — Talla M (8 prendas)',
    'Lote de 8 prendas deportivas: 3 camisetas Nike DryFit, 2 shorts Adidas ClimaLite, 1 sudadera Nike Tech Fleece, 2 medias técnicas Adidas. Talla M. Usadas en buen estado, lavadas.',
    'good', 'clothing', 'Ropa deportiva',
    'good',
    '[{"url":"https://picsum.photos/seed/sport-eco1/400/300","order":0},{"url":"https://picsum.photos/seed/sport-eco2/400/300","order":1}]'::JSONB,
    ARRAY['ropa','nike','adidas','deportiva','talla-m','gym','running'],
    'Calzado deportivo talla 42 o equipaje deportivo',
    55.00,
    10.4879, -66.8639,
    ST_SetSRID(ST_MakePoint(-66.8639, 10.4879), 4326)::GEOGRAPHY,
    'Chacaíto', 'Distrito Capital', 'active', 19, 6,
    '{"co2_saved_kg":8,"waste_reduced_kg":1.5,"estimated_value_usd":55,"eco_points":44}'::JSONB
  ),

  -- 8. PLANTAS — Medicinales (Petare)
  (
    v_user3_id,
    'Plantas medicinales venezolanas (10 variedades con macetas)',
    'Ofrezco 10 plantas medicinales cultivadas en casa sin pesticidas: manzanilla, sábila, hierbabuena, albahaca, ruda, toronjil, melisa, romero, tomillo y paico. Incluye macetas de barro.',
    'good', 'other', 'Plantas',
    'new',
    '[{"url":"https://picsum.photos/seed/plants-eco1/400/300","order":0},{"url":"https://picsum.photos/seed/plants-eco2/400/300","order":1}]'::JSONB,
    ARRAY['plantas','medicinales','orgánico','sábila','romero','jardín','herbolaria'],
    'Semillas criollas, tierra compost o herramientas de jardinería',
    25.00,
    10.4872, -66.7951,
    ST_SetSRID(ST_MakePoint(-66.7951, 10.4872), 4326)::GEOGRAPHY,
    'Petare', 'Miranda', 'active', 8, 4,
    '{"co2_saved_kg":5,"waste_reduced_kg":1,"estimated_value_usd":25,"eco_points":31}'::JSONB
  ),

  -- 9. ELECTRÓNICA — iPhone (La California)
  (
    v_user_id,
    'iPhone 12 Pro 128GB Azul Pacífico — como nuevo',
    'iPhone 12 Pro 128GB color Azul Pacífico en estado impecable. Batería al 89%, incluye cargador original MagSafe (20W), funda Apple silicona azul y protector de pantalla vidrio templado. Sin golpes.',
    'good', 'electronics', 'Teléfonos',
    'like_new',
    '[{"url":"https://picsum.photos/seed/iphone-eco1/400/300","order":0},{"url":"https://picsum.photos/seed/iphone-eco2/400/300","order":1},{"url":"https://picsum.photos/seed/iphone-eco3/400/300","order":2}]'::JSONB,
    ARRAY['iphone','apple','smartphone','12pro','celular','ios'],
    'MacBook Air, iPad Pro o cámara Sony mirrorless',
    400.00,
    10.4974, -66.8395,
    ST_SetSRID(ST_MakePoint(-66.8395, 10.4974), 4326)::GEOGRAPHY,
    'La California', 'Distrito Capital', 'active', 67, 21,
    '{"co2_saved_kg":15,"waste_reduced_kg":2,"estimated_value_usd":400,"eco_points":79}'::JSONB
  ),

  -- 10. HERRAMIENTAS — Set Stanley (El Paraíso)
  (
    v_user2_id,
    'Set completo de herramientas Stanley 99 piezas con maletín',
    'Set de herramientas Stanley 99 piezas en maletín original con espuma de protección: destornilladores planos y de estrella, llaves allen, alicates, martillo, cinta métrica 5m, nivel, brocas HSS. Completo.',
    'good', 'tools', 'Herramientas manuales',
    'good',
    '[{"url":"https://picsum.photos/seed/tools-eco1/400/300","order":0},{"url":"https://picsum.photos/seed/tools-eco2/400/300","order":1}]'::JSONB,
    ARRAY['herramientas','stanley','set','maletín','bricolaje','reparaciones'],
    'Taladro eléctrico, compresor o sierra circular',
    95.00,
    10.5049, -66.9286,
    ST_SetSRID(ST_MakePoint(-66.9286, 10.5049), 4326)::GEOGRAPHY,
    'El Paraíso', 'Distrito Capital', 'active', 15, 5,
    '{"co2_saved_kg":10,"waste_reduced_kg":3,"estimated_value_usd":95,"eco_points":59}'::JSONB
  );

  RAISE NOTICE '✅ 10 publicaciones de prueba insertadas correctamente.';
  RAISE NOTICE '   Usuario principal (%) tiene % listados activos.',
    v_user_id,
    (SELECT COUNT(*) FROM public.listings WHERE user_id = v_user_id AND status = 'active');

END $$;
