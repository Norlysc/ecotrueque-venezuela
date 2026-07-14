-- =======================================================
-- Publicaciones para: rhonnyjaimes1@gmail.com
-- Ciudad: Valera, Estado Trujillo
-- 6 bienes + 4 servicios = 10 publicaciones
-- Pegar en Supabase Dashboard → SQL Editor → Run
-- =======================================================

DO $$
DECLARE
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE email = 'rhonnyjaimes1@gmail.com';

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario rhonnyjaimes1@gmail.com no encontrado. Asegúrate de que esté registrado.';
  END IF;

  -- Actualizar perfil a Valera, Trujillo
  UPDATE public.profiles
  SET city = 'Valera', state = 'Trujillo', updated_at = NOW()
  WHERE id = v_uid;

  -- -------------------------------------------------------
  -- 1. BIEN | Bicicleta de Montaña Trek Marlin 5
  -- -------------------------------------------------------
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_uid, 'good', 'sports',
    'Bicicleta de Montaña Trek Marlin 5 - 2021',
    'Bicicleta Trek Marlin 5 año 2021, talla M, color negro mate. Cambios Shimano 8 velocidades, frenos de disco hidráulicos, horquilla de suspensión RockShox. En excelentes condiciones, poco uso, siempre guardada bajo techo. Incluye casco y luces LED. Ideal para rutas de montaña o para ir al trabajo.',
    'good',
    'Laptop en buen estado, cámara digital, equipo de audio, electrónica en general',
    ARRAY['bicicleta','trek','MTB','montaña','shimano','ciclismo'],
    380,
    '[
      {"url":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1576435728678-68d0fbf94946?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    'active',
    9.3247, -70.6081,
    ST_SetSRID(ST_MakePoint(-70.6081, 9.3247), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":18,"waste_reduced_kg":5,"estimated_value_usd":380}'::JSONB,
    floor(random()*80+10)::INT, floor(random()*12+1)::INT
  );

  -- -------------------------------------------------------
  -- 2. BIEN | Silla Gamer RGB Gaming Chair
  -- -------------------------------------------------------
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_uid, 'good', 'furniture',
    'Silla Gamer RGB Reclinable - Gaming Chair',
    'Silla gamer profesional con soporte lumbar y de cuello incluidos. Respaldo reclinable hasta 160°, reposabrazos 4D ajustables, base de metal con ruedas de silicona. Tapizado en cuero PU negro con costuras rojas. Perfecta para largas horas de gaming o trabajo frente al computador. Sin defectos, como nueva.',
    'like_new',
    'Monitor gaming 144Hz, teclado mecánico, GPU o accesorios para PC',
    ARRAY['silla','gamer','gaming','RGB','oficina','escritorio'],
    180,
    '[
      {"url":"https://images.unsplash.com/photo-1616627451515-cbc80e5ece6e?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    'active',
    9.3199, -70.6054,
    ST_SetSRID(ST_MakePoint(-70.6054, 9.3199), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":22,"waste_reduced_kg":8,"estimated_value_usd":180}'::JSONB,
    floor(random()*60+5)::INT, floor(random()*10+1)::INT
  );

  -- -------------------------------------------------------
  -- 3. BIEN | Tablet Samsung Galaxy Tab A8
  -- -------------------------------------------------------
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_uid, 'good', 'electronics',
    'Tablet Samsung Galaxy Tab A8 64GB WiFi',
    'Samsung Galaxy Tab A8, pantalla de 10.5 pulgadas Full HD, 64GB almacenamiento interno, 4GB RAM, batería de 7040mAh, Android 12. Viene con funda protectora original y vidrio templado instalado. Perfecta para estudiar, ver contenido o trabajar. Sin rayones ni golpes, funciona al 100%.',
    'like_new',
    'Teléfono gama media-alta, auriculares Bluetooth, smartwatch o efectivo equivalente en artículos',
    ARRAY['tablet','samsung','galaxy','android','pantalla','estudio'],
    160,
    '[
      {"url":"https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    'active',
    9.3278, -70.6112,
    ST_SetSRID(ST_MakePoint(-70.6112, 9.3278), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":14,"waste_reduced_kg":2,"estimated_value_usd":160}'::JSONB,
    floor(random()*100+20)::INT, floor(random()*15+2)::INT
  );

  -- -------------------------------------------------------
  -- 4. BIEN | Set de Mancuernas Ajustables 20kg
  -- -------------------------------------------------------
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_uid, 'good', 'sports',
    'Set de Mancuernas Ajustables 20kg c/u + Banco',
    'Par de mancuernas ajustables de 2 a 20kg cada una, con discos de hierro fundido y tuercas de mariposa. Incluye banco plegable multiposición (plano, inclinado, declinado) con soporte de cuero acolchado. Todo en perfecto estado. Ideal para armar tu gym en casa sin gastar más.',
    'good',
    'Ropa deportiva talla M/L, zapatillas para gym, suplementos o barras de ejercicio',
    ARRAY['mancuernas','pesas','gym','ejercicio','fitness','banco','musculación'],
    140,
    '[
      {"url":"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    'active',
    9.3165, -70.6033,
    ST_SetSRID(ST_MakePoint(-70.6033, 9.3165), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":20,"waste_reduced_kg":12,"estimated_value_usd":140}'::JSONB,
    floor(random()*70+10)::INT, floor(random()*8+1)::INT
  );

  -- -------------------------------------------------------
  -- 5. BIEN | Guitarra Criolla Profesional
  -- -------------------------------------------------------
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_uid, 'good', 'art',
    'Guitarra Criolla Profesional + Estuche Rígido',
    'Guitarra clásica de cuerdas de nylon, cuerpo de cedro macizo, diapasón de ébano, cejuela de hueso. Sonido cálido y proyección excelente, afinación estable. Incluye estuche rígido con cierre de metal y forro interior acolchado, afinador clip y juego de cuerdas de repuesto. Perfecta para estudiar o tocar en reuniones.',
    'good',
    'Teclado MIDI, ukulele, equipos de audio, micrófono o instrumentos en general',
    ARRAY['guitarra','criolla','clásica','cuerdas','música','instrumento','cedro'],
    110,
    '[
      {"url":"https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    'active',
    9.3310, -70.6090,
    ST_SetSRID(ST_MakePoint(-70.6090, 9.3310), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":6,"waste_reduced_kg":1.5,"estimated_value_usd":110}'::JSONB,
    floor(random()*55+8)::INT, floor(random()*9+1)::INT
  );

  -- -------------------------------------------------------
  -- 6. BIEN | Cafetera Nespresso Essenza Mini
  -- -------------------------------------------------------
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_uid, 'good', 'electronics',
    'Cafetera Nespresso Essenza Mini + 30 cápsulas',
    'Cafetera Nespresso Essenza Mini color negro, 1150W, depósito de agua de 0.6L, presión de 19 bares. Incluye 30 cápsulas de distintas variedades: espresso, lungo y ristretto. Compacta, perfecta para apartamento o escritorio. Muy poco uso, está como nueva, sin manchas ni depósitos de cal. La caja original está disponible.',
    'like_new',
    'Licuadora, sandwichera, microondas pequeño o electrodomésticos de cocina',
    ARRAY['cafetera','nespresso','café','capsulas','electrodoméstico','cocina'],
    90,
    '[
      {"url":"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    'active',
    9.3228, -70.6145,
    ST_SetSRID(ST_MakePoint(-70.6145, 9.3228), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":10,"waste_reduced_kg":2.5,"estimated_value_usd":90}'::JSONB,
    floor(random()*65+5)::INT, floor(random()*11+1)::INT
  );

  -- -------------------------------------------------------
  -- 7. SERVICIO | Clases de Guitarra (Presencial/Online)
  -- -------------------------------------------------------
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_uid, 'service', 'education',
    'Clases de Guitarra — Todos los Niveles (Presencial u Online)',
    'Ofrezco clases personalizadas de guitarra acústica, criolla y eléctrica para principiantes, intermedios y avanzados. Metodología adaptada a tu ritmo: teoría musical, lectura de acordes, ritmos venezolanos (joropo, vals), pop, rock y más. Clases de 1 hora, horarios flexibles de lunes a sábado. 8 años de experiencia enseñando. También puedo ir a tu casa en Valera.',
    NULL,
    'Clases de inglés, matemáticas, diseño gráfico o cualquier habilidad que tengas para enseñar',
    ARRAY['clases','guitarra','música','aprender','online','presencial','acústica'],
    25,
    '[
      {"url":"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    'active',
    9.3185, -70.6067,
    ST_SetSRID(ST_MakePoint(-70.6067, 9.3185), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":0,"waste_reduced_kg":0,"estimated_value_usd":25}'::JSONB,
    floor(random()*90+15)::INT, floor(random()*18+3)::INT
  );

  -- -------------------------------------------------------
  -- 8. SERVICIO | Reparación y Mantenimiento de PC / Laptop
  -- -------------------------------------------------------
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_uid, 'service', 'services',
    'Reparación de PC y Laptops — Diagnóstico Gratis',
    'Técnico en informática con 6 años de experiencia. Servicios: formateo e instalación de Windows/Linux, eliminación de virus y malware, cambio de pasta térmica, reparación de teclados y pantallas, actualización de RAM y disco, recuperación de datos. Diagnóstico completamente gratis. Atiendo en Valera y zonas cercanas. Trabajo rápido y garantizado.',
    NULL,
    'Repuestos para PC (RAM, SSD, pantallas), herramientas de técnico o cualquier servicio que tengas',
    ARRAY['reparación','PC','laptop','computadora','técnico','formateo','virus','mantenimiento'],
    20,
    '[
      {"url":"https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&q=80&auto=format&fit=crop","order":1}
    ]'::JSONB,
    'active',
    9.3260, -70.5998,
    ST_SetSRID(ST_MakePoint(-70.5998, 9.3260), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":0,"waste_reduced_kg":0,"estimated_value_usd":20}'::JSONB,
    floor(random()*110+20)::INT, floor(random()*20+5)::INT
  );

  -- -------------------------------------------------------
  -- 9. SERVICIO | Diseño Gráfico y Logos Profesionales
  -- -------------------------------------------------------
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_uid, 'service', 'services',
    'Diseño Gráfico — Logos, Flyers, Redes Sociales',
    'Diseñador gráfico con experiencia en identidad de marca, publicidad digital e impresa. Ofrezco: logotipos con archivos editables (AI, PDF, PNG), flyers para eventos y negocios, post para Instagram y Facebook, tarjetas de presentación, banners y más. Entrego en 48 a 72 horas. Revisiones ilimitadas hasta quedar 100% satisfecho. Portfolio disponible.',
    NULL,
    'Hosting web, dominio, cursos de diseño, fotografía de productos o servicios de programación',
    ARRAY['diseño','logo','gráfico','branding','flyer','redes sociales','publicidad','marca'],
    30,
    '[
      {"url":"https://images.unsplash.com/photo-1626785774625-0b1c2c4eab53?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    'active',
    9.3300, -70.6030,
    ST_SetSRID(ST_MakePoint(-70.6030, 9.3300), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":0,"waste_reduced_kg":0,"estimated_value_usd":30}'::JSONB,
    floor(random()*80+10)::INT, floor(random()*14+2)::INT
  );

  -- -------------------------------------------------------
  -- 10. SERVICIO | Fotografía de Productos y Retratos
  -- -------------------------------------------------------
  INSERT INTO public.listings (
    user_id, type, category, title, description, condition,
    looking_for, tags, estimated_value_usd, images, status,
    latitude, longitude, location, city, state, eco_impact,
    views_count, favorites_count
  ) VALUES (
    v_uid, 'service', 'services',
    'Fotografía Profesional — Productos, Retratos y Eventos',
    'Fotógrafo con cámara mirrorless Sony A6400 y lentes prime. Sesiones para: fotografía de productos para tiendas online, retratos corporativos y personales, eventos sociales, bodas y quinceañeras. Entrego las fotos editadas en alta resolución en 24 a 48 horas vía Google Drive. Sesión básica incluye 20 fotos editadas profesionalmente. Disponible en Valera y Trujillo capital.',
    NULL,
    'Drone para fotografía aérea, flash externo, lentes de cámara, trípode o equipo de iluminación',
    ARRAY['fotografía','foto','retrato','producto','evento','sony','profesional','sesión'],
    40,
    '[
      {"url":"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80&auto=format&fit=crop","order":0},
      {"url":"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80&auto=format&fit=crop","order":1},
      {"url":"https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80&auto=format&fit=crop","order":2}
    ]'::JSONB,
    'active',
    9.3150, -70.6100,
    ST_SetSRID(ST_MakePoint(-70.6100, 9.3150), 4326)::GEOGRAPHY,
    'Valera', 'Trujillo',
    '{"co2_saved_kg":0,"waste_reduced_kg":0,"estimated_value_usd":40}'::JSONB,
    floor(random()*75+12)::INT, floor(random()*16+3)::INT
  );

  RAISE NOTICE 'Listo: 10 publicaciones creadas para rhonnyjaimes1@gmail.com (6 bienes + 4 servicios) en Valera, Trujillo.';

END $$;

-- Verificar resultado
SELECT
  title,
  type,
  category,
  status,
  city,
  state,
  estimated_value_usd AS valor_usd
FROM public.listings
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'rhonnyjaimes1@gmail.com')
ORDER BY created_at DESC;
