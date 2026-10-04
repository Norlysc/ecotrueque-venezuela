import { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing, AccessibilityInfo, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { TYPOGRAPHY, SPACING } from '@constants/theme';

// Bloque institucional que va arriba en las pantallas de acceso: logo de la
// universidad con un brillo/halo que titila, facultad, autores y tutora.
export function UniversityBadge({ style }: { style?: StyleProp<ViewStyle> }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (reduce || cancelled) return;
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.in(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
          ])
        );
        loop.start();
      });

    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [pulse]);

  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.28] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  const logoOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.78] });
  const logoScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.logoArea}>
        <Animated.View style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]} />
        <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Image source={require('../../../assets/logo-uvm.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>
      </View>
      <Text style={styles.university}>Universidad Valle del Momboy</Text>
      <Text style={styles.faculty}>Facultad de Ingeniería</Text>
      <View style={styles.credits}>
        <Text style={styles.credit}>
          <Text style={styles.creditLabel}>Autores: </Text>Rhonny Jaimes · Norlys Castañeda
        </Text>
        <Text style={styles.credit}>
          <Text style={styles.creditLabel}>Tutora: </Text>Caryuly Rosales
        </Text>
      </View>
    </View>
  );
}

const LOGO = 96;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 20,
    backgroundColor: 'rgba(8, 60, 45, 0.45)',
    marginBottom: SPACING.xl,
    maxWidth: 520,
    alignSelf: 'center',
  },
  logoArea: {
    width: LOGO + 24,
    height: LOGO + 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  halo: {
    position: 'absolute',
    width: LOGO + 8,
    height: LOGO + 8,
    borderRadius: (LOGO + 8) / 2,
    backgroundColor: '#B5E36A',
  },
  logoWrap: {
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: { width: LOGO - 6, height: LOGO - 6 },
  university: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    textAlign: 'center',
  },
  faculty: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    textAlign: 'center',
  },
  credits: { marginTop: SPACING.sm, alignItems: 'center', gap: 2 },
  credit: { color: 'rgba(255,255,255,0.9)', fontSize: TYPOGRAPHY.size.sm, textAlign: 'center' },
  creditLabel: { fontWeight: TYPOGRAPHY.weight.bold, color: '#FFFFFF' },
});
