import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '@stores/themeStore';

// Tema efectivo de la app: el elegido en el perfil o, con "Tema del sistema", el del dispositivo.
// En la web Appearance.setColorScheme no tiene efecto, por eso no basta con el hook de React Native.
export function useColorScheme(): 'light' | 'dark' {
  const system = useSystemColorScheme();
  const mode = useThemeStore((s) => s.mode);
  if (mode === 'system') return system === 'dark' ? 'dark' : 'light';
  return mode;
}
