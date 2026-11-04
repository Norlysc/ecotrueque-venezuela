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
