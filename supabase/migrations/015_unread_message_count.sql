-- =============================================================
-- EcoTrueque: Función para contar mensajes sin leer
-- Ejecutar en Supabase SQL Editor
-- =============================================================

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
  WHERE m.is_read = false
    AND m.sender_id != p_user_id
    AND (c.requester_id = p_user_id OR c.owner_id = p_user_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_unread_message_count(UUID) TO authenticated;
