import { useQuery } from '@tanstack/react-query';
import { safeSpotsService } from '@services/safeSpots.service';

/** Sitios seguros sugeridos alrededor de un punto; solo consulta cuando se muestran en el mapa */
export function useSafeSpots(latitude: number, longitude: number, radiusKm: number, enabled: boolean) {
  return useQuery({
    queryKey: ['safeSpots', latitude.toFixed(3), longitude.toFixed(3), radiusKm] as const,
    queryFn: () => safeSpotsService.getNearby(latitude, longitude, radiusKm),
    enabled,
    staleTime: 1000 * 60 * 30,
  });
}
