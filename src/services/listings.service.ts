import { supabase, uploadImage } from '@lib/supabase';
import type { Listing, NearbyFilter } from '@/types/app.types';
import type { CategoryId } from '@constants/categories';

const ECO_IMPACT_BY_CATEGORY: Record<string, { co2: number; waste: number }> = {
  electronics: { co2: 15, waste: 2 },
  clothing: { co2: 8, waste: 1.5 },
  food: { co2: 3, waste: 0.5 },
  furniture: { co2: 25, waste: 10 },
  books: { co2: 2, waste: 0.3 },
  tools: { co2: 10, waste: 3 },
  vehicles: { co2: 50, waste: 20 },
  default: { co2: 5, waste: 1 },
};

export const listingsService = {
  async getNearby(filter: NearbyFilter, userId?: string): Promise<Listing[]> {
    const { data, error } = await supabase.rpc('get_nearby_listings', {
      p_latitude: filter.latitude,
      p_longitude: filter.longitude,
      p_radius_km: filter.radius_km ?? 20,
      p_category: filter.category ?? null,
      p_listing_type: filter.listing_type ?? null,
      p_search_query: filter.search_query ?? null,
      p_limit: filter.limit ?? 30,
      p_offset: filter.offset ?? 0,
      p_user_id: userId ?? null,
    });
    if (error) throw error;
    return ((data ?? []) as any[]).map((item) => ({
      ...item,
      user: item.user_full_name
        ? {
            id: item.user_id,
            full_name: item.user_full_name,
            avatar_url: item.user_avatar_url ?? null,
            eco_level: item.user_eco_level ?? 'seedling',
          }
        : undefined,
    })) as Listing[];
  },

  async getById(id: string, userId?: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        user:profiles(*),
        favorites(user_id)
      `)
      .eq('id', id)
      .single();
    if (error) return null;

    const listing = data as any;
    listing.is_favorited = userId
      ? listing.favorites?.some((f: any) => f.user_id === userId) ?? false
      : false;
    delete listing.favorites;
    return listing as Listing;
  },

  async getByUser(userId: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Listing[];
  },

  async getFavorites(userId: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('listing:listings(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((f: any) => f.listing) as Listing[];
  },

  async toggleFavorite(
    userId: string,
    listingId: string,
    isFavorited: boolean
  ): Promise<void> {
    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, listing_id: listingId });
    }
  },

  async create(data: {
    type: string;
    category: CategoryId;
    title: string;
    description?: string;
    condition?: string;
    looking_for: string;
    tags?: string[];
    estimated_value_usd?: number;
    imageUris?: string[];
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    userId: string;
  }): Promise<Listing> {
    const images: { url: string; order: number }[] = [];

    if (data.imageUris && data.imageUris.length > 0) {
      for (let i = 0; i < data.imageUris.length; i++) {
        const uri = data.imageUris[i];
        const path = `${data.userId}/${Date.now()}_${i}.jpg`;
        const url = await uploadImage('listings', path, uri);
        images.push({ url, order: i });
      }
    }

    const ecoCalc = ECO_IMPACT_BY_CATEGORY[data.category] ?? ECO_IMPACT_BY_CATEGORY.default;
    const eco_impact = {
      co2_saved_kg: ecoCalc.co2,
      waste_reduced_kg: ecoCalc.waste,
      estimated_value_usd: data.estimated_value_usd ?? 0,
    };

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        user_id: data.userId,
        type: data.type,
        category: data.category,
        title: data.title,
        description: data.description ?? '',
        condition: data.condition ?? null,
        looking_for: data.looking_for,
        tags: data.tags ?? [],
        estimated_value_usd: data.estimated_value_usd ?? null,
        images,
        status: 'active',
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        eco_impact,
        views_count: 0,
        favorites_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return listing as Listing;
  },

  async update(id: string, updates: Partial<Listing>): Promise<Listing> {
    const { data, error } = await supabase
      .from('listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Listing;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.rpc('delete_own_listing', { p_listing_id: id });
    if (error) throw error;
  },

  async getMatches(listingId: string, userId: string) {
    const { data, error } = await supabase.rpc('get_trade_matches', {
      p_listing_id: listingId,
      p_user_id: userId,
    });
    if (error) return [];
    return data ?? [];
  },
};
