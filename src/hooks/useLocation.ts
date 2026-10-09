import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '@stores/locationStore';

// App dirigida al estado Trujillo — Valera como centro predeterminado
// Ubicación por defecto: Valera, estado Trujillo
const VALERA_FALLBACK = { latitude: 9.3200, longitude: -70.6067 };
// Si el GPS está más lejos que esto de Valera, se usa Valera (la app es para el estado Trujillo)
const MAX_DISTANCE_KM = 40;

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useLocation() {
  const { setLocation, setAddress, setPermission, setLoading } = useLocationStore();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) return;

        if (status !== 'granted') {
          setPermission(false);
          setLocation(VALERA_FALLBACK.latitude, VALERA_FALLBACK.longitude);
          setAddress('Valera', 'Trujillo');
          setLoading(false);
          return;
        }

        setPermission(true);

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;

        const { latitude, longitude } = location.coords;

        // Fuera del área de Valera: explorar desde Valera, estado Trujillo
        if (distanceKm(latitude, longitude, VALERA_FALLBACK.latitude, VALERA_FALLBACK.longitude) > MAX_DISTANCE_KM) {
          setLocation(VALERA_FALLBACK.latitude, VALERA_FALLBACK.longitude);
          setAddress('Valera', 'Trujillo');
          return;
        }

        setLocation(latitude, longitude);

        try {
          const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (isMounted && address) {
            setAddress(address.city ?? address.district ?? null, address.region ?? null);
          }
        } catch {
          setAddress('Valera', 'Trujillo');
        }
      } catch {
        if (isMounted) {
          setLocation(VALERA_FALLBACK.latitude, VALERA_FALLBACK.longitude);
          setAddress('Valera', 'Trujillo');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, []);
}
