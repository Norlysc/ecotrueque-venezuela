import { create } from 'zustand';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  hasPermission: boolean;
  isLoading: boolean;
}

interface LocationActions {
  setLocation: (latitude: number, longitude: number) => void;
  setAddress: (city: string | null, state: string | null) => void;
  setPermission: (hasPermission: boolean) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useLocationStore = create<LocationState & LocationActions>((set) => ({
  latitude: null,
  longitude: null,
  city: null,
  state: null,
  hasPermission: false,
  isLoading: false,

  setLocation: (latitude, longitude) => set({ latitude, longitude }),

  setAddress: (city, state) => set({ city, state }),

  setPermission: (hasPermission) => set({ hasPermission }),

  setLoading: (isLoading) => set({ isLoading }),
}));
