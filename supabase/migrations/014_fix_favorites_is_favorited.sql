-- =============================================================
-- EcoTrueque: Fix get_nearby_listings
-- Agrega is_favorited + user info al resultado
-- Ejecutar en Supabase SQL Editor
-- =============================================================

CREATE OR REPLACE FUNCTION public.get_nearby_listings(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_km INTEGER DEFAULT 20,
  p_category TEXT DEFAULT NULL,
  p_listing_type TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 30,
  p_offset INTEGER DEFAULT 0,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID, user_id UUID, title TEXT, description TEXT,
  type TEXT, category TEXT, subcategory TEXT, condition TEXT,
  images JSONB, tags TEXT[], looking_for TEXT,
  estimated_value_usd NUMERIC, latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION, city TEXT, state TEXT,
  status TEXT, views_count INTEGER, favorites_count INTEGER,
  eco_impact JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION,
  user_full_name TEXT, user_avatar_url TEXT, user_eco_level TEXT,
  is_favorited BOOLEAN
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
    ROUND((ST_Distance(l.location, v_point) / 1000.0)::NUMERIC, 2)::DOUBLE PRECISION AS distance_km,
    pr.full_name  AS user_full_name,
    pr.avatar_url AS user_avatar_url,
    pr.eco_level  AS user_eco_level,
    CASE
      WHEN p_user_id IS NOT NULL THEN
        EXISTS(
          SELECT 1 FROM public.favorites f
          WHERE f.listing_id = l.id AND f.user_id = p_user_id
        )
      ELSE FALSE
    END AS is_favorited
  FROM public.listings l
  LEFT JOIN public.profiles pr ON pr.id = l.user_id
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
