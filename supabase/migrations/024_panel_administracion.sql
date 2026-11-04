-- =============================================================
-- EcoTrueque: Panel de administración de reportes (noviembre 2026)
-- Ejecutar en Supabase SQL Editor. Se puede ejecutar más de una vez.
-- =============================================================

-- 1. Rol de administrador y trazabilidad de la revisión
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.reports  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.reports  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.reports  ADD COLUMN IF NOT EXISTS admin_note  TEXT;

-- 2. Nadie puede darse permisos de administrador desde la app: profiles_update_own permite
--    editar el propio perfil, así que is_admin solo cambia desde el SQL Editor (rol postgres).
CREATE OR REPLACE FUNCTION public.protect_is_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') AND (
       (TG_OP = 'INSERT' AND NEW.is_admin)
    OR (TG_OP = 'UPDATE' AND NEW.is_admin IS DISTINCT FROM OLD.is_admin)
  ) THEN
    RAISE EXCEPTION 'No autorizado: el rol de administrador solo se asigna desde Supabase';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_is_admin ON public.profiles;
CREATE TRIGGER trg_protect_is_admin
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_is_admin();

-- 3. ¿El usuario autenticado es administrador?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), FALSE);
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 4. Los administradores leen todos los reportes (cada usuario sigue viendo solo los suyos)
DROP POLICY IF EXISTS "reports_select_admin" ON public.reports;
CREATE POLICY "reports_select_admin" ON public.reports FOR SELECT USING (public.is_admin());

-- 5. Cambiar el estado de un reporte, con nota, y avisar a quien lo envió
CREATE OR REPLACE FUNCTION public.admin_update_report(p_report_id UUID, p_status TEXT, p_note TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reporter UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'No autorizado: solo administradores';
  END IF;
  IF p_status NOT IN ('pending', 'reviewed', 'resolved') THEN
    RAISE EXCEPTION 'Estado no válido: %', p_status;
  END IF;

  UPDATE public.reports
  SET status = p_status,
      admin_note = NULLIF(TRIM(COALESCE(p_note, '')), ''),
      reviewed_by = auth.uid(),
      reviewed_at = NOW()
  WHERE id = p_report_id
  RETURNING reporter_id INTO v_reporter;

  IF v_reporter IS NULL THEN
    RAISE EXCEPTION 'Reporte no encontrado';
  END IF;

  IF p_status IN ('reviewed', 'resolved') THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      v_reporter,
      'report_update',
      CASE WHEN p_status = 'resolved' THEN 'Tu reporte fue atendido' ELSE 'Tu reporte está en revisión' END,
      CASE WHEN p_status = 'resolved'
        THEN 'Gracias por cuidar la comunidad. El equipo de EcoTrueque tomó medidas sobre tu reporte.'
        ELSE 'El equipo de EcoTrueque está revisando tu reporte.' END,
      jsonb_build_object('report_id', p_report_id)
    );
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_update_report(UUID, TEXT, TEXT) TO authenticated;

-- 6. Pausar una publicación reportada: deja de aparecer en explorar y en el mapa
CREATE OR REPLACE FUNCTION public.admin_pause_listing(p_listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
  v_title TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'No autorizado: solo administradores';
  END IF;

  UPDATE public.listings
  SET status = 'paused', updated_at = NOW()
  WHERE id = p_listing_id AND status = 'active'
  RETURNING user_id, title INTO v_owner, v_title;

  IF v_owner IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      v_owner,
      'listing_paused',
      'Tu publicación fue pausada',
      '«' || v_title || '» se pausó tras un reporte de la comunidad. Escríbenos desde Ayuda y soporte si crees que es un error.',
      jsonb_build_object('listing_id', p_listing_id)
    );
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_pause_listing(UUID) TO authenticated;

-- 7. Administradores iniciales
UPDATE public.profiles SET is_admin = TRUE WHERE id = 'ae465756-8673-43a4-aac7-7d9710877a7a'; -- Norlys Castañeda
-- UPDATE public.profiles SET is_admin = TRUE WHERE id = '3334b81d-81ed-486f-8e47-381e6e709c45'; -- Rhonny Jaimes (quitar «--» para activarlo)
