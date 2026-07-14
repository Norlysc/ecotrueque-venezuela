import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '@stores/locationStore';

// App dirigida al estado Trujillo — Valera como centro predeterminado
const CARACAS_FALLBACK = { latitude: 9.3200, longitude: -70.6067 };

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
          setLocation(CARACAS_FALLBACK.latitude, CARACAS_FALLBACK.longitude);
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
        setLocation(latitude, longitude);

        try {
          const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (isMounted && address) {
            setAddress(address.city ?? address.district ?? null, address.region ?? null);
          }
        } catch {
          setAddress('Caracas', 'Distrito Capital');
        }
      } catch {
        if (isMounted) {
          setLocation(CARACAS_FALLBACK.latitude, CARACAS_FALLBACK.longitude);
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
