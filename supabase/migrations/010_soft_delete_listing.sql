-- ============================================
-- Función RPC: eliminar publicación propia
-- SECURITY DEFINER para evitar conflicto entre
-- la política UPDATE (owner) y la política SELECT
-- (status != 'deleted') al hacer soft-delete.
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

CREATE OR REPLACE FUNCTION public.delete_own_listing(p_listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario autenticado sea el dueño
  IF NOT EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = p_listing_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado: solo el dueño puede eliminar esta publicación';
  END IF;

  -- Soft delete
  UPDATE public.listings
  SET status = 'deleted', updated_at = NOW()
  WHERE id = p_listing_id;
END;
$$;

-- Permitir que cualquier usuario autenticado llame la función
GRANT EXECUTE ON FUNCTION public.delete_own_listing(UUID) TO authenticated;
