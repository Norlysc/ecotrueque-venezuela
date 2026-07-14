-- =======================================================
-- MIGRACIÓN: Mover todos los usuarios al estado Trujillo
-- Pegar en Supabase Dashboard → SQL Editor → Run
-- =======================================================
-- Distribuye los usuarios entre las principales ciudades
-- del estado Trujillo, Venezuela.
-- Ciudades usadas:
--   Valera     →  9.3200, -70.6067  (ciudad más grande)
--   Trujillo   →  9.3613, -70.4377  (capital del estado)
--   Boconó     →  9.2457, -70.2526
--   Motatán    →  9.3983, -70.5869
--   Pampán     →  9.3675, -70.4883
--   Escuque    →  9.3163, -70.5583
-- =======================================================

-- -------------------------------------------------------
-- PASO 1: Actualizar perfiles
-- ncastaneda30 → Valera (ciudad más importante)
-- edicsonpepo  → Trujillo capital
-- Resto        → Valera por defecto
-- -------------------------------------------------------

-- Usuario ncastaneda30@gmail.com → Valera
UPDATE public.profiles
SET
  city       = 'Valera',
  state      = 'Trujillo',
  updated_at = NOW()
WHERE email = 'ncastaneda30@gmail.com';

-- Usuario edicsonpepo@gmail.com → Trujillo (capital)
UPDATE public.profiles
SET
  city       = 'Trujillo',
  state      = 'Trujillo',
  updated_at = NOW()
WHERE email = 'edicsonpepo@gmail.com';

-- Todos los demás usuarios → Valera
UPDATE public.profiles
SET
  city       = 'Valera',
  state      = 'Trujillo',
  updated_at = NOW()
WHERE email NOT IN ('ncastaneda30@gmail.com', 'edicsonpepo@gmail.com');

-- -------------------------------------------------------
-- PASO 2: Actualizar publicaciones de ncastaneda30
-- Ciudad: Valera → coordenadas reales de distintos barrios
-- -------------------------------------------------------

DO $$
DECLARE
  v_uid UUID;
  v_listings UUID[];
  coord_sets RECORD;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE email = 'ncastaneda30@gmail.com';

  IF v_uid IS NULL THEN
    RAISE NOTICE 'Usuario ncastaneda30 no encontrado, saltando...';
    RETURN;
  END IF;

  -- Asignar coordenadas variadas dentro de Valera
  -- a cada publicación activa del usuario
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
    city      = c.city_name,
    state     = 'Trujillo',
    latitude  = c.lat,
    longitude = c.lng,
    location  = ST_SetSRID(ST_MakePoint(c.lng, c.lat), 4326)::GEOGRAPHY,
    updated_at = NOW()
  FROM numbered n
  JOIN coords c ON c.rn = n.rn
  WHERE l.id = n.id;

END $$;

-- -------------------------------------------------------
-- PASO 3: Actualizar publicaciones de edicsonpepo
-- Ciudad: Trujillo capital
-- -------------------------------------------------------

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
    city      = c.city_name,
    state     = 'Trujillo',
    latitude  = c.lat,
    longitude = c.lng,
    location  = ST_SetSRID(ST_MakePoint(c.lng, c.lat), 4326)::GEOGRAPHY,
    updated_at = NOW()
  FROM numbered n
  JOIN coords c ON c.rn = n.rn
  WHERE l.id = n.id;

END $$;

-- -------------------------------------------------------
-- PASO 4: Cualquier otra publicación sin coordenadas de
-- Trujillo → asignar a Valera por defecto
-- -------------------------------------------------------

UPDATE public.listings
SET
  city      = 'Valera',
  state     = 'Trujillo',
  latitude  = 9.3200 + (random() * 0.02 - 0.01),
  longitude = -70.6067 + (random() * 0.02 - 0.01),
  updated_at = NOW()
WHERE state IS DISTINCT FROM 'Trujillo'
  AND status != 'deleted';

-- Actualizar el campo location geográfico para esas publicaciones
UPDATE public.listings
SET
  location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::GEOGRAPHY
WHERE state = 'Trujillo'
  AND location IS NULL
  AND latitude IS NOT NULL
  AND status != 'deleted';

-- -------------------------------------------------------
-- VERIFICACIÓN: Ver el resultado
-- -------------------------------------------------------

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
