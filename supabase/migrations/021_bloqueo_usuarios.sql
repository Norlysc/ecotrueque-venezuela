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
