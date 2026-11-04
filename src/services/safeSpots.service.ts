import { supabase } from '@lib/supabase';

export interface SafeSpot {
  id: string;
  name: string;
  type: 'police' | 'mall' | 'metro' | 'bank' | 'hospital' | 'public';
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  is_24h: boolean;
  phone: string | null;
  distance_km: number;
}

export const SAFE_SPOT_TYPE_LABEL: Record<SafeSpot['type'], string> = {
  police: 'Cuerpo de seguridad',
  mall: 'Centro comercial',
  metro: 'Estación',
  bank: 'Banco',
  hospital: 'Centro de salud',
  public: 'Lugar público',
};

// Sitios públicos sugeridos para el encuentro (tabla safe_spots, RPC get_nearby_safe_spots en 003_functions.sql).
// Son referencias: el lugar del intercambio lo acuerdan las dos personas en el chat.
export const safeSpotsService = {
  async getNearby(latitude: number, longitude: number, radiusKm: number): Promise<SafeSpot[]> {
    const { data, error } = await supabase.rpc('get_nearby_safe_spots', {
      p_latitude: latitude,
      p_longitude: longitude,
      p_radius_km: Math.round(radiusKm),
    });
    if (error) throw error;
    return (data ?? []) as SafeSpot[];
  },
};
