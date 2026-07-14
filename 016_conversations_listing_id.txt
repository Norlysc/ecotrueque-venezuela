-- =============================================================
-- EcoTrueque: Agregar listing_id a conversations
-- Permite tener un chat específico por publicación
-- Ejecutar en Supabase SQL Editor
-- =============================================================

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL;

-- Índice para búsquedas rápidas por listing
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id
  ON public.conversations(listing_id)
  WHERE listing_id IS NOT NULL;
