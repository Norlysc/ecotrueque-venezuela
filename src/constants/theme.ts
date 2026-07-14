export const COLORS = {
  primary: '#1D9E75',
  primaryDark: '#0F6E56',
  primaryDarker: '#085041',
  primaryLight: '#5DCAA5',
  primaryLighter: '#97C459',

  secondary: '#7F77DD',
  secondaryDark: '#5E56C4',
  secondaryLight: '#A9A3E8',

  accent: '#EF9F27',
  accentDark: '#C87E10',
  accentLight: '#F7C97A',

  error: '#E24B4A',
  errorDark: '#B83232',
  errorLight: '#EE8080',

  success: '#34C759',
  successDark: '#1E9E3E',
  successLight: '#7ADB9A',

  warning: '#FF9F0A',
  warningDark: '#CC7D00',
  warningLight: '#FFCC66',

  info: '#378ADD',
  infoDark: '#2260B0',
  infoLight: '#7BB4EC',

  white: '#FFFFFF',
  black: '#000000',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
} as const;

export const THEME = {
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceSecondary: '#F0F2F5',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    text: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    card: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.5)',
  },
  dark: {
    background: '#0D0D0C',
    surface: '#1A1A18',
    surfaceSecondary: '#252523',
    border: '#2D2D2B',
    borderLight: '#232321',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    textInverse: '#111827',
    tabBar: '#141413',
    tabBarBorder: '#2D2D2B',
    card: '#1A1A18',
    overlay: 'rgba(0,0,0,0.7)',
  },
} as const;

export const TYPOGRAPHY = {
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const SHADOWS = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  green: {
    shadowColor: '#1D9E75',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const ECO_LEVELS = {
  seedling: {
    id: 'seedling' as const,
    label: 'Semilla',
    emoji: '🌱',
    color: '#97C459',
    minPoints: 0,
    maxPoints: 99,
    description: 'Estás comenzando tu camino ecológico',
  },
  sprout: {
    id: 'sprout' as const,
    label: 'Brote',
    emoji: '🌿',
    color: '#5DCAA5',
    minPoints: 100,
    maxPoints: 299,
    description: 'Ya estás haciendo una diferencia',
  },
  guardian: {
    id: 'guardian' as const,
    label: 'Guardián',
    emoji: '🍃',
    color: '#1D9E75',
    minPoints: 300,
    maxPoints: 699,
    description: 'Eres un guardián del ambiente',
  },
  protector: {
    id: 'protector' as const,
    label: 'Protector',
    emoji: '🌳',
    color: '#0F6E56',
    minPoints: 700,
    maxPoints: 1499,
    description: 'Tu impacto se siente en la comunidad',
  },
  hero: {
    id: 'hero' as const,
    label: 'Héroe Eco',
    emoji: '🦋',
    color: '#7F77DD',
    minPoints: 1500,
    maxPoints: 2999,
    description: 'Eres un héroe del medio ambiente',
  },
  legend: {
    id: 'legend' as const,
    label: 'Leyenda Verde',
    emoji: '🌍',
    color: '#EF9F27',
    minPoints: 3000,
    maxPoints: Infinity,
    description: 'Una leyenda de la economía circular',
  },
} as const;

export type EcoLevelId = keyof typeof ECO_LEVELS;

export const getEcoLevel = (points: number): EcoLevelId => {
  if (points >= 3000) return 'legend';
  if (points >= 1500) return 'hero';
  if (points >= 700) return 'protector';
  if (points >= 300) return 'guardian';
  if (points >= 100) return 'sprout';
  return 'seedling';
};
