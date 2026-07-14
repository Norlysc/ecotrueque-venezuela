-- ============================================
-- EcoTrueque Venezuela - Índices
-- ============================================

-- Índice geoespacial para listings
CREATE INDEX IF NOT EXISTS idx_listings_location
  ON public.listings USING GIST (location);

-- Índice de búsqueda full-text
CREATE INDEX IF NOT EXISTS idx_listings_search_vector
  ON public.listings USING GIN (search_vector);

-- Índices para trigram (búsqueda aproximada)
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm
  ON public.listings USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_listings_description_trgm
  ON public.listings USING GIN (description gin_trgm_ops);

-- Índices de performance para listings
CREATE INDEX IF NOT EXISTS idx_listings_user_id
  ON public.listings (user_id);

CREATE INDEX IF NOT EXISTS idx_listings_status
  ON public.listings (status);

CREATE INDEX IF NOT EXISTS idx_listings_category
  ON public.listings (category);

CREATE INDEX IF NOT EXISTS idx_listings_type
  ON public.listings (type);

CREATE INDEX IF NOT EXISTS idx_listings_created_at
  ON public.listings (created_at DESC);

-- Índices para trade_requests
CREATE INDEX IF NOT EXISTS idx_trade_requests_requester_id
  ON public.trade_requests (requester_id);

CREATE INDEX IF NOT EXISTS idx_trade_requests_owner_id
  ON public.trade_requests (owner_id);

CREATE INDEX IF NOT EXISTS idx_trade_requests_status
  ON public.trade_requests (status);

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON public.messages (conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id
  ON public.messages (sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON public.messages (created_at ASC);

CREATE INDEX IF NOT EXISTS idx_messages_is_read
  ON public.messages (is_read) WHERE is_read = FALSE;

-- Índices para conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1
  ON public.conversations (participant_1_id);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_2
  ON public.conversations (participant_2_id);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at
  ON public.conversations (last_message_at DESC NULLS LAST);

-- Índices para favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id
  ON public.favorites (user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_listing_id
  ON public.favorites (listing_id);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read
  ON public.notifications (is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications (created_at DESC);

-- Índice geoespacial para safe_spots
CREATE INDEX IF NOT EXISTS idx_safe_spots_location
  ON public.safe_spots USING GIST (location);

-- Índice para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_eco_points
  ON public.profiles (eco_points DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_city
  ON public.profiles (city);

-- Trigger para actualizar location de listings cuando se actualiza lat/lng
CREATE OR REPLACE FUNCTION update_listing_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::GEOGRAPHY;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_listing_location ON public.listings;
CREATE TRIGGER trg_update_listing_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_location();

-- Trigger para safe_spots
CREATE OR REPLACE FUNCTION update_safe_spot_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::GEOGRAPHY;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_safe_spot_location ON public.safe_spots;
CREATE TRIGGER trg_update_safe_spot_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.safe_spots
  FOR EACH ROW EXECUTE FUNCTION update_safe_spot_location();
