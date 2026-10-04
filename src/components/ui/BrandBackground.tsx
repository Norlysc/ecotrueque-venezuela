import type { ReactNode } from 'react';
import { View, StyleSheet, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BrandBackgroundProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Fondo de marca (igual al de los mockups): degradado diagonal verde, un brillo
// claro arriba a la izquierda y dos círculos translúcidos decorativos.
export function BrandBackground({ children, style }: BrandBackgroundProps) {
  return (
    <LinearGradient
      colors={['#0A5C43', '#0F6E56', '#1D9E75']}
      locations={[0, 0.45, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.root, style]}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.glow, Platform.OS === 'web' && ({ filter: 'blur(90px)' } as any)]} />
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  glow: {
    position: 'absolute',
    left: -260,
    top: -320,
    width: 820,
    height: 720,
    borderRadius: 410,
    backgroundColor: '#2EC786',
    opacity: Platform.OS === 'web' ? 0.55 : 0.18,
  },
  circleTopRight: {
    position: 'absolute',
    right: -180,
    top: -220,
    width: 620,
    height: 620,
    borderRadius: 310,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circleBottomLeft: {
    position: 'absolute',
    left: -140,
    bottom: -200,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
