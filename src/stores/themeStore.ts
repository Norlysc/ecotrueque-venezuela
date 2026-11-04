import { create } from 'zustand';
import { Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = '@ecotrueque/theme';

// En móvil también se ajustan los componentes nativos (teclado, alertas). En la web
// Appearance.setColorScheme no existe y lanzaría un error; ahí basta con hooks/useColorScheme.
const aplicarAlSistema = (mode: ThemeMode) => {
  if (Platform.OS !== 'web') Appearance.setColorScheme(mode === 'system' ? null : mode);
};

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
    await AsyncStorage.setItem(STORAGE_KEY, mode);
    aplicarAlSistema(mode);
  },

  loadSaved: async () => {
    try {
      const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as ThemeMode | null;
      if (saved) {
        set({ mode: saved });
        aplicarAlSistema(saved);
      }
    } catch {
      // primera vez: usa el sistema
    }
  },
}));
