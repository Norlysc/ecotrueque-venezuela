-- ============================================
-- EcoTrueque Venezuela — Publicaciones para edicsonpepo@gmail.com
-- Fotos de Unsplash (URLs públicas estables)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

DO $$
DECLARE
  v_uid UUID;
BEGIN

  SELECT id INTO v_uid
  FROM public.profiles
  WHERE email = 'edicsonpepo@gmail.com'
  LIMIT 1;

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario edicsonpepo@gmail.com no encontrado en profiles.';
  END IF;

  RAISE NOTICE 'Insertando publicaciones para usuario %', v_uid;

  -- ════════════════════════════════════════════
  -- 1. Televisor Samsung 55" — Electrónica
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Televisor Samsung 55" 4K Smart TV — HDR10+',
    'Smart TV Samsung Crystal UHD 55 pulgadas 4K. Panel con tecnología Crystal Display, HDR10+, procesador Crystal 4K. Sistema operativo Tizen con acceso a Netflix, YouTube, Prime Video, Disney+. 3 puertos HDMI, 2 USB. Control remoto original incluido. Funciona perfectamente, lo cambio porque adquirí un proyector.',
    'good', 'electronics', 'Televisores', 'good',
    '[
      {"url":"https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    ARRAY['televisor','samsung','55 pulgadas','4k','smart tv','tizen','hdr'],
    'Proyector Full HD, sistema de sonido o computador de escritorio',
    380.00,
    10.4800, -66.8700,
    ST_SetSRID(ST_MakePoint(-66.8700, 10.4800), 4326)::GEOGRAPHY,
    'Caracas', 'Distrito Capital', 'active',
    '{"co2_saved_kg":18.0,"waste_reduced_kg":12.0,"estimated_value_usd":380}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 2. Consola PlayStation 4 — Electrónica
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'PlayStation 4 Slim 1TB + 2 controles + 8 juegos',
    'PS4 Slim 1TB en excelente estado. Incluye 2 controles DualShock 4 (uno negro original, uno azul compatible), cables HDMI y corriente, y 8 juegos físicos: FIFA 23, God of War, Spider-Man, Mortal Kombat 11, GTA V, Uncharted 4, The Last of Us Remastered y Horizon Zero Dawn. Sin rayones, funciona perfecto.',
    'good', 'electronics', 'Videojuegos', 'good',
    '[
      {"url":"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    ARRAY['playstation','ps4','consola','videojuegos','sony','slim','1tb'],
    'Nintendo Switch, Xbox Series S o laptop gaming',
    320.00,
    10.4800, -66.8700,
    ST_SetSRID(ST_MakePoint(-66.8700, 10.4800), 4326)::GEOGRAPHY,
    'Caracas', 'Distrito Capital', 'active',
    '{"co2_saved_kg":12.0,"waste_reduced_kg":3.5,"estimated_value_usd":320}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 3. Cámara fotográfica Canon — Electrónica
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Cámara Canon EOS Rebel T7 + lente 18-55mm + mochila',
    'Cámara réflex Canon EOS Rebel T7 (2000D) con lente kit 18-55mm IS II. Solo 3.200 disparos (prácticamente nueva). Incluye: batería original + cargador, memoria SD 32GB, mochila fotográfica Lowepro, filtro UV 58mm y parasol. Fotos nítidas, ideal para fotografía y vídeo HD. Perfecta para aprendizaje y uso profesional inicial.',
    'good', 'electronics', 'Fotografía', 'like_new',
    '[
      {"url":"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    ARRAY['canon','camara','dslr','reflex','t7','fotografía','rebel'],
    'Drone DJI, GoPro, lente Canon 50mm o tablet gráfica',
    350.00,
    10.4800, -66.8700,
    ST_SetSRID(ST_MakePoint(-66.8700, 10.4800), 4326)::GEOGRAPHY,
    'Caracas', 'Distrito Capital', 'active',
    '{"co2_saved_kg":10.0,"waste_reduced_kg":2.0,"estimated_value_usd":350}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 4. Nevera Samsung — Electrodomésticos
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Nevera Samsung No Frost 300 litros — 2 puertas',
    'Refrigerador Samsung de 300 litros, sistema No Frost (no acumula escarcha). Dos puertas, compartimiento congelador superior. Acabado plateado, sin abolladuras. Funciona excelente, enfría perfectamente. Tiene despachador de agua en puerta. Motivo de cambio: me mudé a un espacio más pequeño y necesito una nevera tipo bar.',
    'good', 'home', 'Electrodomésticos', 'good',
    '[
      {"url":"https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['nevera','refrigerador','samsung','no frost','300 litros','electrodoméstico'],
    'Lavadora, aire acondicionado split o cocina de inducción',
    280.00,
    10.4800, -66.8700,
    ST_SetSRID(ST_MakePoint(-66.8700, 10.4800), 4326)::GEOGRAPHY,
    'Caracas', 'Distrito Capital', 'active',
    '{"co2_saved_kg":25.0,"waste_reduced_kg":45.0,"estimated_value_usd":280}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 5. Tabla de surf — Deporte
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Tabla de surf Longboard 9''0" + leash + funda',
    'Longboard de surf 9 pies, ideal para olas pequeñas y medianas como las de Choroní o Higuerote. Fibra de vidrio, buen volumen para principiantes y riders de nivel medio. Incluye leash de 9 pies, quilla central de bambú, funda acolchada y parafina. Pequeño raspón en el rail derecho (estético, no afecta el surf).',
    'good', 'sports', 'Surf y agua', 'good',
    '[
      {"url":"https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1531722569936-825d4eaa6617?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['surf','tabla','longboard','playa','choroní','higuerote','olas'],
    'Kayak, equipo de snorkel, bicicleta o material de camping',
    180.00,
    10.4800, -66.8700,
    ST_SetSRID(ST_MakePoint(-66.8700, 10.4800), 4326)::GEOGRAPHY,
    'Caracas', 'Distrito Capital', 'active',
    '{"co2_saved_kg":8.0,"waste_reduced_kg":5.0,"estimated_value_usd":180}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 6. Escritorio gamer — Muebles
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Escritorio gamer en L 160×120cm con soporte monitor',
    'Escritorio en forma de L con superficie de 160×120 cm, color negro con detalles rojos. Incluye soporte doble para monitores ajustable en altura, bandeja deslizante para teclado y gestión de cables integrada. Estructura de acero muy resistente, tablero de MDF de 25mm. Requiere un poco de limpieza, en buen estado funcional.',
    'good', 'furniture', 'Oficina', 'good',
    '[
      {"url":"https://images.unsplash.com/photo-1593640408182-31c228c316e8?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['escritorio','gamer','en L','monitor','oficina','gaming','setup'],
    'Silla gamer, estante modular o sofá cama',
    160.00,
    10.4800, -66.8700,
    ST_SetSRID(ST_MakePoint(-66.8700, 10.4800), 4326)::GEOGRAPHY,
    'Caracas', 'Distrito Capital', 'active',
    '{"co2_saved_kg":15.0,"waste_reduced_kg":22.0,"estimated_value_usd":160}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 7. Colección cómics Marvel — Libros
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Colección 45 cómics Marvel — Spider-Man, X-Men, Avengers',
    'Colección de 45 cómics originales Marvel en buen estado: 18 Spider-Man (tomos del 2010-2018), 12 X-Men (incluyendo Age of Apocalypse), 10 Avengers (Civil War y Secret Invasion) y 5 ediciones especiales. Almacenados en bolsas y tablillas protectoras. Algunos tienen pequeñas marcas en portada pero el interior está impecable.',
    'good', 'books', 'Cómics', 'good',
    '[
      {"url":"https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['comics','marvel','spider-man','x-men','avengers','colección','historietas'],
    'Cómics DC, manga (One Piece, Naruto) o figuras de acción',
    75.00,
    10.4800, -66.8700,
    ST_SetSRID(ST_MakePoint(-66.8700, 10.4800), 4326)::GEOGRAPHY,
    'Caracas', 'Distrito Capital', 'active',
    '{"co2_saved_kg":2.0,"waste_reduced_kg":3.5,"estimated_value_usd":75}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 8. Taladro percutor Bosch — Herramientas
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Taladro percutor Bosch GSB 550W + maletín + brocas',
    'Taladro percutor Bosch GSB 550W con cable, en excelente estado. Potencia 550W, 2.800 rpm, mandril 13mm. Ideal para concreto, madera y metal. Incluye maletín original Bosch, set de 15 brocas HSS para metal, set de 8 brocas para concreto y 3 brocas para madera. Poco uso, prácticamente nuevo.',
    'good', 'tools', 'Herramientas eléctricas', 'like_new',
    '[
      {"url":"https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['taladro','bosch','percutor','550w','herramienta','eléctrica','brocas'],
    'Lijadora orbital, sierra circular o compresor de aire portátil',
    110.00,
    10.4800, -66.8700,
    ST_SetSRID(ST_MakePoint(-66.8700, 10.4800), 4326)::GEOGRAPHY,
    'Caracas', 'Distrito Capital', 'active',
    '{"co2_saved_kg":5.0,"waste_reduced_kg":4.0,"estimated_value_usd":110}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 9. Clases de diseño gráfico — Servicios
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Clases diseño gráfico Illustrator + Photoshop (12 horas)',
    'Ofrezco 12 horas de clases de diseño gráfico online: Adobe Illustrator (logos, vectores, identidad visual) y Photoshop (retoque, composición, efectos). Soy diseñador con 8 años de experiencia y portafolio verificable. Metodología práctica: cada clase incluye proyecto real. Certificado de participación al terminar. Horario flexible fines de semana.',
    'service', 'education', 'Diseño', NULL,
    '[
      {"url":"https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    ARRAY['diseño','gráfico','illustrator','photoshop','adobe','clases','online','logo'],
    'Clases de programación, marketing digital o edición de video',
    60.00,
    10.4800, -66.8700,
    ST_SetSRID(ST_MakePoint(-66.8700, 10.4800), 4326)::GEOGRAPHY,
    'Caracas', 'Distrito Capital', 'active',
    '{"co2_saved_kg":0.0,"waste_reduced_kg":0.0,"estimated_value_usd":60}'::JSONB
  );

  -- ════════════════════════════════════════════
  -- 10. Kit acuario tropical — Mascotas
  -- ════════════════════════════════════════════
  INSERT INTO public.listings (
    user_id, title, description, type, category, subcategory, condition,
    images, tags, looking_for, estimated_value_usd,
    latitude, longitude, location, city, state, status, eco_impact
  ) VALUES (
    v_uid,
    'Acuario tropical 120L completo — peces, plantas y equipo',
    'Acuario de 120 litros completo con todo para empezar: pecera de vidrio 80×40×40cm, filtro Fluval 207 externo, calentador 200W Aquatech, iluminación LED espectro completo, sustrato volcánico Aqua Soil. Incluye 12 peces tropicales (tetras neon, corydoras, platy), 8 plantas naturales vivas y decoración de madera roca. Se entrega con agua acondicionada.',
    'good', 'pets', 'Acuarios', 'good',
    '[
      {"url":"https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    ARRAY['acuario','peces','tropical','120 litros','fluval','plantas acuáticas','neon'],
    'Terrario de reptiles, jaula para aves o kit de jardinería',
    220.00,
    10.4800, -66.8700,
    ST_SetSRID(ST_MakePoint(-66.8700, 10.4800), 4326)::GEOGRAPHY,
    'Caracas', 'Distrito Capital', 'active',
    '{"co2_saved_kg":3.0,"waste_reduced_kg":8.0,"estimated_value_usd":220}'::JSONB
  );

  RAISE NOTICE '10 publicaciones creadas para edicsonpepo@gmail.com (user_id: %)', v_uid;

END $$;
