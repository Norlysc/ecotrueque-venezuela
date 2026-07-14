import { ExpoConfig, ConfigContext } from 'expo/config';
import * as fs from 'fs';

const hasGoogleServicesAndroid = fs.existsSync('./google-services.json');
const hasGoogleServicesIos = fs.existsSync('./GoogleService-Info.plist');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'EcoTrueque',
  slug: 'ecotrueque',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0F6E56',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.ecotrueque.app',
    buildNumber: '1',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'EcoTrueque necesita tu ubicación para mostrarte trueques cercanos.',
      NSCameraUsageDescription:
        'Necesitamos acceso a la cámara para fotografiar productos.',
      NSPhotoLibraryUsageDescription:
        'Necesitamos acceso a tus fotos para publicar imágenes.',
    },
    ...(hasGoogleServicesIos && { googleServicesFile: './GoogleService-Info.plist' }),
  },
  android: {
    package: 'com.ecotrueque.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0F6E56',
    },
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
    ],
    ...(hasGoogleServicesAndroid && { googleServicesFile: './google-services.json' }),
  },
  plugins: [
    'expo-router',
    'expo-font',
    ['expo-notifications', {
      icon: './assets/notification-icon.png',
      color: '#1D9E75',
    }],
    ['expo-location', {
      locationAlwaysAndWhenInUsePermission:
        'EcoTrueque necesita tu ubicación para mostrar trueques cercanos.',
    }],
    ['expo-image-picker', {
      photosPermission: 'EcoTrueque necesita acceso a tus fotos.',
      cameraPermission: 'EcoTrueque necesita la cámara para fotografiar productos.',
    }],
  ],
  web: {
    favicon: './assets/logo.svg',
    name: 'EcoTrueque Venezuela',
    shortName: 'EcoTrueque',
    description: 'Plataforma de trueques ecológicos de Venezuela',
    themeColor: '#0F6E56',
    backgroundColor: '#0F6E56',
  },
  experiments: { typedRoutes: true },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
  scheme: 'ecotrueque',
});
