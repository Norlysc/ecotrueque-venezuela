import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { COLORS } from '@constants/theme';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  isDark?: boolean;
}

const SIZES = {
  sm:  { icon: 32, name: 16, tag: 7  },
  md:  { icon: 48, name: 24, tag: 9  },
  lg:  { icon: 64, name: 32, tag: 11 },
  xl:  { icon: 88, name: 44, tag: 14 },
};

function IconMark({ size, gradId }: { size: number; gradId: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#2EC786" />
          <Stop offset="1" stopColor="#0A5C43" />
        </LinearGradient>
      </Defs>

      {/* Fondo redondeado */}
      <Rect x="0" y="0" width="80" height="80" rx="18" fill={`url(#${gradId})`} />

      {/* Hoja (blanca) */}
      <Path
        d="M40 10 C53 19 58 34 52 47 C48 56 40 60 40 60 C40 60 32 56 28 47 C22 34 27 19 40 10Z"
        fill="white"
      />

      {/* Nervio central de la hoja */}
      <Line
        x1="40" y1="14" x2="40" y2="57"
        stroke="#0E6A47" strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Flecha derecha → intercambio superior */}
      <G stroke="#0E6A47" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Line x1="27" y1="34" x2="49" y2="34" />
        <Path d="M44 30 L49 34 L44 38" fill="none" />
      </G>

      {/* Flecha izquierda ← intercambio inferior */}
      <G stroke="#0E6A47" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Line x1="50" y1="45" x2="30" y2="45" />
        <Path d="M35 41 L30 45 L35 49" fill="none" />
      </G>
    </Svg>
  );
}

export function Logo({ size = 'md', variant = 'full', isDark = false }: LogoProps) {
  const { icon, name, tag } = SIZES[size];
  const gradId = `logoGrad_${size}`;

  if (variant === 'icon') {
    return <IconMark size={icon} gradId={gradId} />;
  }

  const ecoColor  = isDark ? '#7EDDB8' : COLORS.primary;
  const boldColor = isDark ? '#FFFFFF' : '#0A5C43';
  const tagColor  = isDark ? 'rgba(255,255,255,0.45)' : '#6B9E8A';

  return (
    <View style={styles.container}>
      <IconMark size={icon} gradId={gradId} />
      <View style={[styles.textBlock, { marginLeft: icon * 0.2 }]}>
        <View style={styles.nameRow}>
          <Text style={[styles.eco, { fontSize: name, color: ecoColor }]}>eco</Text>
          <Text style={[styles.trueque, { fontSize: name, color: boldColor }]}>trueque</Text>
        </View>
        <Text style={[styles.tagline, { fontSize: tag, color: tagColor, letterSpacing: tag * 0.45 }]}>
          VENEZUELA
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBlock: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  eco: {
    fontWeight: '300',
    includeFontPadding: false,
  },
  trueque: {
    fontWeight: '800',
    includeFontPadding: false,
  },
  tagline: {
    fontWeight: '500',
    textTransform: 'uppercase',
    marginTop: 1,
  },
});
