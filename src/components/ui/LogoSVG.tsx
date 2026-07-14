import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Line, Polyline, G, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

// ─── Icon mark only (leaf + exchange arrows) ─────────────────────────────────
interface LogoMarkProps {
  size?: number;
  onDark?: boolean;
}

export function LogoMark({ size = 64, onDark = false }: LogoMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="markGradLight" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#2EC786" />
          <Stop offset="1" stopColor="#085041" />
        </LinearGradient>
        <LinearGradient id="markGradDark" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="rgba(255,255,255,0.28)" />
          <Stop offset="1" stopColor="rgba(255,255,255,0.08)" />
        </LinearGradient>
      </Defs>

      {/* Background rounded square */}
      <Rect
        x="0" y="0" width="80" height="80" rx="20" ry="20"
        fill={onDark ? 'url(#markGradDark)' : 'url(#markGradLight)'}
      />
      {onDark && (
        <Rect
          x="1.2" y="1.2" width="77.6" height="77.6" rx="19" ry="19"
          fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"
        />
      )}

      {/* Leaf */}
      <Path
        d="M40 9 C55 18 60 35 53 49 C49 58 40 63 40 63 C40 63 31 58 27 49 C20 35 25 18 40 9 Z"
        fill="white"
        opacity={onDark ? 0.92 : 1}
      />

      {/* Leaf center vein */}
      <Line
        x1="40" y1="13" x2="40" y2="60"
        stroke={onDark ? 'rgba(29,158,117,0.7)' : '#0A5C43'}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="2.5,2.2"
      />

      {/* Exchange arrow → upper */}
      <G
        stroke={onDark ? 'rgba(29,158,117,0.9)' : '#0A5C43'}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Line x1="25" y1="32" x2="48" y2="32" />
        <Polyline points="43,28 48,32 43,36" />
      </G>

      {/* Exchange arrow ← lower */}
      <G
        stroke={onDark ? 'rgba(29,158,117,0.9)' : '#0A5C43'}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Line x1="52" y1="46" x2="29" y2="46" />
        <Polyline points="34,42 29,46 34,50" />
      </G>
    </Svg>
  );
}

// ─── Full wordmark logo (icon + text) ────────────────────────────────────────
interface LogoProps {
  iconSize?: number;
  onDark?: boolean;
  showTagline?: boolean;
}

export function Logo({ iconSize = 64, onDark = true, showTagline = false }: LogoProps) {
  const nameColor = onDark ? '#FFFFFF' : '#0A5C43';
  const subtitleColor = onDark ? 'rgba(255,255,255,0.82)' : '#1D9E75';
  const taglineColor = onDark ? 'rgba(255,255,255,0.62)' : '#6B9E8A';

  return (
    <View style={styles.wrap}>
      <LogoMark size={iconSize} onDark={onDark} />
      <View style={styles.textBlock}>
        <Text style={styles.nameRow}>
          <Text style={[styles.nameLight, { color: nameColor }]}>Eco</Text>
          <Text style={[styles.nameBold, { color: nameColor }]}>Trueque</Text>
        </Text>
        <Text style={[styles.country, { color: subtitleColor }]}>Venezuela</Text>
      </View>
      {showTagline && (
        <Text style={[styles.tagline, { color: taglineColor }]}>
          Intercambia. Cuida el planeta.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  textBlock: { alignItems: 'center', gap: 2 },
  nameRow: { fontSize: 36, letterSpacing: -0.5 },
  nameLight: { fontWeight: '300' },
  nameBold: { fontWeight: '800' },
  country: { fontSize: 11, fontWeight: '600', letterSpacing: 5.5 },
  tagline: { fontSize: 13, fontStyle: 'italic' },
});
