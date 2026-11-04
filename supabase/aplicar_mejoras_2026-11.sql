-- =============================================================
-- EcoTrueque: mejoras de noviembre de 2026 (015 corregido, 020, 021 y 022)
-- Pegar completo en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez.
-- =============================================================

-- >>> supabase/migrations/015_unread_message_count.sql
-- =============================================================
-- EcoTrueque: Función para contar mensajes sin leer
-- Ejecutar en Supabase SQL Editor
-- =============================================================
-- Corrección (noviembre 2026): la versión anterior usaba las columnas
-- conversations.requester_id y owner_id, que no existen; los participantes
-- de una conversación son participant_1_id y participant_2_id. Además solo
-- devuelve el conteo del propio usuario autenticado.

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
  WHERE p_user_id = auth.uid()
    AND m.is_read = false
    AND m.sender_id <> p_user_id
    AND (c.participant_1_id = p_user_id OR c.participant_2_id = p_user_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_unread_message_count(UUID) TO authenticated;

-- >>> supabase/migrations/020_politicas_seguridad.sql
-- =============================================================
-- EcoTrueque: Refuerzo de políticas de seguridad (noviembre 2026)
-- Ejecutar en Supabase SQL Editor
-- =============================================================

-- 1. Correo privado. profiles se puede leer públicamente (perfiles, reputación),
--    así que el correo no se guarda allí: la app lo obtiene de Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    '',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

UPDATE public.profiles SET email = '' WHERE email <> '';

-- 2. Notificaciones: solo para uno mismo o para alguien con quien se tiene una propuesta
--    de trueque (avisos de nueva propuesta, aceptación, rechazo y reseña).
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.trade_requests tr
        WHERE (tr.requester_id = auth.uid() AND tr.owner_id = user_id)
           OR (tr.owner_id = auth.uid() AND tr.requester_id = user_id)
      )
    )
  );

-- 3. Logros: cada usuario solo puede registrar los suyos.
DROP POLICY IF EXISTS "user_achievements_insert" ON public.user_achievements;
CREATE POLICY "user_achievements_insert"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Fotos del chat (bucket privado messages): las ve quien las subió y las personas
--    que tienen una conversación con quien las subió. Las rutas son <id del remitente>/<archivo>.
DROP POLICY IF EXISTS "messages_auth_read" ON storage.objects;
CREATE POLICY "messages_auth_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'messages' AND
    auth.uid() IS NOT NULL AND (
      (storage.foldername(name))[1] = auth.uid()::TEXT
      OR EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE (c.participant_1_id = auth.uid() AND c.participant_2_id::TEXT = (storage.foldername(name))[1])
           OR (c.participant_2_id = auth.uid() AND c.participant_1_id::TEXT = (storage.foldername(name))[1])
      )
    )
  );

-- >>> supabase/migrations/021_bloqueo_usuarios.sql
-- =============================================================
-- EcoTrueque: Bloqueo de usuarios (noviembre 2026)
-- Ejecutar en Supabase SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks (blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks (blocked_id);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Cada persona ve, crea y elimina solo sus propios bloqueos
DROP POLICY IF EXISTS "user_blocks_select_own" ON public.user_blocks;
CREATE POLICY "user_blocks_select_own" ON public.user_blocks FOR SELECT USING (auth.uid() = blocker_id);
DROP POLICY IF EXISTS "user_blocks_insert_own" ON public.user_blocks;
CREATE POLICY "user_blocks_insert_own" ON public.user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
DROP POLICY IF EXISTS "user_blocks_delete_own" ON public.user_blocks;
CREATE POLICY "user_blocks_delete_own" ON public.user_blocks FOR DELETE USING (auth.uid() = blocker_id);

-- ¿Existe un bloqueo en cualquier sentido entre dos personas? SECURITY DEFINER porque
-- la RLS anterior oculta a cada usuario los bloqueos que hizo la otra persona.
CREATE OR REPLACE FUNCTION public.is_blocked_between(p_a UUID, p_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = p_a AND blocked_id = p_b) OR (blocker_id = p_b AND blocked_id = p_a)
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_blocked_between(UUID, UUID) TO authenticated;

-- Sin mensajes entre personas bloqueadas
DROP POLICY IF EXISTS "messages_insert_participant" ON public.messages;
CREATE POLICY "messages_insert_participant"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
      AND NOT public.is_blocked_between(c.participant_1_id, c.participant_2_id)
    )
  );

-- Sin propuestas de trueque entre personas bloqueadas
DROP POLICY IF EXISTS "trade_requests_insert_requester" ON public.trade_requests;
CREATE POLICY "trade_requests_insert_requester"
  ON public.trade_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id AND NOT public.is_blocked_between(requester_id, owner_id));

-- >>> supabase/migrations/022_sitios_seguros_valera.sql
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
