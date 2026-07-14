-- ============================================================
-- ECOTRUEQUE VENEZUELA - MIGRACIONES COMPLETAS
-- Pega este archivo completo en el SQL Editor de Supabase
-- app.supabase.com → SQL Editor → New Query → Run
-- ============================================================

-- ============================================
-- 001: SCHEMA INICIAL
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  eco_points INTEGER DEFAULT 0,
  eco_level TEXT DEFAULT 'seedling' CHECK (eco_level IN ('seedling','sprout','guardian','protector','hero','legend')),
  reputation_score NUMERIC(3,2) DEFAULT 0.00,
  total_trades INTEGER DEFAULT 0,
  active_listings_count INTEGER DEFAULT 0,
  co2_saved_kg NUMERIC(10,2) DEFAULT 0,
  waste_reduced_kg NUMERIC(10,2) DEFAULT 0,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('good','service')),
  category TEXT NOT NULL,
  subcategory TEXT,
  condition TEXT CHECK (condition IN ('new','like_new','good','fair','poor')),
  images JSONB DEFAULT '[]'::JSONB,
  tags TEXT[] DEFAULT '{}',
  looking_for TEXT NOT NULL,
  estimated_value_usd NUMERIC(10,2),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT,4326),
  city TEXT,
  state TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','traded','expired','deleted')),
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  eco_impact JSONB DEFAULT '{"co2_saved_kg":0,"waste_reduced_kg":0,"estimated_value_usd":0}'::JSONB,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS public.trade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_listing_id UUID NOT NULL REFERENCES public.listings(id),
  offered_listing_id UUID NOT NULL REFERENCES public.listings(id),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','cancelled','completed')),
  requester_confirmed BOOLEAN DEFAULT FALSE,
  owner_confirmed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_request_id UUID NOT NULL REFERENCES public.trade_requests(id),
  requester_id UUID NOT NULL REFERENCES public.profiles(id),
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  requested_listing_id UUID NOT NULL REFERENCES public.listings(id),
  offered_listing_id UUID NOT NULL REFERENCES public.listings(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  eco_impact_total JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_request_id UUID REFERENCES public.trade_requests(id),
  participant_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'text' CHECK (type IN ('text','image','trade_proposal','system')),
  content TEXT,
  image_url TEXT,
  trade_request_id UUID REFERENCES public.trade_requests(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID NOT NULL REFERENCES public.trades(id),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewed_id UUID NOT NULL REFERENCES public.profiles(id),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trade_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  points_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.safe_spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('police','mall','metro','bank','hospital','public')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT,4326),
  is_24h BOOLEAN DEFAULT FALSE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  reported_user_id UUID REFERENCES public.profiles(id),
  reported_listing_id UUID REFERENCES public.listings(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 002: ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_listings_location
  ON public.listings USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_listings_search_vector
  ON public.listings USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS idx_listings_title_trgm
  ON public.listings USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_listings_description_trgm
  ON public.listings USING GIN (description gin_trgm_ops);

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

CREATE INDEX IF NOT EXISTS idx_trade_requests_requester_id
  ON public.trade_requests (requester_id);

CREATE INDEX IF NOT EXISTS idx_trade_requests_owner_id
  ON public.trade_requests (owner_id);

CREATE INDEX IF NOT EXISTS idx_trade_requests_status
  ON public.trade_requests (status);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON public.messages (conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id
  ON public.messages (sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON public.messages (created_at ASC);

CREATE INDEX IF NOT EXISTS idx_messages_is_read
  ON public.messages (is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1
  ON public.conversations (participant_1_id);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_2
  ON public.conversations (participant_2_id);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at
  ON public.conversations (last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id
  ON public.favorites (user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_listing_id
  ON public.favorites (listing_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read
  ON public.notifications (is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_safe_spots_location
  ON public.safe_spots USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_profiles_eco_points
  ON public.profiles (eco_points DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_city
  ON public.profiles (city);

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

-- ============================================
-- 003: FUNCIONES Y TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'spanish',
    unaccent(COALESCE(NEW.title, '')) || ' ' ||
    unaccent(COALESCE(NEW.description, '')) || ' ' ||
    unaccent(COALESCE(NEW.looking_for, '')) || ' ' ||
    unaccent(COALESCE(NEW.category, '')) || ' ' ||
    unaccent(array_to_string(NEW.tags, ' '))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listings_search_vector ON public.listings;
CREATE TRIGGER trg_listings_search_vector
  BEFORE INSERT OR UPDATE OF title, description, looking_for, category, tags ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_listing_search_vector();

CREATE OR REPLACE FUNCTION public.handle_favorite_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.listings
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.listings
    SET favorites_count = GREATEST(0, favorites_count - 1)
    WHERE id = OLD.listing_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_favorite_change ON public.favorites;
CREATE TRIGGER trg_favorite_change
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION public.handle_favorite_change();

CREATE OR REPLACE FUNCTION public.update_eco_level(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_points INTEGER;
  v_level TEXT;
BEGIN
  SELECT eco_points INTO v_points FROM public.profiles WHERE id = p_user_id;
  IF v_points >= 3000 THEN v_level := 'legend';
  ELSIF v_points >= 1500 THEN v_level := 'hero';
  ELSIF v_points >= 700 THEN v_level := 'protector';
  ELSIF v_points >= 300 THEN v_level := 'guardian';
  ELSIF v_points >= 100 THEN v_level := 'sprout';
  ELSE v_level := 'seedling';
  END IF;
  UPDATE public.profiles SET eco_level = v_level WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.complete_trade(p_request_id UUID)
RETURNS void AS $$
DECLARE
  v_request RECORD;
  v_req_listing RECORD;
  v_off_listing RECORD;
  v_total_co2 NUMERIC;
  v_total_waste NUMERIC;
  v_eco_points_req INTEGER;
  v_eco_points_own INTEGER;
BEGIN
  SELECT * INTO v_request FROM public.trade_requests WHERE id = p_request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Trade request not found'; END IF;

  SELECT eco_impact INTO v_req_listing FROM public.listings WHERE id = v_request.requested_listing_id;
  SELECT eco_impact INTO v_off_listing FROM public.listings WHERE id = v_request.offered_listing_id;

  v_total_co2 := COALESCE((v_req_listing.eco_impact->>'co2_saved_kg')::NUMERIC, 0) +
                 COALESCE((v_off_listing.eco_impact->>'co2_saved_kg')::NUMERIC, 0);
  v_total_waste := COALESCE((v_req_listing.eco_impact->>'waste_reduced_kg')::NUMERIC, 0) +
                   COALESCE((v_off_listing.eco_impact->>'waste_reduced_kg')::NUMERIC, 0);
  v_eco_points_req := FLOOR(v_total_co2 * 2 + v_total_waste * 3 + 20);
  v_eco_points_own := FLOOR(v_total_co2 * 2 + v_total_waste * 3 + 20);

  INSERT INTO public.trades (
    trade_request_id, requester_id, owner_id,
    requested_listing_id, offered_listing_id,
    eco_impact_total
  ) VALUES (
    p_request_id, v_request.requester_id, v_request.owner_id,
    v_request.requested_listing_id, v_request.offered_listing_id,
    jsonb_build_object('co2_saved_kg', v_total_co2, 'waste_reduced_kg', v_total_waste)
  );

  UPDATE public.trade_requests
  SET status = 'completed', completed_at = NOW()
  WHERE id = p_request_id;

  UPDATE public.listings
  SET status = 'traded' WHERE id IN (v_request.requested_listing_id, v_request.offered_listing_id);

  UPDATE public.profiles
  SET
    total_trades = total_trades + 1,
    eco_points = eco_points + v_eco_points_req,
    co2_saved_kg = co2_saved_kg + v_total_co2,
    waste_reduced_kg = waste_reduced_kg + v_total_waste
  WHERE id = v_request.requester_id;

  UPDATE public.profiles
  SET
    total_trades = total_trades + 1,
    eco_points = eco_points + v_eco_points_own,
    co2_saved_kg = co2_saved_kg + v_total_co2,
    waste_reduced_kg = waste_reduced_kg + v_total_waste
  WHERE id = v_request.owner_id;

  PERFORM public.update_eco_level(v_request.requester_id);
  PERFORM public.update_eco_level(v_request.owner_id);

  UPDATE public.profiles SET active_listings_count = (
    SELECT COUNT(*) FROM public.listings WHERE user_id = profiles.id AND status = 'active'
  ) WHERE id IN (v_request.requester_id, v_request.owner_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET reputation_score = (
    SELECT ROUND(AVG(rating)::NUMERIC, 2)
    FROM public.reviews
    WHERE reviewed_id = NEW.reviewed_id
  )
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_reputation ON public.reviews;
CREATE TRIGGER trg_update_reputation
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_user_reputation();

CREATE OR REPLACE FUNCTION public.get_nearby_listings(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_km INTEGER DEFAULT 20,
  p_category TEXT DEFAULT NULL,
  p_listing_type TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 30,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, user_id UUID, title TEXT, description TEXT,
  type TEXT, category TEXT, subcategory TEXT, condition TEXT,
  images JSONB, tags TEXT[], looking_for TEXT,
  estimated_value_usd NUMERIC, latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION, city TEXT, state TEXT,
  status TEXT, views_count INTEGER, favorites_count INTEGER,
  eco_impact JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION
) AS $$
DECLARE
  v_point GEOGRAPHY;
BEGIN
  v_point := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::GEOGRAPHY;

  RETURN QUERY
  SELECT
    l.id, l.user_id, l.title, l.description,
    l.type, l.category, l.subcategory, l.condition,
    l.images, l.tags, l.looking_for,
    l.estimated_value_usd, l.latitude, l.longitude,
    l.city, l.state, l.status, l.views_count, l.favorites_count,
    l.eco_impact, l.created_at, l.updated_at,
    ROUND((ST_Distance(l.location, v_point) / 1000.0)::NUMERIC, 2)::DOUBLE PRECISION AS distance_km
  FROM public.listings l
  WHERE
    l.status = 'active'
    AND (l.location IS NULL OR ST_DWithin(l.location, v_point, p_radius_km * 1000))
    AND (p_category IS NULL OR l.category = p_category)
    AND (p_listing_type IS NULL OR l.type = p_listing_type)
    AND (
      p_search_query IS NULL
      OR l.search_vector @@ plainto_tsquery('spanish', unaccent(p_search_query))
      OR l.title ILIKE '%' || p_search_query || '%'
    )
  ORDER BY
    CASE WHEN l.location IS NOT NULL THEN ST_Distance(l.location, v_point) ELSE 999999999 END ASC,
    l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.get_trade_matches(
  p_listing_id UUID,
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  listing_id UUID,
  score NUMERIC,
  match_reasons TEXT[]
) AS $$
DECLARE
  v_listing RECORD;
BEGIN
  SELECT * INTO v_listing FROM public.listings WHERE id = p_listing_id;
  IF NOT FOUND THEN RETURN; END IF;

  RETURN QUERY
  WITH candidate_listings AS (
    SELECT
      l.*,
      (
        CASE WHEN l.category = v_listing.category THEN 0.4 ELSE 0.0 END +
        CASE WHEN l.looking_for ILIKE '%' || v_listing.category || '%' THEN 0.3 ELSE 0.0 END +
        CASE WHEN l.type = v_listing.type THEN 0.1 ELSE 0.0 END +
        CASE WHEN l.state = v_listing.state THEN 0.2 ELSE 0.0 END
      ) AS raw_score
    FROM public.listings l
    WHERE
      l.status = 'active'
      AND l.user_id != p_user_id
      AND l.id != p_listing_id
      AND l.id NOT IN (
        SELECT requested_listing_id FROM public.trade_requests
        WHERE requester_id = p_user_id AND status IN ('pending','accepted')
      )
    ORDER BY raw_score DESC
    LIMIT p_limit
  )
  SELECT
    cl.id AS listing_id,
    cl.raw_score AS score,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN cl.category = v_listing.category THEN 'Misma categoría' END,
      CASE WHEN cl.looking_for ILIKE '%' || v_listing.category || '%' THEN 'Busca lo que tú ofreces' END,
      CASE WHEN cl.state = v_listing.state THEN 'Mismo estado' END
    ], NULL) AS match_reasons
  FROM candidate_listings cl
  WHERE cl.raw_score > 0
  ORDER BY cl.raw_score DESC;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.get_nearby_safe_spots(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID, name TEXT, type TEXT, address TEXT,
  city TEXT, state TEXT, latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION, is_24h BOOLEAN, phone TEXT,
  distance_km DOUBLE PRECISION
) AS $$
DECLARE
  v_point GEOGRAPHY;
BEGIN
  v_point := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::GEOGRAPHY;
  RETURN QUERY
  SELECT
    s.id, s.name, s.type, s.address, s.city, s.state,
    s.latitude, s.longitude, s.is_24h, s.phone,
    ROUND((ST_Distance(s.location, v_point) / 1000.0)::NUMERIC, 2)::DOUBLE PRECISION AS distance_km
  FROM public.safe_spots s
  WHERE ST_DWithin(s.location, v_point, p_radius_km * 1000)
  ORDER BY ST_Distance(s.location, v_point) ASC;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.update_active_listings_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET active_listings_count = (
    SELECT COUNT(*) FROM public.listings
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND status = 'active'
  )
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_active_listings_count ON public.listings;
CREATE TRIGGER trg_active_listings_count
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_active_listings_count();

-- ============================================
-- 004: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "listings_select_active" ON public.listings;
CREATE POLICY "listings_select_active" ON public.listings FOR SELECT USING (status != 'deleted');

DROP POLICY IF EXISTS "listings_insert_own" ON public.listings;
CREATE POLICY "listings_insert_own" ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "listings_update_own" ON public.listings;
CREATE POLICY "listings_update_own" ON public.listings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "listings_delete_own" ON public.listings;
CREATE POLICY "listings_delete_own" ON public.listings FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_select_own" ON public.favorites;
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert_own" ON public.favorites;
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete_own" ON public.favorites;
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "trade_requests_select_involved" ON public.trade_requests;
CREATE POLICY "trade_requests_select_involved" ON public.trade_requests FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "trade_requests_insert_requester" ON public.trade_requests;
CREATE POLICY "trade_requests_insert_requester" ON public.trade_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "trade_requests_update_involved" ON public.trade_requests;
CREATE POLICY "trade_requests_update_involved" ON public.trade_requests FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "trades_select_involved" ON public.trades;
CREATE POLICY "trades_select_involved" ON public.trades FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "conversations_select_participant" ON public.conversations;
CREATE POLICY "conversations_select_participant" ON public.conversations FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

DROP POLICY IF EXISTS "conversations_insert_participant" ON public.conversations;
CREATE POLICY "conversations_insert_participant" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

DROP POLICY IF EXISTS "conversations_update_participant" ON public.conversations;
CREATE POLICY "conversations_update_participant" ON public.conversations FOR UPDATE USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

DROP POLICY IF EXISTS "messages_select_participant" ON public.messages;
CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_insert_participant" ON public.messages;
CREATE POLICY "messages_insert_participant"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_update_own" ON public.messages;
CREATE POLICY "messages_update_own"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "reviews_insert_reviewer" ON public.reviews;
CREATE POLICY "reviews_insert_reviewer" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "achievements_select_all" ON public.achievements;
CREATE POLICY "achievements_select_all" ON public.achievements FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "user_achievements_select_own" ON public.user_achievements;
CREATE POLICY "user_achievements_select_own" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_achievements_insert" ON public.user_achievements;
CREATE POLICY "user_achievements_insert" ON public.user_achievements FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "safe_spots_select_all" ON public.safe_spots;
CREATE POLICY "safe_spots_select_all" ON public.safe_spots FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "reports_insert_own" ON public.reports;
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_select_own" ON public.reports;
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- ============================================
-- 005: STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('listings', 'listings', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('messages', 'messages', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_auth_upload" ON storage.objects;
CREATE POLICY "avatars_auth_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::TEXT);

DROP POLICY IF EXISTS "avatars_own_update" ON storage.objects;
CREATE POLICY "avatars_own_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

DROP POLICY IF EXISTS "avatars_own_delete" ON storage.objects;
CREATE POLICY "avatars_own_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

DROP POLICY IF EXISTS "listings_public_read" ON storage.objects;
CREATE POLICY "listings_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'listings');

DROP POLICY IF EXISTS "listings_auth_upload" ON storage.objects;
CREATE POLICY "listings_auth_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listings' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::TEXT);

DROP POLICY IF EXISTS "listings_own_update" ON storage.objects;
CREATE POLICY "listings_own_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

DROP POLICY IF EXISTS "listings_own_delete" ON storage.objects;
CREATE POLICY "listings_own_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

DROP POLICY IF EXISTS "messages_auth_read" ON storage.objects;
CREATE POLICY "messages_auth_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'messages' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "messages_auth_upload" ON storage.objects;
CREATE POLICY "messages_auth_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'messages' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- ============================================
-- 006: DATOS SEMILLA
-- ============================================

INSERT INTO public.achievements (key, title, description, emoji, points_reward, requirement_type, requirement_value)
VALUES
  ('first_trade', 'Primera Semilla', 'Completa tu primer trueque ecológico', '🌱', 50, 'trades_count', 1),
  ('five_trades', 'Cinco Trueques', 'Realiza 5 trueques ecológicos', '🔄', 100, 'trades_count', 5),
  ('ten_trades', 'Decena Verde', 'Completa 10 trueques', '🌿', 200, 'trades_count', 10),
  ('twenty_trades', 'Veterano del Trueque', 'Completa 20 trueques', '🏆', 400, 'trades_count', 20),
  ('sprout_level', 'Nivel Brote', 'Alcanza el nivel Brote (100 pts)', '🌿', 75, 'eco_points', 100),
  ('guardian_level', 'Nivel Guardián', 'Alcanza el nivel Guardián (300 pts)', '🍃', 150, 'eco_points', 300),
  ('protector_level', 'Nivel Protector', 'Alcanza el nivel Protector (700 pts)', '🌳', 250, 'eco_points', 700),
  ('hero_level', 'Nivel Héroe Eco', 'Alcanza el nivel Héroe (1500 pts)', '🦋', 400, 'eco_points', 1500),
  ('legend_level', 'Leyenda Verde', 'Alcanza el nivel Leyenda (3000 pts)', '🌍', 600, 'eco_points', 3000),
  ('co2_saver_50', 'Ahorrador CO₂', 'Evita 50 kg de CO₂', '🌬️', 100, 'co2_saved_kg', 50),
  ('co2_saver_200', 'Guardián del Aire', 'Evita 200 kg de CO₂', '💨', 300, 'co2_saved_kg', 200),
  ('waste_reducer_10', 'Anti Residuos', 'Evita 10 kg de residuos', '♻️', 75, 'waste_reduced_kg', 10),
  ('waste_reducer_50', 'Reciclador Pro', 'Evita 50 kg de residuos', '🔄', 200, 'waste_reduced_kg', 50),
  ('reviewer_1', 'Primera Reseña', 'Escribe tu primera reseña', '⭐', 25, 'reviews_given', 1),
  ('perfect_rating', 'Reputación Perfecta', 'Mantén 5 estrellas con 5+ reseñas', '🌟', 200, 'reputation_stars', 5),
  ('community_pillar', 'Pilar de la Comunidad', 'Recibe 50 reseñas positivas', '🏛️', 500, 'reviews_received', 50)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.safe_spots (name, type, address, city, state, latitude, longitude, is_24h, phone)
VALUES
  ('Sambil Caracas', 'mall', 'Av. Libertador, El Rosal', 'Caracas', 'Distrito Capital', 10.5002, -66.8511, FALSE, NULL),
  ('Centro Comercial El Recreo', 'mall', 'Av. Casanova, Sabana Grande', 'Caracas', 'Distrito Capital', 10.5007, -66.8789, FALSE, NULL),
  ('Centro Comercial Paseo Las Mercedes', 'mall', 'Calle París, Las Mercedes', 'Caracas', 'Distrito Capital', 10.4841, -66.8618, FALSE, NULL),
  ('Metro Altamira', 'metro', 'Av. Luis Roche, Altamira', 'Caracas', 'Distrito Capital', 10.4927, -66.8395, TRUE, NULL),
  ('Metro Plaza Venezuela', 'metro', 'Av. Universidad, Plaza Venezuela', 'Caracas', 'Distrito Capital', 10.5015, -66.8948, TRUE, NULL),
  ('Metro Chacaíto', 'metro', 'Av. Francisco de Miranda, Chacaíto', 'Caracas', 'Distrito Capital', 10.4974, -66.8620, TRUE, NULL),
  ('Metro Bellas Artes', 'metro', 'Av. Lecuna, Bellas Artes', 'Caracas', 'Distrito Capital', 10.5063, -66.9015, TRUE, NULL),
  ('Metro La California', 'metro', 'Av. La California', 'Caracas', 'Distrito Capital', 10.4785, -66.8455, TRUE, NULL),
  ('CICPC Las Mercedes', 'police', 'Calle Londres, Las Mercedes', 'Caracas', 'Distrito Capital', 10.4875, -66.8609, TRUE, '0212-993-7766'),
  ('Comisaría de El Cafetal', 'police', 'Av. El Cafetal', 'Caracas', 'Distrito Capital', 10.4755, -66.8328, TRUE, NULL),
  ('Centro Comercial La Lagunita', 'mall', 'El Hatillo', 'Caracas', 'Miranda', 10.4449, -66.8105, FALSE, NULL),
  ('Sambil Maracaibo', 'mall', 'Av. 8B, Maracaibo', 'Maracaibo', 'Zulia', 10.6748, -71.6197, FALSE, NULL),
  ('Centro Comercial Galerías Mall', 'mall', 'Av. 5 de Julio, Maracaibo', 'Maracaibo', 'Zulia', 10.6668, -71.5967, FALSE, NULL),
  ('CCCT Maracaibo', 'mall', 'Av. Bella Vista, Maracaibo', 'Maracaibo', 'Zulia', 10.6524, -71.6285, FALSE, NULL),
  ('Sambil Valencia', 'mall', 'Av. Bolívar Norte, Valencia', 'Valencia', 'Carabobo', 10.1888, -67.9942, FALSE, NULL),
  ('Centro Comercial Metrópolis', 'mall', 'Av. Bolívar Norte, Valencia', 'Valencia', 'Carabobo', 10.2014, -67.9977, FALSE, NULL),
  ('CC Gran Bazar Valencia', 'mall', 'Valencia', 'Valencia', 'Carabobo', 10.1797, -68.0018, FALSE, NULL),
  ('CC Sambil Barquisimeto', 'mall', 'Av. Pedro León Torres', 'Barquisimeto', 'Lara', 10.0749, -69.3093, FALSE, NULL),
  ('CC Las Trinitarias', 'mall', 'Av. 20, Barquisimeto', 'Barquisimeto', 'Lara', 10.0636, -69.3367, FALSE, NULL),
  ('CC Hacienda La Trinidad', 'mall', 'Av. Andrés Bello, Mérida', 'Mérida', 'Mérida', 8.5839, -71.1517, FALSE, NULL)
ON CONFLICT DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

CREATE INDEX IF NOT EXISTS idx_safe_spots_city ON public.safe_spots (city);
CREATE INDEX IF NOT EXISTS idx_safe_spots_state ON public.safe_spots (state);
