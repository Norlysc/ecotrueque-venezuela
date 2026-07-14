import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { listingsService } from '@services/listings.service';
import { useLocationStore } from '@stores/locationStore';
import { useAuthStore } from '@stores/authStore';
import { supabase } from '@lib/supabase';
import type { NearbyFilter, Listing } from '@/types/app.types';
import type { CategoryId } from '@constants/categories';

export const LISTING_KEYS = {
  all: ['listings'] as const,
  nearby: (filter: Partial<NearbyFilter>) => ['listings', 'nearby', filter] as const,
  detail: (id: string) => ['listings', 'detail', id] as const,
  user: (userId: string) => ['listings', 'user', userId] as const,
  favorites: (userId: string) => ['listings', 'favorites', userId] as const,
  matches: (listingId: string) => ['listings', 'matches', listingId] as const,
};

export function useNearbyListings(filter?: {
  category?: CategoryId;
  listing_type?: 'good' | 'service';
  search_query?: string;
  radius_km?: number;
}) {
  const { latitude, longitude, hasPermission } = useLocationStore();
  const { user } = useAuthStore();
  const lat = latitude ?? 9.3200;
  const lng = longitude ?? -70.6067;
  // Sin permiso GPS usamos radio amplio para mostrar todo el estado
  const radius = filter?.radius_km ?? (hasPermission ? 50 : 500);

  return useQuery({
    queryKey: LISTING_KEYS.nearby({ ...filter, latitude: lat, longitude: lng, radius, userId: user?.id }),
    queryFn: () =>
      listingsService.getNearby({
        latitude: lat,
        longitude: lng,
        radius_km: radius,
        category: filter?.category,
        listing_type: filter?.listing_type,
        search_query: filter?.search_query,
      }, user?.id),
    staleTime: 1000 * 60 * 3,
  });
}

export function useListingDetail(id: string) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: LISTING_KEYS.detail(id),
    queryFn: () => listingsService.getById(id, user?.id),
    enabled: !!id,
  });
}

export function useUserListings(userId?: string) {
  const { user } = useAuthStore();
  const uid = userId ?? user?.id ?? '';

  return useQuery({
    queryKey: LISTING_KEYS.user(uid),
    queryFn: () => listingsService.getByUser(uid),
    enabled: !!uid,
  });
}

export function useFavorites() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  return useQuery({
    queryKey: LISTING_KEYS.favorites(uid),
    queryFn: () => listingsService.getFavorites(uid),
    enabled: !!uid,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      listingId,
      isFavorited,
    }: {
      listingId: string;
      isFavorited: boolean;
    }) => listingsService.toggleFavorite(user?.id ?? '', listingId, isFavorited),
    onSuccess: (_, { isFavorited }) => {
      qc.invalidateQueries({ queryKey: LISTING_KEYS.all });
      Toast.show({
        type: 'success',
        text1: isFavorited ? 'Eliminado de favoritos' : 'Guardado en favoritos',
      });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Error al actualizar favorito' });
    },
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { latitude, longitude, city, state } = useLocationStore();

  return useMutation({
    mutationFn: (data: {
      type: string;
      category: CategoryId;
      title: string;
      description?: string;
      condition?: string;
      looking_for: string;
      tags?: string[];
      estimated_value_usd?: number;
      imageUris?: string[];
    }) =>
      listingsService.create({
        ...data,
        userId: user?.id ?? '',
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        city: city ?? undefined,
        state: state ?? undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LISTING_KEYS.all });
      Toast.show({
        type: 'success',
        text1: '¡Publicado!',
        text2: 'Tu trueque ya está visible en el mapa',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Error al publicar',
        text2: 'Por favor intenta de nuevo',
      });
    },
  });
}

export function useTradeMatches(listingId: string) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: LISTING_KEYS.matches(listingId),
    queryFn: () => listingsService.getMatches(listingId, user?.id ?? ''),
    enabled: !!listingId && !!user?.id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LISTING_KEYS.all });
      Toast.show({ type: 'success', text1: 'Publicación eliminada' });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Error al eliminar la publicación' });
    },
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Listing> }) =>
      listingsService.update(id, updates),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: LISTING_KEYS.all });
      qc.invalidateQueries({ queryKey: LISTING_KEYS.detail(id) });
      Toast.show({ type: 'success', text1: '¡Publicación actualizada!' });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Error al actualizar la publicación' });
    },
  });
}

export function useTotalFavorites(userId?: string) {
  return useQuery({
    queryKey: ['listings', 'total-favorites', userId] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('favorites_count')
        .eq('user_id', userId ?? '')
        .neq('status', 'deleted');
      if (error) return 0;
      return (data ?? []).reduce((sum, l) => sum + (l.favorites_count ?? 0), 0);
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function usePublicUserListings(userId: string) {
  return useQuery({
    queryKey: ['listings', 'user-public', userId] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}
