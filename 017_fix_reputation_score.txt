-- =============================================================
-- EcoTrueque: Fix reputation_score — no se actualiza al dejar reseña
-- Ejecutar en Supabase SQL Editor
-- =============================================================
-- Problema: cuando alguien deja una reseña (INSERT en reviews),
-- el campo reputation_score en profiles no se actualiza
-- automáticamente, por eso las estrellas siempre muestran 0.
-- Solución: trigger AFTER INSERT/UPDATE/DELETE en reviews que
-- recalcula el promedio y lo guarda en profiles.reputation_score.
-- =============================================================

-- ──────────────────────────────────────────────────────────────
-- FUNCIÓN: recalcula reputation_score del usuario reseñado
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_reputation_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_new_score NUMERIC(3,2);
BEGIN
  -- En DELETE NEW es NULL, en INSERT OLD es NULL
  v_user_id := COALESCE(NEW.reviewed_id, OLD.reviewed_id);

  SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0)
  INTO v_new_score
  FROM public.reviews
  WHERE reviewed_id = v_user_id;

  UPDATE public.profiles
  SET
    reputation_score = v_new_score,
    updated_at       = NOW()
  WHERE id = v_user_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- TRIGGER: se dispara en cada INSERT, UPDATE o DELETE de reviews
-- ──────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_update_reputation ON public.reviews;

CREATE TRIGGER trg_update_reputation
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_reputation_score();

-- ──────────────────────────────────────────────────────────────
-- BACKFILL: recalcular para reseñas que ya existen en la BD
-- ──────────────────────────────────────────────────────────────
UPDATE public.profiles p
SET
  reputation_score = COALESCE((
    SELECT ROUND(AVG(r.rating)::NUMERIC, 2)
    FROM public.reviews r
    WHERE r.reviewed_id = p.id
  ), 0),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.reviews WHERE reviewed_id = p.id
);

-- ──────────────────────────────────────────────────────────────
-- VERIFICACIÓN: muestra usuarios con sus reseñas y puntaje
-- ──────────────────────────────────────────────────────────────
SELECT
  p.email,
  p.full_name,
  p.reputation_score,
  COUNT(r.id)          AS total_reseñas,
  ROUND(AVG(r.rating)::NUMERIC, 2) AS promedio_calculado
FROM public.profiles p
LEFT JOIN public.reviews r ON r.reviewed_id = p.id
GROUP BY p.id, p.email, p.full_name, p.reputation_score
ORDER BY total_reseñas DESC;
