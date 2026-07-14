import { create } from 'zustand';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = '@ecotrueque/theme';

interface ThemeState {
  mode: ThemeMode;
}

interface ThemeActions {
  setMode: (mode: ThemeMode) => Promise<void>;
  loadSaved: () => Promise<void>;
}

export const useThemeStore = create<ThemeState & ThemeActions>((set) => ({
  mode: 'system',

  setMode: async (mode) => {
    set({ mode });
    // Afecta todos los useColorScheme() de la app sin tocar cada archivo
    Appearance.setColorScheme(mode === 'system' ? null : mode);
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  },

  loadSaved: async () => {
    try {
      const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as ThemeMode | null;
      if (saved) {
        set({ mode: saved });
        Appearance.setColorScheme(saved === 'system' ? null : saved);
      }
    } catch {
      // primera vez: usa el sistema
    }
  },
}));
