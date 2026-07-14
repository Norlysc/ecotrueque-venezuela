import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@constants/theme';

// ─── Ring chart (anillo circular de progreso) ─────────────────────────────────
interface RingProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 a 1
  color: string;
  bgColor?: string;
  label: string;
  valueText: string;
  emoji: string;
  isDark?: boolean;
}

export function RingChart({
  size = 88,
  strokeWidth = 10,
  progress,
  color,
  bgColor,
  label,
  valueText,
  emoji,
  isDark = false,
}: RingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const fillOffset = circumference * (1 - clampedProgress);

  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: clampedProgress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  const animatedOffset = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, circumference * (1 - clampedProgress)],
  });

  const pct = Math.round(clampedProgress * 100);

  return (
    <View style={styles.ringWrap}>
      <View style={{ position: 'relative', width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Pista de fondo */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor ?? (isDark ? '#2A2A28' : '#E8EDE8')}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Arco de progreso */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={fillOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {/* Centro */}
        <View style={[styles.ringCenter, { width: size, height: size }]}>
          <Text style={styles.ringEmoji}>{emoji}</Text>
          <Text style={[styles.ringPct, { color }]}>{pct}%</Text>
        </View>
      </View>
      <Text style={[styles.ringValue, { color: isDark ? '#E5E7EB' : '#111' }]}>{valueText}</Text>
      <Text style={[styles.ringLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{label}</Text>
    </View>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
interface DonutSegment {
  label: string;
  value: number;
  color: string;
  emoji: string;
}

interface DonutProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  isDark?: boolean;
}

export function DonutChart({ segments, size = 160, strokeWidth = 26, isDark = false }: DonutProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  let accumulated = 0;

  return (
    <View style={styles.donutWrap}>
      <Svg width={size} height={size}>
        {/* Fondo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? '#2A2A28' : '#E8EDE8'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((seg, i) => {
          if (seg.value <= 0) return null;
          const pct = seg.value / total;
          const dashLen = circumference * pct - 3;
          const dashOffset = -(circumference * accumulated);
          accumulated += pct;
          return (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${Math.max(dashLen, 0)} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </Svg>
      {/* Leyenda */}
      <View style={styles.donutLegend}>
        {segments.map((seg, i) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <View key={i} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
              <Text style={[styles.legendLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                {seg.emoji} {seg.label}
              </Text>
              <Text style={[styles.legendPct, { color: seg.color }]}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Barra horizontal con animación ──────────────────────────────────────────
interface BarProps {
  label: string;
  sublabel?: string;
  value: number;
  max: number;
  color: string;
  formatValue?: (v: number) => string;
  isDark?: boolean;
}

export function AnimatedBar({
  label,
  sublabel,
  value,
  max,
  color,
  formatValue,
  isDark = false,
}: BarProps) {
  const progress = Math.min(Math.max(value / (max || 1), 0), 1);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const pct = Math.round(progress * 100);
  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <View style={styles.barWrap}>
      <View style={styles.barHeader}>
        <View>
          <Text style={[styles.barLabel, { color: isDark ? '#E5E7EB' : '#111827' }]}>{label}</Text>
          {sublabel && (
            <Text style={[styles.barSublabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{sublabel}</Text>
          )}
        </View>
        <View style={styles.barRight}>
          <Text style={[styles.barValue, { color }]}>{displayValue}</Text>
          <Text style={[styles.barPct, { color: isDark ? '#9CA3AF' : '#9CA3AF' }]}>{pct}%</Text>
        </View>
      </View>
      <View style={[styles.barTrack, { backgroundColor: isDark ? '#2A2A28' : '#E5E7EB' }]}>
        <Animated.View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ring
  ringWrap: { alignItems: 'center', gap: 4, flex: 1 },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  ringEmoji: { fontSize: 18 },
  ringPct: { fontSize: 11, fontWeight: '800' },
  ringValue: { fontSize: TYPOGRAPHY.size.sm, fontWeight: '700' },
  ringLabel: { fontSize: 10, textAlign: 'center' },

  // Donut
  donutWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  donutLegend: { flex: 1, gap: SPACING.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: TYPOGRAPHY.size.sm },
  legendPct: { fontSize: TYPOGRAPHY.size.sm, fontWeight: '700', minWidth: 36, textAlign: 'right' },

  // Bar
  barWrap: { gap: SPACING.xs },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barLabel: { fontSize: TYPOGRAPHY.size.sm, fontWeight: '600' },
  barSublabel: { fontSize: 10 },
  barRight: { alignItems: 'flex-end' },
  barValue: { fontSize: TYPOGRAPHY.size.sm, fontWeight: '700' },
  barPct: { fontSize: 10 },
  barTrack: {
    height: 8,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
});
