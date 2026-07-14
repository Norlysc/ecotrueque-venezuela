-- ============================================
-- EcoTrueque Venezuela - Funciones y Triggers
-- ============================================

-- ============================================
-- TRIGGER: handle_new_user
-- Se ejecuta automáticamente cuando se registra un usuario
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

-- ============================================
-- FUNCIÓN: update_listing_search_vector
-- Actualiza el vector de búsqueda en español
-- ============================================
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

-- ============================================
-- FUNCIÓN: handle_favorite_change
-- Actualiza el contador de favoritos automáticamente
-- ============================================
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

-- ============================================
-- FUNCIÓN: complete_trade
-- Completa un trueque y actualiza métricas ecológicas
-- ============================================
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

-- ============================================
-- FUNCIÓN: update_eco_level
-- Recalcula el nivel eco según los puntos
-- ============================================
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

-- ============================================
-- FUNCIÓN: update_user_reputation
-- Actualiza la reputación al crear una reseña
-- ============================================
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

-- ============================================
-- FUNCIÓN: get_nearby_listings
-- Búsqueda geoespacial con filtros
-- ============================================
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

-- ============================================
-- FUNCIÓN: get_trade_matches
-- Motor de matching con scoring ponderado
-- ============================================
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

-- ============================================
-- FUNCIÓN: get_nearby_safe_spots
-- Sitios seguros cercanos
-- ============================================
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

-- ============================================
-- FUNCIÓN: update_active_listings_count
-- Actualiza contador cuando cambia status de un listing
-- ============================================
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
