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
