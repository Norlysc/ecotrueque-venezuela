-- ============================================
-- EcoTrueque Venezuela — Publicaciones reales para ncastaneda30@gmail.com
-- Fotos de Unsplash (URLs públicas estables)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

DO $$
DECLARE
  v_uid UUID;
BEGIN

  SELECT id INTO v_uid
  FROM public.profiles
  WHERE email = 'ncastaneda30@gmail.com'
  LIMIT 1;

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario ncastaneda30@gmail.com no encontrado en profiles.';
  END IF;

  RAISE NOTICE 'Insertando publicaciones para usuario %', v_uid;

  -- ════════════════════════════════════════════
  -- 1. Laptop Dell — Electrónica
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Laptop Dell Inspiron Core i5 — 8GB RAM, SSD 256GB',
    'Portátil Dell Inspiron 15 en excelente estado. Procesador Intel Core i5 décima generación, 8 GB RAM DDR4, disco SSD 256 GB (arranque rápido). Pantalla 15.6" Full HD antirreflejo. Batería dura aprox. 4 horas. Incluye cargador original y maletín acolchado. Sin golpes ni rayaduras. Solo la cambio por algo más compacto o un smartphone reciente.',
    'good', 'electronics', 'Computadoras', 'good',
    '[
      {"url":"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    ARRAY['laptop','dell','computadora','core i5','ssd','portátil'],
    'Smartphone Android (Samsung, Xiaomi) o tablet con teclado',
    185.00,
    7.7800, -72.2200,
    ST_SetSRID(ST_MakePoint(-72.2200, 7.7800), 4326)::GEOGRAPHY,
    'San Cristóbal', 'Táchira', 'active',
    '{"co2_saved_kg":15.0,"waste_reduced_kg":2.5,"estimated_value_usd":185}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 2. iPhone 13 — Electrónica
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'iPhone 13 128GB Medianoche — batería 91%',
    'iPhone 13 color Medianoche (negro) 128 GB. Estado impecable, sin rayones. Batería al 91% de capacidad (verificable en Ajustes). Incluye: caja original, cable USB-C Lightning, funda transparente Apple y dos protectores de pantalla de repuesto. Liberado para cualquier operadora. No incluye cargador de pared.',
    'good', 'electronics', 'Teléfonos', 'like_new',
    '[
      {"url":"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    ARRAY['iphone','apple','celular','smartphone','ios','13'],
    'MacBook Air M1/M2, iPad o cámara mirrorless Sony/Fuji',
    420.00,
    7.7800, -72.2200,
    ST_SetSRID(ST_MakePoint(-72.2200, 7.7800), 4326)::GEOGRAPHY,
    'San Cristóbal', 'Táchira', 'active',
    '{"co2_saved_kg":15.0,"waste_reduced_kg":2.0,"estimated_value_usd":420}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 3. Bicicleta MTB — Vehículos
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Bicicleta de montaña Shimano 21 velocidades — Aro 26',
    'Bicicleta Mountain Bike en buen estado. Cambios Shimano de 21 velocidades que funcionan a la perfección. Frenos de disco mecánicos delantero y trasero. Neumáticos todo terreno con buen relieve. El marco es de aluminio ligero. Lista para rodar, solo requiere un lavado. Ideal para rutas de montaña en Táchira.',
    'good', 'vehicles', 'Bicicletas', 'good',
    '[
      {"url":"https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['bicicleta','mtb','shimano','montaña','ciclismo','aro 26'],
    'Herramientas eléctricas, cafetera o electrométrico del hogar',
    120.00,
    7.7800, -72.2200,
    ST_SetSRID(ST_MakePoint(-72.2200, 7.7800), 4326)::GEOGRAPHY,
    'San Cristóbal', 'Táchira', 'active',
    '{"co2_saved_kg":10.0,"waste_reduced_kg":4.0,"estimated_value_usd":120}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 4. Guitarra acústica — Arte
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Guitarra acústica Yamaha F310 con funda y accesorios',
    'Guitarra acústica Yamaha F310 en perfecto estado de funcionamiento. Tapa de abeto, aros y fondo de meranti, mástil de nato. Sonido cálido y equilibrado, ideal para principiantes y nivel medio. Cuerdas nuevas instaladas hace 1 mes. Incluye: funda acolchada Yamaha original, cejilla, afinador clip y 5 púas de diferentes grosores.',
    'good', 'art', 'Música', 'like_new',
    '[
      {"url":"https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    ARRAY['guitarra','yamaha','acústica','música','f310','cuerdas'],
    'Teclado MIDI, ukelele, violín o cursos de fotografía',
    130.00,
    7.7800, -72.2200,
    ST_SetSRID(ST_MakePoint(-72.2200, 7.7800), 4326)::GEOGRAPHY,
    'San Cristóbal', 'Táchira', 'active',
    '{"co2_saved_kg":3.0,"waste_reduced_kg":1.5,"estimated_value_usd":130}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 5. Sillón reclinable — Muebles
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Sofá reclinable 3 puestos — tela microfibra beige',
    'Sofá reclinable de 3 puestos en tela microfibra color beige/crema. Estructura metálica interna muy resistente. Los 3 puestos reclinan de forma independiente. Cojines con relleno de espuma de alta densidad. Pequeña mancha en el brazo izquierdo (visible en fotos, sale con limpiador). Dimensiones: 2.20 m largo × 0.95 m profundidad.',
    'good', 'furniture', 'Sala', 'fair',
    '[
      {"url":"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['sofá','sillón','mueble','sala','reclinable','3 puestos','microfibra'],
    'Nevera, lavadora, televisor o comedor pequeño',
    200.00,
    7.7800, -72.2200,
    ST_SetSRID(ST_MakePoint(-72.2200, 7.7800), 4326)::GEOGRAPHY,
    'San Cristóbal', 'Táchira', 'active',
    '{"co2_saved_kg":20.0,"waste_reduced_kg":30.0,"estimated_value_usd":200}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 6. Kit herramientas — Herramientas
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Set herramientas Stanley 99 piezas con maletín rígido',
    'Juego completo de herramientas Stanley 99 piezas en maletín rígido con espuma de protección. Incluye: destornilladores planos y Phillips (10 tamaños), llaves allen métricas e imperiales, alicates de corte y punta, martillo 500g, cinta métrica 5m, nivel de burbuja, brocas HSS (15 piezas). Todo original y en perfecto estado, poco uso.',
    'good', 'tools', 'Herramientas manuales', 'like_new',
    '[
      {"url":"https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['herramientas','stanley','set','maletín','bricolaje','99 piezas'],
    'Taladro eléctrico, amoladora o compresor de aire',
    95.00,
    7.7800, -72.2200,
    ST_SetSRID(ST_MakePoint(-72.2200, 7.7800), 4326)::GEOGRAPHY,
    'San Cristóbal', 'Táchira', 'active',
    '{"co2_saved_kg":5.0,"waste_reduced_kg":6.0,"estimated_value_usd":95}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 7. Libros universitarios — Libros
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Lote 12 libros universitarios — Administración y Economía',
    'Vendo lote de 12 libros universitarios de Administración y Economía: Principios de Economía (Mankiw), Administración (Robbins/Coulter), Contabilidad Financiera (Horngren), Estadística para Negocios (Berenson) y más. Todos en buen estado con marcas de subrayado. Incluye 2 diccionarios de términos económicos.',
    'good', 'books', 'Libros universitarios', 'good',
    '[
      {"url":"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['libros','universidad','economía','administración','contabilidad','mankiw'],
    'Libros de ingeniería, medicina, idiomas o informática',
    50.00,
    7.7800, -72.2200,
    ST_SetSRID(ST_MakePoint(-72.2200, 7.7800), 4326)::GEOGRAPHY,
    'San Cristóbal', 'Táchira', 'active',
    '{"co2_saved_kg":2.0,"waste_reduced_kg":5.0,"estimated_value_usd":50}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 8. Ropa deportiva — Ropa
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Ropa deportiva Nike & Adidas — Talla M (8 prendas)',
    'Lote de 8 prendas deportivas originales en buen estado: 3 camisetas Nike DryFit talla M (azul, negra y gris), 2 shorts Adidas ClimaLite talla M, 1 sudadera Nike Tech Fleece talla M color carbón, 2 pares de medias técnicas Adidas. Todas lavadas y en perfecto estado para usar. Se venden juntas.',
    'good', 'clothing', 'Ropa deportiva', 'good',
    '[
      {"url":"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['ropa','nike','adidas','deportiva','gym','talla M','running','sudadera'],
    'Calzado deportivo talla 41-42 o morral deportivo',
    55.00,
    7.7800, -72.2200,
    ST_SetSRID(ST_MakePoint(-72.2200, 7.7800), 4326)::GEOGRAPHY,
    'San Cristóbal', 'Táchira', 'active',
    '{"co2_saved_kg":6.0,"waste_reduced_kg":2.0,"estimated_value_usd":55}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 9. Clases de inglés — Servicios
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Clases de inglés online — Niveles A1 a B2 (10 sesiones)',
    'Ofrezco 10 clases de inglés personalizadas de 1 hora cada una. Soy docente certificado con 6 años de experiencia enseñando a adultos. Metodología conversacional + gramática aplicada. Especialidad: inglés para negocios, entrevistas de trabajo y preparación TOEFL. Modalidad 100% online (Zoom/Meet). Horario flexible mañana y noche.',
    'service', 'education', 'Idiomas', NULL,
    '[
      {"url":"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['inglés','clases','idioma','TOEFL','online','virtual','negocios','docente'],
    'Clases de diseño gráfico, programación, matemáticas o fotografía',
    40.00,
    7.7800, -72.2200,
    ST_SetSRID(ST_MakePoint(-72.2200, 7.7800), 4326)::GEOGRAPHY,
    'San Cristóbal', 'Táchira', 'active',
    '{"co2_saved_kg":0.0,"waste_reduced_kg":0.0,"estimated_value_usd":40}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 10. Plantas medicinales — Salud/Otros
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Plantas medicinales: Sábila, Menta, Romero y Ruda (con macetas)',
    'Ofrezco 4 plantas medicinales cultivadas orgánicamente en casa, sin pesticidas ni químicos. Sábila (Aloe Vera) grande con más de 20 pencas, Menta muy frondosa, Romero aromático (ideal para cocina) y Ruda. Cada una en su maceta de barro. Perfectas para remedios naturales, cocina o decoración de balcón.',
    'good', 'health', 'Plantas medicinales', 'new',
    '[
      {"url":"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    ARRAY['plantas','medicinales','sábila','menta','romero','ruda','orgánico','macetas'],
    'Semillas criollas, abono orgánico, tierra de jardín o más plantas',
    15.00,
    7.7800, -72.2200,
    ST_SetSRID(ST_MakePoint(-72.2200, 7.7800), 4326)::GEOGRAPHY,
    'San Cristóbal', 'Táchira', 'active',
    '{"co2_saved_kg":1.0,"waste_reduced_kg":0.5,"estimated_value_usd":15}'::JSONB
  );

  RAISE NOTICE '✅ 10 publicaciones creadas para ncastaneda30@gmail.com (user_id: %)', v_uid;

END $$;
